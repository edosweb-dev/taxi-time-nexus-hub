import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const payload = await req.json();
    console.log("[send-reset-password-email] Received payload type:", payload?.email_data?.email_action_type);

    const { user, email_data } = payload;

    if (!user?.email || !email_data?.token_hash) {
      console.error("[send-reset-password-email] Missing user.email or email_data.token_hash");
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the reset link using the site URL and token hash
    const siteUrl = email_data.site_url || email_data.redirect_to || "https://taxi-time.lovable.app";
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
      JSON.stringify({ error: "Internal server error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
