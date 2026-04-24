import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// ─── UNIFIED TEMPLATE PRIMITIVES (Batch 2a) ───────────────────────────────────
// Aggiunte ma non ancora utilizzate dalla dispatch principale.

interface EmailConfig {
  firma: string;
  contatti_footer: string;
  logo_url: string | null;
}

interface TemplateRecord {
  slug: string;
  subject: string;
  titolo: string | null;
  intro: string | null;
  chiusura: string | null;
  colore_header: string | null;
  attivo: boolean | null;
}

interface RenderContext {
  servizio: any;
  passeggeri: any[];
  referente: any;
  azienda: any;
  autista?: any;
  veicolo?: any;
}

function buildVariables(ctx: RenderContext): Record<string, string> {
  const { servizio, referente, azienda, autista, veicolo } = ctx;
  const dataFormatted = servizio.data_servizio
    ? new Date(servizio.data_servizio).toLocaleDateString('it-IT', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      })
    : '';
  const oraFormatted = servizio.orario_servizio?.slice(0, 5) || '';
  return {
    azienda_nome: azienda?.nome || '',
    referente_nome: referente ? `${referente.first_name || ''} ${referente.last_name || ''}`.trim() : '',
    data: dataFormatted,
    ora: oraFormatted,
    numero: servizio.id?.slice(0, 8) || '',
    numero_commessa: servizio.numero_commessa || '',
    indirizzo_presa: servizio.indirizzo_presa || '',
    citta_presa: servizio.citta_presa || '',
    indirizzo_destinazione: servizio.indirizzo_destinazione || '',
    citta_destinazione: servizio.citta_destinazione || '',
    autista_nome: autista ? `${autista.first_name || ''} ${autista.last_name || ''}`.trim() : '',
    veicolo: veicolo ? `${veicolo.modello || ''} ${veicolo.targa || ''}`.trim() : '',
    km_totali: String(servizio.km_totali || ''),
    incasso: String(servizio.incasso || ''),
    iva: String(servizio.iva || ''),
    data_completamento: servizio.updated_at
      ? new Date(servizio.updated_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
      : '',
    motivo: servizio.motivo_annullamento || '',
    note: servizio.note || '',
  };
}

function replaceVariables(template: string, vars: Record<string, string>): string {
  if (!template) return '';
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '');
}

function normalizeSubjectAscii(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, '');
}

function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h\d)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function fetchEmailConfig(supabase: any): Promise<EmailConfig> {
  const { data } = await supabase
    .from('email_config')
    .select('firma, contatti_footer, logo_url')
    .eq('id', 1)
    .single();
  return data || {
    firma: 'Il team TaxiTime',
    contatti_footer: 'TaxiTime — Per assistenza: info@taxitime.app',
    logo_url: null,
  };
}

// ─── UNIFIED RENDER HELPERS (Batch 2b) ────────────────────────────────────────
// Definiti ma non ancora invocati dalla dispatch principale.

const SECTION_STYLE = `margin:16px 0;padding:14px 16px;background:#f9fafb;border-radius:8px;border-left:3px solid #e5e7eb;`;
const SECTION_TITLE_STYLE = `font-size:12px;font-weight:600;color:#6b7280;margin:0 0 8px 0;text-transform:uppercase;letter-spacing:.4px;`;
const INFO_ROW_STYLE = `padding:3px 0;font-size:14px;color:#111827;`;
const INFO_LABEL_STYLE = `font-weight:600;color:#6b7280;display:inline-block;min-width:120px;`;

function renderSectionDataOra(vars: Record<string, string>): string {
  if (!vars.data && !vars.ora) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${SECTION_TITLE_STYLE}">📅 Data e Ora</div>
      <div style="${INFO_ROW_STYLE}">${escapeHtml(vars.data)}${vars.ora ? ' — ' + escapeHtml(vars.ora) : ''}</div>
    </div>`;
}

function renderSectionCommessa(vars: Record<string, string>): string {
  if (!vars.numero_commessa) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">📋 Commessa:</span> ${escapeHtml(vars.numero_commessa)}</div>
    </div>`;
}

