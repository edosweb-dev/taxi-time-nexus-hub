import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const logs: string[] = [];

  try {
    // ── AUTENTICAZIONE E AUTORIZZAZIONE ─────────────────────────────────────
    // Senza questo blocco chiunque possieda la anon key (pubblica, sta nel
    // bundle JS) poteva far aprire al server Supabase una connessione verso
    // host e porta arbitrari — SSRF e port-scan, con i messaggi d'errore
    // differenziati piu' sotto che funzionano da oracolo sullo stato della
    // porta — oltre a usare l'infrastruttura come relay di posta.
    //
    // Il ruolo si legge da user_roles e NON da profiles.role, che e' ancora
    // scrivibile dall'utente stesso. Vincolo admin+socio per combaciare con
    // l'AuthGuard della rotta /impostazioni da cui parte la chiamata.
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Autenticazione richiesta' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Autenticazione non valida' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: callerRoles, error: rolesError } = await supabaseAuth
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Verifica permessi fallita' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const isStaff = (callerRoles ?? []).some(
      (r: { role: string }) => r.role === 'admin' || r.role === 'socio'
    );

    if (!isStaff) {
      return new Response(
        JSON.stringify({ success: false, error: 'Permessi insufficienti' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email, test_recipient } = await req.json();

    logs.push(`[1/6] Parametri ricevuti`);
    logs.push(`  - Host: ${smtp_host}`);
    logs.push(`  - Porta: ${smtp_port}`);
    logs.push(`  - SSL/TLS: ${smtp_secure ? 'Sì' : 'No'}`);
    logs.push(`  - Username: ${smtp_user}`);
    logs.push(`  - Password: ${smtp_password ? '***' + smtp_password.slice(-4) : 'MANCANTE'}`);
    logs.push(`  - From: ${smtp_from_name || 'TaxiTime'} <${smtp_from_email || smtp_user}>`);
    logs.push(`  - Destinatario: ${test_recipient}`);

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      logs.push(`[ERROR] Configurazione incompleta`);
      throw new Error('Configurazione SMTP incompleta: ' +
        (!smtp_host ? 'Host mancante. ' : '') +
        (!smtp_port ? 'Porta mancante. ' : '') +
        (!smtp_user ? 'Username mancante. ' : '') +
        (!smtp_password ? 'Password mancante. ' : '')
      );
    }

    if (!test_recipient) {
      logs.push(`[ERROR] Email destinatario mancante`);
      throw new Error('Email destinatario test richiesta');
    }

    logs.push(`[2/6] Validazione completata ✓`);

    logs.push(`[3/6] Creazione client SMTP...`);
    const smtp = new SMTPClient({
      connection: {
        hostname: smtp_host,
        port: smtp_port,
        tls: smtp_secure,
        auth: { username: smtp_user, password: smtp_password }
      }
    });
    logs.push(`[3/6] Client SMTP creato ✓`);

    const testEmailHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="background:#f0fdf4;border:2px solid #22c55e;border-radius:12px;padding:24px;text-align:center">
        <h1 style="color:#16a34a;margin:0">✅ Test Connessione SMTP</h1>
      </div>
      <div style="padding:24px">
        <p style="font-size:18px;font-weight:bold">Congratulazioni!</p>
        <p>Il tuo server SMTP è configurato correttamente e funziona.</p>
        <p><strong>Dettagli configurazione:</strong></p>
        <ul style="background:#f8fafc;padding:16px 24px;border-radius:8px;list-style:none">
          <li>Host: ${smtp_host}</li>
          <li>Porta: ${smtp_port}</li>
          <li>SSL/TLS: ${smtp_secure ? 'Abilitato' : 'Disabilitato'}</li>
          <li>Utente: ${smtp_user}</li>
        </ul>
        <p style="color:#6b7280;font-size:12px;text-align:center">Questa è un'email di test inviata da TaxiTime.</p>
      </div>
    </body></html>`;

    logs.push(`[4/6] Tentativo invio email...`);
    logs.push(`  - Da: ${smtp_from_name || 'TaxiTime'} <${smtp_from_email || smtp_user}>`);
    logs.push(`  - A: ${test_recipient}`);

    const sendResult = await smtp.send({
      from: `${smtp_from_name || 'TaxiTime'} <${smtp_from_email || smtp_user}>`,
      to: [test_recipient],
      subject: '✅ Test Connessione SMTP - TaxiTime',
      html: testEmailHtml
    });

    logs.push(`[5/6] Email inviata ✓`);

    await smtp.close();
    logs.push(`[6/6] Connessione chiusa ✓`);

    console.log('[TEST-SMTP] SUCCESS\n' + logs.join('\n'));

    return new Response(
      JSON.stringify({ success: true, message: `Email di test inviata a ${test_recipient}`, logs }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    logs.push(`[ERROR] ${error.message}`);

    let suggestion = '';
    if (error.message?.includes('authentication')) {
      suggestion = '🔑 Errore autenticazione: Username o password errati';
      logs.push(`[DIAGNOSI] Credenziali SMTP rifiutate dal server`);
      logs.push(`[SUGGERIMENTO] Verifica username e password nel pannello del provider`);
    } else if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT') || error.message?.includes('TimedOut')) {
      suggestion = '⏱️ Timeout connessione: Porta probabilmente bloccata';
      logs.push(`[DIAGNOSI] Impossibile raggiungere il server SMTP`);
      logs.push(`[SUGGERIMENTO] Prova porta 465 (SSL) invece di 587 (TLS)`);
    } else if (error.message?.includes('ECONNREFUSED')) {
      suggestion = '🚫 Connessione rifiutata: Host o porta errati';
      logs.push(`[DIAGNOSI] Server SMTP non raggiungibile`);
      logs.push(`[SUGGERIMENTO] Verifica host e porta nella configurazione`);
    } else if (error.message?.includes('certificate') || error.message?.includes('SSL')) {
      suggestion = '🔒 Errore certificato SSL/TLS';
      logs.push(`[DIAGNOSI] Problema con certificato SSL`);
      logs.push(`[SUGGERIMENTO] Verifica che porta e tipo SSL/TLS siano corretti`);
    }

    console.error('[TEST-SMTP] ERROR\n' + logs.join('\n'));

    return new Response(
      JSON.stringify({ success: false, error: error.message, suggestion, logs }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
