import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  servizio_id: string;
  tipo_evento: "assegnato" | "completato" | "annullato" | "richiesta";
}

interface EmailTemplate {
  subject: string;
  html: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY non configurata");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { servizio_id, tipo_evento }: NotificationRequest = await req.json();

    console.log(`[send-notification] Invio notifica ${tipo_evento} per servizio ${servizio_id}`);

    // 1. Fetch servizio con tutti i dettagli
    const { data: servizio, error: servizioError } = await supabase
      .from("servizi")
      .select(`
        *,
        aziende:azienda_id(nome, email),
        autista:assegnato_a(first_name, last_name, email)
      `)
      .eq("id", servizio_id)
      .single();

    if (servizioError || !servizio) {
      throw new Error(`Servizio non trovato: ${servizioError?.message}`);
    }

    // 2. Costruisci lista destinatari automatica
    const destinatariMap = new Map<string, { id: string | null; nome: string; email: string }>();

    // 2a. Destinatario principale: referente o azienda
    if (servizio.referente_id) {
      // Fetch email referente
      const { data: referente } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name")
        .eq("id", servizio.referente_id)
        .single();

      if (referente?.email) {
        const nomeReferente = `${referente.first_name || ""} ${referente.last_name || ""}`.trim() || "Referente";
        destinatariMap.set(referente.email.toLowerCase(), {
          id: null,
          nome: nomeReferente,
          email: referente.email,
        });
        console.log(`[send-notification] ✅ Aggiunto referente: ${referente.email}`);
      }
    } else if (servizio.aziende?.email) {
      // Usa email azienda come fallback
      destinatariMap.set(servizio.aziende.email.toLowerCase(), {
        id: null,
        nome: servizio.aziende.nome || "Azienda",
        email: servizio.aziende.email,
      });
      console.log(`[send-notification] ✅ Aggiunto azienda: ${servizio.aziende.email}`);
    }

    // 2b. Aggiungi email passeggeri del servizio
    const { data: serviziPasseggeri } = await supabase
      .from("servizi_passeggeri")
      .select("passeggero_id, email_inline")
      .eq("servizio_id", servizio_id);

    if (serviziPasseggeri && serviziPasseggeri.length > 0) {
      // Raccogli ID passeggeri validi
      const passeggeroIds = serviziPasseggeri
        .map((sp: any) => sp.passeggero_id)
        .filter((id: any) => id);
      
      if (passeggeroIds.length > 0) {
        const { data: passeggeri } = await supabase
          .from("passeggeri")
          .select("id, nome_cognome, email")
          .in("id", passeggeroIds);

        passeggeri?.forEach((p: any) => {
          if (p.email && !destinatariMap.has(p.email.toLowerCase())) {
            destinatariMap.set(p.email.toLowerCase(), {
              id: null,
              nome: p.nome_cognome || "Passeggero",
              email: p.email,
            });
            console.log(`[send-notification] ✅ Aggiunto passeggero: ${p.email}`);
          }
        });
      }

      // Aggiungi anche email inline dei passeggeri
      serviziPasseggeri.forEach((sp: any) => {
        if (sp.email_inline && !destinatariMap.has(sp.email_inline.toLowerCase())) {
          destinatariMap.set(sp.email_inline.toLowerCase(), {
            id: null,
            nome: "Passeggero",
            email: sp.email_inline,
          });
          console.log(`[send-notification] ✅ Aggiunto passeggero inline: ${sp.email_inline}`);
        }
      });
    }

    // 2c. Aggiungi email notifiche aggiuntive (configurate manualmente)
    const { data: emailLinks, error: emailError } = await supabase
      .from("servizi_email_notifiche")
      .select(`
        email_notifiche:email_notifica_id(id, nome, email, attivo)
      `)
      .eq("servizio_id", servizio_id);

    if (emailError) {
      console.error("[send-notification] Errore fetch email notifiche:", emailError);
    }

    emailLinks?.forEach((link: any) => {
      const email = link.email_notifiche;
      if (email?.attivo && email?.email && !destinatariMap.has(email.email.toLowerCase())) {
        destinatariMap.set(email.email.toLowerCase(), {
          id: email.id,
          nome: email.nome || "Contatto",
          email: email.email,
        });
        console.log(`[send-notification] ✅ Aggiunto email notifica: ${email.email}`);
      }
    });

    // Converti Map in array
    const destinatari = Array.from(destinatariMap.values());

    console.log(`[send-notification] Totale destinatari: ${destinatari.length}`);

