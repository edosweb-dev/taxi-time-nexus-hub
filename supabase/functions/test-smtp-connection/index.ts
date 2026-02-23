import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_password, smtp_from_name, smtp_from_email, test_recipient } = await req.json();

    console.log('[TEST-SMTP] Testing connection:', { host: smtp_host, port: smtp_port, user: smtp_user });

    if (!smtp_host || !smtp_port || !smtp_user || !smtp_password) {
      throw new Error('Configurazione SMTP incompleta');
    }
    if (!test_recipient) {
      throw new Error('Email destinatario test richiesta');
    }

    const smtp = new SMTPClient({
      connection: {
        hostname: smtp_host,
        port: smtp_port,
        tls: smtp_secure,
        auth: { username: smtp_user, password: smtp_password }
      }
    });

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

    await smtp.send({
      from: `${smtp_from_name || 'TaxiTime'} <${smtp_from_email || smtp_user}>`,
      to: [test_recipient],
      subject: '✅ Test Connessione SMTP - TaxiTime',
      html: testEmailHtml
    });

    await smtp.close();

    console.log('[TEST-SMTP] ✅ Email test inviata con successo');

    return new Response(
      JSON.stringify({ success: true, message: `Email di test inviata a ${test_recipient}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[TEST-SMTP] ❌ Errore:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Errore durante il test SMTP' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
