import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// ─── DYNAMIC EMAIL BUILDER ────────────────────────────────────────────────────

type DynamicEmailTipo = 'richiesta_cliente' | 'conferma_presa_carico' | 'servizio_confermato';

function buildCompleteEmailHTML(data: {
  tipo: DynamicEmailTipo;
  servizio: any;
  passeggeri: any[];
  referente: any;
  azienda: any;
  autista?: any;
  veicolo?: any;
}): { html: string; subject: string } {
  const { tipo, servizio, passeggeri, referente, azienda, autista, veicolo } = data;

  const dataFormatted = new Date(servizio.data_servizio).toLocaleDateString('it-IT', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
  });
  const oraFormatted = servizio.orario_servizio?.slice(0, 5) || '';

  const subjects: Record<DynamicEmailTipo, string> = {
    'richiesta_cliente': `[TaxiTime] Richiesta Servizio - ${dataFormatted} ${oraFormatted}`,
    'conferma_presa_carico': `[TaxiTime] CONFERMATO - Servizio ${dataFormatted} ${oraFormatted}`,
    'servizio_confermato': `[TaxiTime] SERVIZIO CONFERMATO - ${dataFormatted} ${oraFormatted}`,
  };

  const headers: Record<DynamicEmailTipo, string> = {
    'richiesta_cliente': '📋 RICHIESTA SERVIZIO',
    'conferma_presa_carico': '✅ SERVIZIO PRESO IN CARICO',
    'servizio_confermato': '✅ SERVIZIO CONFERMATO',
  };

  // Build passenger stops HTML
  const passeggeriHtml = passeggeri.map((p: any, idx: number) => {
    const orarioPresa = p.orario_presa_personalizzato || oraFormatted;
    const indirizzoPresa = (p.luogo_presa_personalizzato || p.indirizzo_inline || p.indirizzo || '').trim() || 'Indirizzo da definire';
    const localitaPresa = (p.localita_presa_personalizzato || p.localita_inline || p.localita || '').trim();
    const nomePax = p.nome_cognome_inline || p.nome_cognome || `${p.nome || ''} ${p.cognome || ''}`.trim() || 'Passeggero';
    const email = p.email_inline || p.email || '';
    const telefono = p.telefono_inline || p.telefono || '';

    return `
        <div class="route-step intermediate">
          <div class="route-content">
            <div class="route-name">🚶 FERMATA ${idx + 1}: ${escapeHtml(nomePax)}</div>
            <div class="route-address">${escapeHtml(indirizzoPresa)}</div>
            ${localitaPresa ? `<div class="route-address">${escapeHtml(localitaPresa)}</div>` : ''}
            <div class="route-time">Orario previsto: ${escapeHtml(orarioPresa)}</div>
            ${email ? `<div class="route-time">📧 ${escapeHtml(email)}</div>` : ''}
            ${telefono ? `<div class="route-time">📱 ${escapeHtml(telefono)}</div>` : ''}
          </div>
        </div>`;
  }).join('\n');

  // Build per-passenger destinations (same logic as DettaglioServizio.tsx)
  const destinazioniHtml = (() => {
    const destMap = new Map<string, { indirizzo: string; citta: string; passeggeri: string[] }>();

    passeggeri.forEach((p: any) => {
      const haDestPers = !!p.destinazione_personalizzato;
      const indirizzo = haDestPers
        ? p.destinazione_personalizzato
        : (servizio.indirizzo_destinazione || 'Destinazione da definire');
      const citta = haDestPers
        ? (p.localita_destinazione_personalizzato || servizio.citta_destinazione || '')
        : (servizio.citta_destinazione || '');
      const nome = p.nome_cognome_inline || p.nome_cognome || 'Passeggero';

      const key = `${(indirizzo || '').trim().toLowerCase()}|${(citta || '').trim().toLowerCase()}`;
      if (!destMap.has(key)) {
        destMap.set(key, { indirizzo: (indirizzo || '').trim(), citta: (citta || '').trim(), passeggeri: [] });
      }
      destMap.get(key)!.passeggeri.push(nome);
    });

    const entries = Array.from(destMap.values());
    return entries.map((dest, idx) => {
      const label = entries.length > 1 ? `🏁 DESTINAZIONE ${idx + 1}` : '🏁 DESTINAZIONE';
      const paxList = dest.passeggeri.length > 0
        ? `<div class="route-time">${dest.passeggeri.map((n: string) => escapeHtml(n)).join(', ')}</div>`
        : '';
      return `
        <div class="route-step end">
          <div class="route-content">
            <div class="route-name">${label}</div>
            <div class="route-address">${escapeHtml(dest.indirizzo)}</div>
            ${dest.citta ? `<div class="route-address">${escapeHtml(dest.citta)}</div>` : ''}
            ${paxList}
          </div>
        </div>`;
    }).join('\n');
  })();

  // Operational details section
  const operativeHtml = (veicolo || autista || servizio.km_totali) ? `
      <div class="section">
        <div class="section-title">🚗 Dettagli Operativi</div>
        ${veicolo ? `<div class="info-row"><span class="info-label">Veicolo:</span><span class="info-value">${escapeHtml(veicolo.modello)} - ${escapeHtml(veicolo.targa)}</span></div>` : ''}
        ${autista ? `<div class="info-row"><span class="info-label">Autista:</span><span class="info-value">${escapeHtml(autista.first_name || '')} ${escapeHtml(autista.last_name || '')}</span></div>` : ''}
        ${servizio.km_totali ? `<div class="info-row"><span class="info-label">Km Totali:</span><span class="info-value">${servizio.km_totali} km</span></div>` : ''}
      </div>` : '';

  const refName = referente ? `${referente.first_name || ''} ${referente.last_name || ''}`.trim() : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
    .container { background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0 0; opacity: 0.9; }
    .content { padding: 30px; }
    .section { margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0; }
    .section:last-child { border-bottom: none; }
    .section-title { font-size: 16px; font-weight: 600; color: #667eea; margin-bottom: 12px; }
    .info-row { display: flex; padding: 8px 0; }
    .info-label { font-weight: 600; min-width: 140px; color: #666; }
    .info-value { color: #333; }
    .route-step { display: flex; align-items: flex-start; margin: 15px 0; padding-left: 30px; position: relative; }
    .route-step::before { content: ''; position: absolute; left: 0; top: 8px; width: 10px; height: 10px; border-radius: 50%; background: #667eea; }
    .route-step.start::before { background: #10b981; width: 12px; height: 12px; }
    .route-step.end::before { background: #ef4444; width: 12px; height: 12px; }
    .route-step.intermediate::before { background: #f59e0b; }
    .route-content { margin-left: 15px; flex: 1; }
    .route-name { font-weight: 600; color: #333; margin-bottom: 4px; }
    .route-address { color: #666; font-size: 14px; line-height: 1.4; }
    .route-time { color: #999; font-size: 13px; font-style: italic; margin-top: 4px; }
    .highlight-box { background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin: 15px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 13px; color: #666; }
    @media (max-width: 600px) { body { padding: 10px; } .content { padding: 20px 15px; } .info-row { flex-direction: column; } .info-label { min-width: auto; margin-bottom: 4px; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${headers[tipo]}</h1>
      <p>${escapeHtml(dataFormatted)} alle ${escapeHtml(oraFormatted)}</p>
    </div>

    <div class="content">
      <div class="section">
        <div class="section-title">👤 Cliente</div>
        <div class="info-row"><span class="info-label">Azienda:</span><span class="info-value">${escapeHtml(azienda?.nome || '')}</span></div>
        ${refName ? `<div class="info-row"><span class="info-label">Referente:</span><span class="info-value">${escapeHtml(refName)}</span></div>` : ''}
        ${servizio.numero_commessa ? `<div class="info-row"><span class="info-label">N° Commessa:</span><span class="info-value">${escapeHtml(servizio.numero_commessa)}</span></div>` : ''}
      </div>

      <div class="section">
        <div class="section-title">🗺️ Percorso Servizio</div>

        <div class="route-step start">
          <div class="route-content">
            <div class="route-name">📍 PARTENZA</div>
            <div class="route-address">${escapeHtml(servizio.indirizzo_presa || 'Indirizzo da definire')}</div>
            ${servizio.citta_presa ? `<div class="route-address">${escapeHtml(servizio.citta_presa)}</div>` : ''}
            <div class="route-time">Orario: ${escapeHtml(oraFormatted)}</div>
          </div>
        </div>

${passeggeriHtml}

${destinazioniHtml}
      </div>

${operativeHtml}

      ${servizio.note ? `
      <div class="section">
        <div class="section-title">📝 Note Servizio</div>
        <div class="highlight-box">${escapeHtml(servizio.note)}</div>
      </div>` : ''}

      ${tipo === 'conferma_presa_carico' ? `
      <div class="highlight-box">
        ✅ Servizio preso in carico da TaxiTime.<br>
        Riceverai ulteriori aggiornamenti quando necessario.
      </div>` : ''}
    </div>

    <div class="footer">
      <p>Questa è una notifica automatica di TaxiTime</p>
      <p>Per assistenza: info@taxitime.it</p>
    </div>
  </div>
</body>
</html>`;

  return { html, subject: subjects[tipo] };
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────

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
        autista:profiles!servizi_assegnato_a_fkey(email, first_name, last_name),
        veicoli(*),
        servizi_passeggeri(
          *,
          passeggeri(nome_cognome, email, telefono, indirizzo, localita)
        ),
        servizi_email_notifiche(email_notifiche(email, nome))
      `)
      .eq('id', servizio_id)
      .single();

    if (servizioError) throw new Error(`Servizio error: ${servizioError.message}`);

    // Fetch referente separately
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
        const paxEmail = sp.email_inline || sp.passeggeri?.email;
        if (paxEmail) {
          recipients.push({
            email: paxEmail,
            name: sp.nome_cognome_inline || sp.passeggeri?.nome_cognome || ''
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

    // 5. BUILD EMAIL CONTENT — DETECTION MODE
    let emailHtml: string;
    let emailSubject: string;
    const isDynamicTemplate = template.slug.includes('completo');

    if (isDynamicTemplate) {
      // ── DYNAMIC MODE ──────────────────────────────────────────────
      console.log(`[SEND-EMAIL] DYNAMIC mode for: ${template.slug}`);

      let tipo: DynamicEmailTipo;
      if (template.slug.includes('richiesta')) {
        tipo = 'richiesta_cliente';
      } else if (template.slug.includes('conferma_presa_carico')) {
        tipo = 'conferma_presa_carico';
      } else {
        tipo = 'servizio_confermato';
      }

      // Build enriched passenger list from servizi_passeggeri join
      const passeggeriConDati = (servizio.servizi_passeggeri || []).map((sp: any) => ({
        nome_cognome: sp.nome_cognome_inline || sp.passeggeri?.nome_cognome || '',
        nome_cognome_inline: sp.nome_cognome_inline,
        email: sp.passeggeri?.email || '',
        email_inline: sp.email_inline,
        telefono: sp.passeggeri?.telefono || '',
        telefono_inline: sp.telefono_inline,
        indirizzo: sp.passeggeri?.indirizzo || '',
        indirizzo_inline: sp.indirizzo_inline,
        localita: sp.passeggeri?.localita || '',
        localita_inline: sp.localita_inline,
        luogo_presa_personalizzato: sp.luogo_presa_personalizzato,
        localita_presa_personalizzato: sp.localita_presa_personalizzato,
        orario_presa_personalizzato: sp.orario_presa_personalizzato,
        usa_indirizzo_personalizzato: sp.usa_indirizzo_personalizzato,
        usa_destinazione_personalizzata: sp.usa_destinazione_personalizzata,
        destinazione_personalizzato: sp.destinazione_personalizzato,
        localita_destinazione_personalizzato: sp.localita_destinazione_personalizzato,
        ordine_presa: sp.ordine_presa,
      })).sort((a: any, b: any) => (a.ordine_presa ?? 999) - (b.ordine_presa ?? 999));

      const built = buildCompleteEmailHTML({
        tipo,
        servizio,
        passeggeri: passeggeriConDati,
        referente,
        azienda: servizio.aziende,
        autista: servizio.autista,
        veicolo: servizio.veicoli,
      });

      emailHtml = built.html;
      emailSubject = built.subject;

    } else {
      // ── LEGACY MODE ───────────────────────────────────────────────
      console.log(`[SEND-EMAIL] LEGACY mode for: ${template.slug}`);

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

      emailHtml = template.html_body;
      emailSubject = template.subject;
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        emailHtml = emailHtml.replace(regex, variables[key]);
        emailSubject = emailSubject.replace(regex, variables[key]);
      });
    }

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
        // Minimizza HTML per evitare =20 nel trasporto Quoted-Printable
        const minifiedHtml = emailHtml.replace(/\n\s*/g, '\n').replace(/\s+$/gm, '');

        const sendResult = await smtp.send({
          from: `${config.smtp_from_name || 'TaxiTime'} <${config.smtp_from_email || config.smtp_user}>`,
          to: [recipient.email],
          subject: emailSubject,
          html: minifiedHtml
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