    if (destinatari.length === 0) {
      console.log("[send-notification] Nessun destinatario configurato");
      return new Response(
        JSON.stringify({ success: true, message: "Nessun destinatario configurato", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Genera template email
    const template = generateEmailTemplate(servizio, tipo_evento);

    // 4. Invia email a tutti i destinatari
    let sentCount = 0;
    let failedCount = 0;

    for (const dest of destinatari) {
      try {
        // Chiamata API Resend
        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "TaxiTime <noreply@taxitime.app>",
            to: [dest.email],
            subject: template.subject,
            html: template.html,
          }),
        });

        const resendData = await resendResponse.json();

        if (resendResponse.ok) {
          // Log successo
          await supabase.from("email_logs").insert({
            servizio_id,
            email_notifica_id: dest.id,
            destinatario: dest.email,
            oggetto: template.subject,
            template: tipo_evento,
            stato: "sent",
            resend_id: resendData.id,
            sent_at: new Date().toISOString(),
          });
          sentCount++;
          console.log(`[send-notification] ✅ Email inviata a ${dest.email}`);
        } else {
          // Log errore
          await supabase.from("email_logs").insert({
            servizio_id,
            email_notifica_id: dest.id,
            destinatario: dest.email,
            oggetto: template.subject,
            template: tipo_evento,
            stato: "failed",
            error_message: resendData.message || JSON.stringify(resendData),
          });
          failedCount++;
          console.error(`[send-notification] ❌ Errore invio a ${dest.email}:`, resendData);
        }
      } catch (emailError: any) {
        // Log errore catch
        await supabase.from("email_logs").insert({
          servizio_id,
          email_notifica_id: dest.id,
          destinatario: dest.email,
          oggetto: template.subject,
          template: tipo_evento,
          stato: "failed",
          error_message: emailError.message,
        });
        failedCount++;
        console.error(`[send-notification] ❌ Eccezione invio a ${dest.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        total: destinatari.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[send-notification] Errore:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateEmailTemplate(servizio: any, tipo: string): EmailTemplate {
  const numeroServizio = servizio.numero_commessa || servizio.id_progressivo || servizio.id;
  const dataServizio = servizio.data_servizio 
    ? new Date(servizio.data_servizio).toLocaleDateString("it-IT", { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    : "Data non specificata";
  const orario = servizio.orario_servizio?.slice(0, 5) || "Orario non specificato";
  const partenza = `${servizio.citta_presa || ""} - ${servizio.indirizzo_presa || ""}`.trim() || "Non specificata";
  const destinazione = `${servizio.citta_destinazione || ""} - ${servizio.indirizzo_destinazione || ""}`.trim() || "Non specificata";
  const azienda = servizio.aziende?.nome || "Cliente privato";
  const autista = servizio.autista 
    ? `${servizio.autista.first_name || ""} ${servizio.autista.last_name || ""}`.trim() 
    : "Non assegnato";

  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 30px 20px; text-align: center; }
      .header h1 { margin: 0 0 10px 0; font-size: 24px; }
      .header h2 { margin: 0; font-size: 18px; font-weight: normal; opacity: 0.9; }
      .content { padding: 30px 20px; }
      .content p { margin: 0 0 15px 0; }
      .detail-box { background: #f8f9fa; border-left: 4px solid #1e3a5f; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0; }
      .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
      .detail-row:last-child { border-bottom: none; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      .status-confirmed { color: #28a745; }
      .status-completed { color: #17a2b8; }
      .status-cancelled { color: #dc3545; }
      .status-request { color: #ffc107; }
    </style>
  `;

  const templates: Record<string, EmailTemplate> = {
    assegnato: {
      subject: `✅ Servizio Confermato - ${numeroServizio}`,
      html: `
        <!DOCTYPE html>
        <html>
        ${baseStyle}
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 TaxiTime</h1>
              <h2 class="status-confirmed">Servizio Confermato</h2>
            </div>
            <div class="content">
              <p>Gentile Cliente,</p>
              <p>Il servizio <strong>${numeroServizio}</strong> è stato <strong>CONFERMATO</strong> e assegnato.</p>
              
              <div class="detail-box">
                <div class="detail-row">
                  📅 <strong>Data:</strong> ${dataServizio}
                </div>
                <div class="detail-row">
                  🕐 <strong>Orario:</strong> ${orario}
                </div>
                <div class="detail-row">
                  📍 <strong>Partenza:</strong> ${partenza}
                </div>
                <div class="detail-row">
                  🏁 <strong>Destinazione:</strong> ${destinazione}
                </div>
                <div class="detail-row">
                  👤 <strong>Autista:</strong> ${autista}
                </div>
                <div class="detail-row">
                  🏢 <strong>Cliente:</strong> ${azienda}
                </div>
              </div>
              
              <p>Per qualsiasi necessità, non esitate a contattarci.</p>
            </div>
            <div class="footer">
              <p><strong>TaxiTime</strong> - Servizio NCC Professionale</p>
              <p>Questa è un'email automatica, si prega di non rispondere.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    completato: {
      subject: `✅ Servizio Completato - ${numeroServizio}`,
      html: `
        <!DOCTYPE html>
        <html>
        ${baseStyle}
        <body>
          <div class="container">
            <div class="header">
              <h1>🚗 TaxiTime</h1>
              <h2 class="status-completed">Servizio Completato</h2>
            </div>
            <div class="content">
              <p>Gentile Cliente,</p>
              <p>Il servizio <strong>${numeroServizio}</strong> è stato <strong>COMPLETATO</strong> con successo.</p>
              
              <div class="detail-box">
                <div class="detail-row">
                  📅 <strong>Data:</strong> ${dataServizio}
                </div>
                <div class="detail-row">
                  📍 <strong>Partenza:</strong> ${partenza}
                </div>
                <div class="detail-row">
                  🏁 <strong>Destinazione:</strong> ${destinazione}
                </div>
              </div>
              
              <p>Grazie per aver scelto TaxiTime!</p>
            </div>
            <div class="footer">
              <p><strong>TaxiTime</strong> - Servizio NCC Professionale</p>
              <p>Questa è un'email automatica, si prega di non rispondere.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    annullato: {
      subject: `❌ Servizio Annullato - ${numeroServizio}`,
      html: `
        <!DOCTYPE html>
        <html>
        ${baseStyle}
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #721c24 0%, #a94442 100%);">
              <h1>🚗 TaxiTime</h1>
              <h2>Servizio Annullato</h2>
            </div>
            <div class="content">
              <p>Gentile Cliente,</p>
              <p>Il servizio <strong>${numeroServizio}</strong> è stato <strong>ANNULLATO</strong>.</p>
              
              <div class="detail-box" style="border-left-color: #dc3545;">
                <div class="detail-row">
                  📅 <strong>Data prevista:</strong> ${dataServizio}
                </div>
                <div class="detail-row">
                  📍 <strong>Partenza:</strong> ${partenza}
                </div>
                <div class="detail-row">
                  🏁 <strong>Destinazione:</strong> ${destinazione}
                </div>
              </div>
              
              <p>Per qualsiasi chiarimento, non esitate a contattarci.</p>
            </div>
            <div class="footer">
              <p><strong>TaxiTime</strong> - Servizio NCC Professionale</p>
              <p>Questa è un'email automatica, si prega di non rispondere.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    richiesta: {
      subject: `📬 Nuova Richiesta Servizio - ${numeroServizio}`,
      html: `
        <!DOCTYPE html>
        <html>
        ${baseStyle}
        <body>
          <div class="container">
            <div class="header" style="background: linear-gradient(135deg, #856404 0%, #b8860b 100%);">
              <h1>🚗 TaxiTime</h1>
              <h2>Nuova Richiesta</h2>
            </div>
            <div class="content">
              <p>È stata ricevuta una <strong>NUOVA RICHIESTA</strong> di servizio.</p>
              
              <div class="detail-box" style="border-left-color: #ffc107;">
                <div class="detail-row">
                  📅 <strong>Data richiesta:</strong> ${dataServizio}
                </div>
                <div class="detail-row">
                  🕐 <strong>Orario:</strong> ${orario}
                </div>
                <div class="detail-row">
                  📍 <strong>Partenza:</strong> ${partenza}
                </div>
                <div class="detail-row">
                  🏁 <strong>Destinazione:</strong> ${destinazione}
                </div>
                <div class="detail-row">
                  🏢 <strong>Cliente:</strong> ${azienda}
                </div>
              </div>
              
              <p>Accedi al sistema per gestire la richiesta.</p>
            </div>
            <div class="footer">
              <p><strong>TaxiTime</strong> - Servizio NCC Professionale</p>
              <p>Questa è un'email automatica, si prega di non rispondere.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
  };

  return templates[tipo] || templates.assegnato;
}