function renderSectionPercorsoSemplice(vars: Record<string, string>): string {
  const presa = [vars.indirizzo_presa, vars.citta_presa].filter(Boolean).join(', ');
  const dest = [vars.indirizzo_destinazione, vars.citta_destinazione].filter(Boolean).join(', ');
  if (!presa && !dest) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${SECTION_TITLE_STYLE}">📍 Percorso</div>
      ${presa ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Presa:</span> ${escapeHtml(presa)}</div>` : ''}
      ${dest ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Destinazione:</span> ${escapeHtml(dest)}</div>` : ''}
    </div>`;
}

function renderSectionPasseggeri(passeggeri: any[], vars: Record<string, string>): string {
  if (!passeggeri || passeggeri.length === 0) return '';
  const rows = passeggeri.map((p, idx) => {
    const nome = p.nome_cognome_inline || p.nome_cognome || 'Passeggero';
    const indirizzo = (p.luogo_presa_personalizzato || p.indirizzo || '').trim();
    const localita = (p.localita_presa_personalizzato || p.localita || '').trim();
    const orario = p.orario_presa_personalizzato || vars.ora;
    const isLast = idx === passeggeri.length - 1;
    const borderStyle = isLast ? '' : 'border-bottom:1px solid #e5e7eb;';
    return `
      <div style="padding:10px 0;${borderStyle}">
        <div style="font-weight:600;font-size:14px;color:#111827;margin-bottom:2px;">🚶 ${idx + 1}. ${escapeHtml(nome)}</div>
        ${indirizzo ? `<div style="font-size:13px;color:#4b5563;margin-top:2px;">${escapeHtml(indirizzo)}${localita ? ', ' + escapeHtml(localita) : ''}</div>` : ''}
        ${orario ? `<div style="font-size:12px;color:#6b7280;margin-top:2px;">Orario: ${escapeHtml(orario)}</div>` : ''}
      </div>`;
  }).join('\n');
  return `<div style="${SECTION_STYLE}"><div style="${SECTION_TITLE_STYLE}">🚶 Passeggeri (${passeggeri.length})</div>${rows}</div>`;
}

function renderSectionDestinazioni(passeggeri: any[], servizio: any): string {
  if (!passeggeri || passeggeri.length === 0) return '';
  const destMap = new Map<string, { indirizzo: string; citta: string; passeggeri: string[] }>();
  passeggeri.forEach((p: any) => {
    const haDest = !!p.destinazione_personalizzato;
    const indirizzo = haDest ? p.destinazione_personalizzato : (servizio.indirizzo_destinazione || '');
    const citta = haDest ? (p.localita_destinazione_personalizzato || servizio.citta_destinazione || '') : (servizio.citta_destinazione || '');
    const nome = p.nome_cognome_inline || p.nome_cognome || 'Passeggero';
    const key = `${(indirizzo || '').trim().toLowerCase()}|${(citta || '').trim().toLowerCase()}`;
    if (!destMap.has(key)) destMap.set(key, { indirizzo: (indirizzo || '').trim(), citta: (citta || '').trim(), passeggeri: [] });
    destMap.get(key)!.passeggeri.push(nome);
  });
  const entries = Array.from(destMap.values()).filter(d => d.indirizzo || d.citta);
  if (entries.length === 0) return '';
  const rows = entries.map((dest, idx) => {
    const label = entries.length > 1 ? `🏁 Destinazione ${idx + 1}` : '🏁 Destinazione';
    const paxList = dest.passeggeri.length > 0 ? `<div style="font-size:12px;color:#6b7280;margin-top:4px;">${dest.passeggeri.map(escapeHtml).join(', ')}</div>` : '';
    const isLast = idx === entries.length - 1;
    const borderStyle = isLast ? '' : 'border-bottom:1px solid #e5e7eb;';
    return `
      <div style="padding:10px 0;${borderStyle}">
        <div style="font-weight:600;font-size:14px;color:#111827;margin-bottom:2px;">${label}</div>
        <div style="font-size:13px;color:#4b5563;">${escapeHtml(dest.indirizzo)}${dest.citta ? ', ' + escapeHtml(dest.citta) : ''}</div>
        ${paxList}
      </div>`;
  }).join('\n');
  return `<div style="${SECTION_STYLE}">${rows}</div>`;
}

function renderSectionVeicoloAutista(vars: Record<string, string>, servizio: any): string {
  const hasVeicolo = !!vars.veicolo;
  const hasAutista = !!vars.autista_nome;
  const hasKm = !!(servizio.km_totali);
  if (!hasVeicolo && !hasAutista && !hasKm) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${SECTION_TITLE_STYLE}">🚗 Dettagli Operativi</div>
      ${hasVeicolo ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Veicolo:</span> ${escapeHtml(vars.veicolo)}</div>` : ''}
      ${hasAutista ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Autista:</span> ${escapeHtml(vars.autista_nome)}</div>` : ''}
      ${hasKm ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Km Totali:</span> ${servizio.km_totali} km</div>` : ''}
    </div>`;
}

function renderSectionConsuntivo(vars: Record<string, string>): string {
  if (!vars.incasso && !vars.iva) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${SECTION_TITLE_STYLE}">💰 Consuntivo</div>
      ${vars.incasso ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">Incasso:</span> €${escapeHtml(vars.incasso)}</div>` : ''}
      ${vars.iva ? `<div style="${INFO_ROW_STYLE}"><span style="${INFO_LABEL_STYLE}">IVA:</span> ${escapeHtml(vars.iva)}%</div>` : ''}
    </div>`;
}

function renderSectionNote(vars: Record<string, string>): string {
  if (!vars.note) return '';
  return `
    <div style="${SECTION_STYLE}">
      <div style="${SECTION_TITLE_STYLE}">📝 Note</div>
      <div style="font-size:14px;color:#374151;white-space:pre-wrap;">${escapeHtml(vars.note)}</div>
    </div>`;
}

function renderUnifiedLayout(data: {
  colore_header: string;
  titolo: string;
  intro: string;
  sections: string[];
  chiusura: string;
  config: EmailConfig;
}): string {
  const { colore_header, titolo, intro, sections, chiusura, config } = data;
  const sectionsHtml = sections.filter(s => s && s.trim()).join('\n');
  const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif`;
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:${FONT};background:#f3f4f6;color:#111827;line-height:1.5;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f3f4f6;padding:24px 0;">
<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
<tr><td style="background:${colore_header};color:#ffffff;padding:28px 24px;text-align:center;">
${config.logo_url ? `<img src="${escapeHtml(config.logo_url)}" alt="TaxiTime" style="height:32px;margin:0 auto 12px;display:block;"/>` : ''}
<h1 style="margin:0;font-size:20px;font-weight:600;color:#ffffff;font-family:${FONT};">${escapeHtml(titolo)}</h1>
</td></tr>
<tr><td style="padding:24px;font-family:${FONT};">
<p style="font-size:15px;line-height:1.6;color:#111827;margin:0 0 20px 0;">${escapeHtml(intro).replace(/\n/g,'<br>')}</p>
${sectionsHtml}
<p style="font-size:14px;line-height:1.6;color:#374151;margin:24px 0 0 0;padding-top:16px;border-top:1px solid #e5e7eb;">${escapeHtml(chiusura).replace(/\n/g,'<br>')}</p>
<p style="margin:16px 0 0 0;font-size:14px;color:#6b7280;font-style:italic;">${escapeHtml(config.firma)}</p>
</td></tr>
<tr><td style="padding:16px 24px;background:#f9fafb;font-size:12px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb;font-family:${FONT};">${escapeHtml(config.contatti_footer)}</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function renderUnifiedEmail(template: TemplateRecord, ctx: RenderContext, config: EmailConfig): { subject: string; html: string } {
  const vars = buildVariables(ctx);
  const subject = replaceVariables(template.subject, vars);
  const titolo = replaceVariables(template.titolo || template.slug, vars);
  const intro = replaceVariables(template.intro || '', vars);
  const chiusura = replaceVariables(template.chiusura || '', vars);
  const colore_header = template.colore_header || '#3b82f6';
  const sections: string[] = [
    renderSectionDataOra(vars),
    renderSectionCommessa(vars),
    renderSectionPercorsoSemplice(vars),
    renderSectionPasseggeri(ctx.passeggeri, vars),
    renderSectionDestinazioni(ctx.passeggeri, ctx.servizio),
    renderSectionVeicoloAutista(vars, ctx.servizio),
    renderSectionConsuntivo(vars),
    renderSectionNote(vars),
  ];
  const html = minifyHtml(renderUnifiedLayout({ colore_header, titolo, intro, sections, chiusura, config }));
  return { subject, html };
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
    const body = await req.json();
    const { servizio_id, template_slug, test_mode, test_emails } = body;

    // ── TEST MODE ─────────────────────────────────────────────────────
    if (test_mode === true) {
      console.log('[SEND-EMAIL] TEST MODE for emails:', test_emails);

      if (!Array.isArray(test_emails) || test_emails.length === 0) {
        return new Response(
          JSON.stringify({ success: false, message: 'No test_emails provided' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Se sono forniti servizio_id + template_slug, renderizza con il motore unificato
      if (servizio_id && template_slug) {
        console.log('[SEND-EMAIL] TEST MODE with unified renderer:', { servizio_id, template_slug, test_emails });

        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          { auth: { persistSession: false } }
        );

        const { data: template, error: templateError } = await supabaseAdmin
          .from('email_templates')
          .select('slug, nome, subject, attivo, titolo, intro, chiusura, colore_header')
          .eq('slug', template_slug)
          .single();

        if (templateError || !template) {
          return new Response(
            JSON.stringify({ success: false, message: `Template not found: ${template_slug}` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: servizio, error: servizioError } = await supabaseAdmin
          .from('servizi')
          .select(`
            *,
            aziende(*),
            autista:profiles!servizi_assegnato_a_fkey(id, email, first_name, last_name),
            veicoli(*),
            servizi_passeggeri(
              *,
              passeggeri(id, nome_cognome, email, telefono, indirizzo, localita)
            )
          `)
          .eq('id', servizio_id)
          .single();

        if (servizioError || !servizio) {
          console.error('[SEND-EMAIL] Test mode servizio error:', servizioError);
          return new Response(
            JSON.stringify({ success: false, message: `Servizio not found: ${servizio_id}`, error: servizioError?.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Fetch referente separately (come nel main flow)
        let testReferente: any = null;
        if (servizio.referente_id) {
          const { data: refData } = await supabaseAdmin
            .from('profiles')
            .select('id, email, first_name, last_name')
            .eq('id', servizio.referente_id)
            .single();
          testReferente = refData;
        }

        const { data: smtpCfg } = await supabaseAdmin
          .from('impostazioni')
          .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled')
          .maybeSingle();

        if (!smtpCfg || !smtpCfg.email_enabled || !smtpCfg.smtp_password_encrypted) {
          return new Response(JSON.stringify({ success: false, message: 'SMTP non configurato' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        const emailConfig = await fetchEmailConfig(supabaseAdmin);

        const passeggeriUnified = (servizio.servizi_passeggeri || []).map((sp: any) => ({
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

        const renderContext: RenderContext = {
          servizio,
          passeggeri: passeggeriUnified,
          referente: testReferente,
          azienda: servizio.aziende || null,
          autista: servizio.autista || null,
          veicolo: servizio.veicoli || null,
        };

        const rendered = renderUnifiedEmail(template as TemplateRecord, renderContext, emailConfig);
        const subject = normalizeSubjectAscii(`[TEST] ${rendered.subject}`);
        const plainText = htmlToPlainText(rendered.html);

        const password = atob(smtpCfg.smtp_password_encrypted);

        const smtp = new SMTPClient({
          connection: {
            hostname: smtpCfg.smtp_host,
            port: smtpCfg.smtp_port,
            tls: smtpCfg.smtp_secure,
            auth: { username: smtpCfg.smtp_user, password }
          }
        });

        let sent = 0;
        let failed = 0;
        for (const email of test_emails) {
          try {
            await smtp.send({
              from: `${smtpCfg.smtp_from_name || 'TaxiTime'} <${smtpCfg.smtp_from_email || smtpCfg.smtp_user}>`,
              to: [email],
              subject,
              content: plainText,
              html: rendered.html,
            });
            sent++;
            console.log(`[SEND-EMAIL] ✅ Test (${template_slug}) sent to ${email}`);
          } catch (err) {
            failed++;
            console.error(`[SEND-EMAIL] ❌ Test (${template_slug}) failed to ${email}:`, (err as Error).message);
          }
        }
        await smtp.close();

        return new Response(
          JSON.stringify({ success: true, sent, failed, total: test_emails.length, template_slug }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      // ---- fine nuovo ramo ----

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      const { data: config, error: configError } = await supabaseAdmin
        .from('impostazioni')
        .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled')
        .maybeSingle();

      if (configError || !config) throw new Error(`Config error: ${configError?.message || 'No config found'}`);
      if (!config.email_enabled) {
        return new Response(JSON.stringify({ success: false, message: 'Email disabled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (!config.smtp_password_encrypted || !config.smtp_host || !config.smtp_user) {
        return new Response(JSON.stringify({ success: false, message: 'SMTP not configured' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const password = atob(config.smtp_password_encrypted);
      const smtp = new SMTPClient({
        connection: {
          hostname: config.smtp_host,
          port: config.smtp_port,
          tls: config.smtp_secure,
          auth: { username: config.smtp_user, password }
        }
      });

      const testHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
<div style="background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:30px 20px;text-align:center;border-radius:10px 10px 0 0;">
<h1 style="margin:0;">✅ Test Notifiche TaxiTime</h1>
</div>
<div style="background:white;padding:30px;border:1px solid #eee;border-radius:0 0 10px 10px;">
<p style="font-size:16px;color:#333;">Questo è un messaggio di test.</p>
<p style="font-size:14px;color:#666;">Le notifiche email sono configurate correttamente.<br>
Questo indirizzo riceverà le notifiche quando un cliente crea una nuova richiesta di servizio.</p>
<p style="font-size:12px;color:#999;margin-top:30px;">Inviato il ${new Date().toLocaleString('it-IT')} — TaxiTime</p>
</div></body></html>`;

      const testSubject = '✅ Test notifiche TaxiTime';
      let sent = 0;
      let failed = 0;

      for (const email of test_emails) {
        try {
          await smtp.send({
            from: `${config.smtp_from_name || 'TaxiTime'} <${config.smtp_from_email || config.smtp_user}>`,
            to: [email],
            subject: testSubject,
            html: testHtml
          });
          sent++;
          console.log(`[SEND-EMAIL] ✅ Test sent to ${email}`);
        } catch (err: any) {
          failed++;
          console.error(`[SEND-EMAIL] ❌ Test failed to ${email}:`, err.message);
        }
      }

      await smtp.close();

      return new Response(
        JSON.stringify({ success: true, sent, failed, total: test_emails.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    // ── END TEST MODE ─────────────────────────────────────────────────
    
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
      .select('smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password_encrypted, smtp_from_name, smtp_from_email, email_enabled, email_notifiche_admin')
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
      .select('slug, nome, subject, attivo, titolo, intro, chiusura, colore_header')
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

    // 2b. FETCH EMAIL CONFIG (firma, footer, logo)
    const emailConfig = await fetchEmailConfig(supabaseAdmin);

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

    // Passeggeri: escludi per richiesta_cliente
    // I passeggeri ricevono email solo alla conferma TaxiTime
    const excludePaxTemplates = ['richiesta_cliente', 'richiesta_cliente_completo'];
    if (servizio.servizi_passeggeri && !excludePaxTemplates.includes(template_slug)) {
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

    // Aggiungi email admin per richieste cliente
    const isRichiestaCliente = ['richiesta_cliente', 'richiesta_cliente_completo'].includes(template_slug);
    if (isRichiestaCliente && config.email_notifiche_admin) {
      const adminEmails = Array.isArray(config.email_notifiche_admin) ? config.email_notifiche_admin : [];
      adminEmails.forEach((email: string) => {
        if (email && typeof email === 'string') {
          recipients.push({ email, name: 'Admin' });
        }
      });
      console.log('[SEND-EMAIL] Added admin notification emails:', adminEmails.length);
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

    // 5. BUILD EMAIL CONTENT — UNIFIED RENDERER
    console.log(`[SEND-EMAIL] UNIFIED render for: ${template.slug}`);

    const passeggeriUnified = (servizio.servizi_passeggeri || []).map((sp: any) => ({
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

    const renderContext: RenderContext = {
      servizio,
      passeggeri: passeggeriUnified,
      referente: referente || null,
      azienda: servizio.aziende || null,
      autista: servizio.autista || null,
      veicolo: servizio.veicoli || null,
    };

    const rendered = renderUnifiedEmail(
      template as TemplateRecord,
      renderContext,
      emailConfig
    );

    const emailHtml: string = rendered.html;
    const emailSubject: string = normalizeSubjectAscii(rendered.subject);
    const emailPlainText: string = htmlToPlainText(emailHtml);

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
          content: emailPlainText,
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
