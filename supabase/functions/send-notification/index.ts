import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { servizio_id, template_slug } = await req.json();
    
    console.log('[SEND-EMAIL] Start:', { servizio_id, template_slug });

    if (!template_slug) {
      console.warn('[SEND-EMAIL] No template_slug provided, skipping');
      return new Response(
        JSON.stringify({ success: false, message: 'No template_slug provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. FETCH CONFIG
    const { data: config, error: configError } = await supabaseAdmin
      .from('impostazioni')
      .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled')
      .maybeSingle();

    if (configError || !config) throw new Error(`Config error: ${configError?.message || 'No config found'}`);
    if (!config.email_enabled) {
      console.log('[SEND-EMAIL] Email disabled');
      return new Response(JSON.stringify({ success: false, message: 'Email disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 2. FETCH TEMPLATE
    const { data: template, error: templateError } = await supabaseAdmin
      .from('email_templates')
      .select('*')
      .eq('slug', template_slug)
      .maybeSingle();

    if (templateError) throw new Error(`Template error: ${templateError.message}`);
    if (!template) {
      console.warn('[SEND-EMAIL] No template found for slug:', template_slug);
      return new Response(
        JSON.stringify({ success: false, message: `No template found for: ${template_slug}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!template.attivo) {
      console.log('[SEND-EMAIL] Template disabled:', template_slug);
      return new Response(JSON.stringify({ success: false, message: 'Template disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 3. FETCH SERVIZIO
    const { data: servizio, error: servizioError } = await supabaseAdmin
      .from('servizi')
      .select(`
        *,
        aziende(*),
        referente:profiles!servizi_assegnato_a_fkey(email, first_name, last_name),
        autista:profiles!servizi_assegnato_a_fkey(email, first_name, last_name),
        veicoli(*),
        servizi_passeggeri(passeggeri(nome_cognome, email)),
        servizi_email_notifiche(email_notifiche(email, nome))
      `)
      .eq('id', servizio_id)
      .single();

    if (servizioError) throw new Error(`Servizio error: ${servizioError.message}`);

    // Fetch referente separately since there's no direct FK named servizi_referente_id_fkey
    let referente = null;
    if (servizio.referente_id) {
      const { data: refData } = await supabaseAdmin
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', servizio.referente_id)
        .single();
      referente = refData;
    }

    // 4. BUILD RECIPIENTS
    const recipients: { email: string; name: string }[] = [];
    
    if (referente?.email) {
      recipients.push({
        email: referente.email,
        name: `${referente.first_name || ''} ${referente.last_name || ''}`.trim()
      });
    }

    if (servizio.autista?.email && ['servizio_assegnato', 'servizio_completato'].includes(template_slug)) {
      recipients.push({
        email: servizio.autista.email,
        name: `${servizio.autista.first_name || ''} ${servizio.autista.last_name || ''}`.trim()
      });
    }

    if (servizio.servizi_passeggeri) {
      servizio.servizi_passeggeri.forEach((sp: any) => {
        if (sp.passeggeri?.email) {
          recipients.push({
            email: sp.passeggeri.email,
            name: sp.passeggeri.nome_cognome
          });
        }
      });
    }

    if (servizio.servizi_email_notifiche) {
      servizio.servizi_email_notifiche.forEach((sen: any) => {
        if (sen.email_notifiche?.email) {
          recipients.push({
            email: sen.email_notifiche.email,
            name: sen.email_notifiche.nome
          });
        }
      });
    }

    const uniqueRecipients = Array.from(
      new Map(recipients.map(r => [r.email.toLowerCase(), r])).values()
    );

    if (uniqueRecipients.length === 0) {
      console.log('[SEND-EMAIL] No recipients');
      return new Response(JSON.stringify({ success: false, message: 'No recipients' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[SEND-EMAIL] Recipients:', uniqueRecipients.length);

    // 5. BUILD EMAIL CONTENT
    const variables: Record<string, string> = {
      numero: servizio.numero_commessa || servizio.id_progressivo || servizio.id.split('-')[0].toUpperCase(),
      azienda_nome: servizio.aziende?.nome || '',
      data: new Date(servizio.data_servizio).toLocaleDateString('it-IT'),
      ora: servizio.orario_servizio?.slice(0, 5) || '',
      indirizzo_presa: servizio.indirizzo_presa || '',
      citta_presa: servizio.citta_presa || '',
      indirizzo_destinazione: servizio.indirizzo_destinazione || '',
      citta_destinazione: servizio.citta_destinazione || '',
      autista_nome: servizio.autista ? `${servizio.autista.first_name || ''} ${servizio.autista.last_name || ''}`.trim() : '',
      veicolo: servizio.veicoli ? `${servizio.veicoli.modello} ${servizio.veicoli.targa}` : '',
      note: servizio.note || '',
      data_completamento: new Date().toLocaleDateString('it-IT'),
      motivo: ''
    };

    let emailHtml = template.html_body;
    let emailSubject = template.subject;
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      emailHtml = emailHtml.replace(regex, variables[key]);
      emailSubject = emailSubject.replace(regex, variables[key]);
    });

    // 6. CHECK SMTP CONFIG
    if (!config.smtp_password_encrypted || !config.smtp_host || !config.smtp_user) {
      console.log('[SEND-EMAIL] SMTP not configured');
      return new Response(JSON.stringify({ success: false, message: 'SMTP not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 7. DECRYPT PASSWORD & CREATE SMTP CLIENT
    const password = atob(config.smtp_password_encrypted);
    
    const smtp = new SMTPClient({
      connection: {
        hostname: config.smtp_host,
        port: config.smtp_port,
        tls: config.smtp_secure,
        auth: {
          username: config.smtp_user,
          password: password
        }
      }
    });

    // 8. SEND EMAILS
    const results = { sent: 0, failed: 0, total: uniqueRecipients.length };
    const logs: any[] = [];

    for (let i = 0; i < uniqueRecipients.length; i++) {
      const recipient = uniqueRecipients[i];
      
      const logEntry: Record<string, any> = {
        servizio_id: servizio_id,
        template_slug: template_slug,
        template: template_slug,
        recipient_email: recipient.email,
        destinatario: recipient.email,
        subject: emailSubject,
        oggetto: emailSubject,
        sent_at: new Date().toISOString(),
        status: 'sent',
        stato: 'sent',
        error_message: null,
        smtp_response: null,
        smtp_message_id: null
      };

      try {
        const sendResult = await smtp.send({
          from: `${config.smtp_from_name || 'TaxiTime'} <${config.smtp_from_email || config.smtp_user}>`,
          to: [recipient.email],
          subject: emailSubject,
          html: emailHtml
        });

        results.sent++;
        logEntry.smtp_message_id = sendResult?.messageId || null;
        logEntry.smtp_response = 'OK';
        console.log(`[SEND-EMAIL] ✅ Sent to ${recipient.email}`);
        
      } catch (error: any) {
        results.failed++;
        logEntry.status = 'failed';
        logEntry.stato = 'failed';
        logEntry.error_message = error.message;
        logEntry.smtp_response = error.toString();
        console.error(`[SEND-EMAIL] ❌ Failed to ${recipient.email}:`, error.message);
      }

      logs.push(logEntry);

      // Rate limit: 100ms between sends
      if (i < uniqueRecipients.length - 1) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    await smtp.close();

    // 9. SAVE LOGS
    if (logs.length > 0) {
      const { error: logError } = await supabaseAdmin
        .from('email_logs')
        .insert(logs);

      if (logError) {
        console.error('[SEND-EMAIL] Log save error:', logError);
      }
    }

    console.log('[SEND-EMAIL] Complete:', results);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SEND-EMAIL] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
