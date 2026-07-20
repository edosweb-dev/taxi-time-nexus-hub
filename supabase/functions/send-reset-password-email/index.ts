import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Domini a cui e' lecito far puntare il link di reset. La mail parte da
// noreply@taxitime.it con SPF/DKIM validi: un redirect verso un dominio
// arbitrario sarebbe un phishing perfettamente credibile. Restituisce solo
// protocollo+host (niente path), cosi' il /reset-password non viene duplicato
// se il candidato ne include gia' uno.
const ALLOWED_HOSTS = ["www.taxitime.app", "taxitime.app"];

function baseUrlSeConsentito(candidate?: string): string | null {
  if (!candidate) return null;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "https:") return null;
    if (!ALLOWED_HOSTS.includes(u.hostname)) return null;
    return `${u.protocol}//${u.host}`;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("[send-reset-password-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── VERIFICA FIRMA WEBHOOK ──────────────────────────────────────────────
    // Questa function e' un Send Email Hook di Supabase, pubblica
    // (verify_jwt=false in config.toml). Senza verificare la firma, chiunque
    // poteva POSTare user.email ed email_data arbitrari e far partire una mail
    // di "reset password" dal dominio taxitime, con link verso un sito esterno:
    // phishing a costo zero, piu' consumo della quota Resend. Supabase firma
    // ogni chiamata dell'hook secondo lo standard standardwebhooks usando
    // SEND_EMAIL_HOOK_SECRET; un attaccante non puo' produrre una firma valida.
    const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");
    if (!hookSecret) {
      console.error("[send-reset-password-email] SEND_EMAIL_HOOK_SECRET non configurato");
      return new Response(
        JSON.stringify({ error: "Hook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // La firma copre il corpo grezzo: va letto come testo, non come JSON.
    const rawBody = await req.text();
    const headers = Object.fromEntries(req.headers);

    let payload: any;
    try {
      // Il secret Supabase ha formato "v1,whsec_<base64>"; standardwebhooks
      // vuole la sola parte base64.
      const wh = new Webhook(hookSecret.replace("v1,whsec_", ""));
      payload = wh.verify(rawBody, headers);
    } catch (err) {
      console.error("[send-reset-password-email] Firma webhook non valida:", (err as Error)?.message);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-reset-password-email] Received payload type:", payload?.email_data?.email_action_type);

    const { user, email_data } = payload;

    if (!user?.email || !email_data?.token_hash) {
      console.error("[send-reset-password-email] Missing user.email or email_data.token_hash");
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Costruzione del link di reset. Precedenza invertita rispetto a prima:
    // vince redirect_to, cioe' il dominio da cui parte davvero la richiesta
    // (l'app passa window.location.origin via resetPasswordForEmail), poi
    // site_url. Entrambi filtrati contro ALLOWED_HOSTS. Prima si usava site_url
    // per primo: essendo il Site URL configurato in Supabase ancora sul vecchio
    // dominio Lovable, il link portava gli utenti fuori dall'app.
    // Il fallback finale e' la env SITE_URL, poi il dominio di produzione.
    const siteUrl =
      baseUrlSeConsentito(email_data.redirect_to) ||
      baseUrlSeConsentito(email_data.site_url) ||
      Deno.env.get("SITE_URL") ||
      "https://www.taxitime.app";
    const resetLink = `${siteUrl}/reset-password#access_token=${email_data.token_hash}&type=recovery`;

    console.log("[send-reset-password-email] Sending to:", user.email);

    const htmlBody = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="margin:0;color:#f5c542;font-size:28px;font-weight:700;letter-spacing:1px;">🚖 TaxiTime</h1>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:14px;">Sistema di Gestione NCC</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e4e4e7;border-right:1px solid #e4e4e7;">
              <p style="margin:0 0 16px;color:#1a1a2e;font-size:16px;line-height:1.6;">Ciao,</p>
              <p style="margin:0 0 16px;color:#3f3f46;font-size:15px;line-height:1.6;">Abbiamo ricevuto una richiesta di reimpostazione della password per il tuo account TaxiTime.</p>
              <p style="margin:0 0 28px;color:#3f3f46;font-size:15px;line-height:1.6;">Clicca sul pulsante qui sotto per scegliere una nuova password:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#f5c542 0%,#e6b035 100%);border-radius:8px;">
                    <a href="${resetLink}" target="_blank" style="display:inline-block;padding:14px 32px;color:#1a1a2e;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">Reimposta Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#71717a;font-size:13px;line-height:1.5;text-align:center;">Se non hai richiesto il reset della password, ignora questa email.<br>Il link scade in 24 ore.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#fafafa;padding:24px 40px;border-radius:0 0 12px 12px;border:1px solid #e4e4e7;border-top:none;text-align:center;">
              <p style="margin:0 0 4px;color:#a1a1aa;font-size:12px;">© 2026 TaxiTime — Tutti i diritti riservati</p>
              <p style="margin:0;color:#a1a1aa;font-size:11px;">Questa email è stata inviata automaticamente, non rispondere a questo indirizzo.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "TaxiTime <noreply@taxitime.it>",
        to: [user.email],
        subject: "Reimposta la tua password — TaxiTime",
        html: htmlBody,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("[send-reset-password-email] Resend error:", JSON.stringify(resendData));
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-reset-password-email] Email sent successfully:", resendData.id);

    return new Response(
      JSON.stringify({ success: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[send-reset-password-email] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: (error as Error)?.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
