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

function renderSectionDataOra(vars: Record<string, string>): string {
  if (!vars.data && !vars.ora) return '';
  return `
    <div class="section">
      <div class="section-title">📅 Data e Ora</div>
      <div class="info-row">
        <span class="info-value">${escapeHtml(vars.data)} — ${escapeHtml(vars.ora)}</span>
      </div>
    </div>`;
}

function renderSectionCommessa(vars: Record<string, string>): string {
  if (!vars.numero_commessa) return '';
  return `
    <div class="section">
      <div class="info-row">
        <span class="info-label">📋 Commessa:</span>
        <span class="info-value">${escapeHtml(vars.numero_commessa)}</span>
      </div>
    </div>`;
}

function renderSectionPercorsoSemplice(vars: Record<string, string>): string {
  const presa = [vars.indirizzo_presa, vars.citta_presa].filter(Boolean).join(', ');
  const dest = [vars.indirizzo_destinazione, vars.citta_destinazione].filter(Boolean).join(', ');
  if (!presa && !dest) return '';
  return `
    <div class="section">
      <div class="section-title">📍 Percorso</div>
      ${presa ? `<div class="info-row"><span class="info-label">Presa:</span><span class="info-value">${escapeHtml(presa)}</span></div>` : ''}
      ${dest ? `<div class="info-row"><span class="info-label">Destinazione:</span><span class="info-value">${escapeHtml(dest)}</span></div>` : ''}
    </div>`;
}

function renderSectionPasseggeri(passeggeri: any[], vars: Record<string, string>): string {
  if (!passeggeri || passeggeri.length === 0) return '';
  const rows = passeggeri.map((p, idx) => {
    const nome = p.nome_cognome_inline || p.nome_cognome || 'Passeggero';
    const indirizzo = (p.luogo_presa_personalizzato || p.indirizzo || '').trim();
    const localita = (p.localita_presa_personalizzato || p.localita || '').trim();
    const orario = p.orario_presa_personalizzato || vars.ora;
    return `
      <div class="route-step">
        <div class="route-content">
          <div class="route-name">🚶 ${idx + 1}. ${escapeHtml(nome)}</div>
          ${indirizzo ? `<div class="route-address">${escapeHtml(indirizzo)}${localita ? ', ' + escapeHtml(localita) : ''}</div>` : ''}
          ${orario ? `<div class="route-time">Orario: ${escapeHtml(orario)}</div>` : ''}
        </div>
      </div>`;
  }).join('\n');
  return `<div class="section"><div class="section-title">🚶 Passeggeri (${passeggeri.length})</div>${rows}</div>`;
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
    const paxList = dest.passeggeri.length > 0 ? `<div class="route-time">${dest.passeggeri.map(escapeHtml).join(', ')}</div>` : '';
    return `
      <div class="route-step end">
        <div class="route-content">
          <div class="route-name">${label}</div>
          <div class="route-address">${escapeHtml(dest.indirizzo)}${dest.citta ? ', ' + escapeHtml(dest.citta) : ''}</div>
          ${paxList}
        </div>
      </div>`;
  }).join('\n');
  return `<div class="section">${rows}</div>`;
}

function renderSectionVeicoloAutista(vars: Record<string, string>, servizio: any): string {
  const hasVeicolo = !!vars.veicolo;
  const hasAutista = !!vars.autista_nome;
  const hasKm = !!(servizio.km_totali);
  if (!hasVeicolo && !hasAutista && !hasKm) return '';
  return `
    <div class="section">
      <div class="section-title">🚗 Dettagli Operativi</div>
      ${hasVeicolo ? `<div class="info-row"><span class="info-label">Veicolo:</span><span class="info-value">${escapeHtml(vars.veicolo)}</span></div>` : ''}
      ${hasAutista ? `<div class="info-row"><span class="info-label">Autista:</span><span class="info-value">${escapeHtml(vars.autista_nome)}</span></div>` : ''}
      ${hasKm ? `<div class="info-row"><span class="info-label">Km Totali:</span><span class="info-value">${servizio.km_totali} km</span></div>` : ''}
    </div>`;
}

function renderSectionConsuntivo(vars: Record<string, string>): string {
  if (!vars.incasso && !vars.iva) return '';
  return `
    <div class="section">
      <div class="section-title">💰 Consuntivo</div>
      ${vars.incasso ? `<div class="info-row"><span class="info-label">Incasso:</span><span class="info-value">€${escapeHtml(vars.incasso)}</span></div>` : ''}
      ${vars.iva ? `<div class="info-row"><span class="info-label">IVA:</span><span class="info-value">${escapeHtml(vars.iva)}%</span></div>` : ''}
    </div>`;
}

function renderSectionNote(vars: Record<string, string>): string {
  if (!vars.note) return '';
  return `
    <div class="section">
      <div class="section-title">📝 Note</div>
      <div class="note-text">${escapeHtml(vars.note)}</div>
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
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f3f4f6;color:#111827}
.container{max-width:600px;margin:0 auto;background:#fff}
.header{background:${colore_header};color:#fff;padding:24px;text-align:center}
.header h1{margin:0;font-size:20px;font-weight:600}
.body{padding:24px}
.intro{font-size:15px;line-height:1.6;color:#111827;margin-bottom:20px}
.section{margin:16px 0;padding:12px;background:#f9fafb;border-radius:8px;border-left:3px solid ${colore_header}}
.section-title{font-size:13px;font-weight:600;color:#374151;margin-bottom:8px;text-transform:uppercase;letter-spacing:.3px}
.info-row{display:flex;gap:8px;padding:4px 0;font-size:14px}
.info-label{font-weight:600;color:#6b7280;min-width:120px}
.info-value{color:#111827;flex:1}
.route-step{padding:8px 0;border-bottom:1px solid #e5e7eb}
.route-step:last-child{border-bottom:none}
.route-name{font-weight:600;font-size:14px;color:#111827}
.route-address{font-size:13px;color:#4b5563;margin-top:2px}
.route-time{font-size:12px;color:#6b7280;margin-top:2px}
.note-text{font-size:14px;color:#374151;white-space:pre-wrap}
.chiusura{font-size:14px;line-height:1.6;color:#374151;margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb}
.footer{padding:16px 24px;background:#f9fafb;font-size:12px;color:#6b7280;text-align:center;border-top:1px solid #e5e7eb}
.firma{margin-top:16px;font-size:14px;color:#6b7280;font-style:italic}
</style></head>
<body><div class="container">
<div class="header">${config.logo_url ? `<img src="${escapeHtml(config.logo_url)}" alt="TaxiTime" style="height:32px;margin-bottom:8px"><br>` : ''}<h1>${escapeHtml(titolo)}</h1></div>
<div class="body">
  <div class="intro">${escapeHtml(intro).replace(/\n/g,'<br>')}</div>
  ${sectionsHtml}
  <div class="chiusura">${escapeHtml(chiusura).replace(/\n/g,'<br>')}</div>
  <div class="firma">${escapeHtml(config.firma)}</div>
</div>
<div class="footer">${escapeHtml(config.contatti_footer)}</div>
</div></body></html>`;
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
  const html = renderUnifiedLayout({ colore_header, titolo, intro, sections, chiusura, config });
  return { subject, html };
}

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
          .select('slug, nome, subject, html_body, attivo, titolo, intro, chiusura, colore_header')
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
        const subject = `[TEST] ${rendered.subject}`;

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
      .select('slug, nome, subject, html_body, attivo, titolo, intro, chiusura, colore_header')
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
    const emailSubject: string = rendered.subject;

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
