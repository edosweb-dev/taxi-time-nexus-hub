import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type NotificationEventType = "assegnato" | "completato" | "annullato" | "richiesta";

interface SendNotificationResult {
  success: boolean;
  sent?: number;
  failed?: number;
  total?: number;
  message?: string;
  error?: string;
}

/**
 * Invia notifiche email per un servizio
 * @param servizioId - ID del servizio
 * @param tipoEvento - Tipo di evento (assegnato, completato, annullato, richiesta)
 * @param showToast - Se mostrare toast di conferma (default: true)
 */
export async function sendNotification(
  servizioId: string,
  tipoEvento: NotificationEventType,
  showToast: boolean = true
): Promise<SendNotificationResult> {
  try {
    console.log(`[sendNotification] Invio notifica ${tipoEvento} per servizio ${servizioId}`);

    const { data, error } = await supabase.functions.invoke("send-notification", {
      body: { 
        servizio_id: servizioId, 
        tipo_evento: tipoEvento 
      },
    });

    if (error) {
      console.error("[sendNotification] Errore:", error);
      if (showToast) {
        toast.error("Errore invio notifiche email");
      }
      return { success: false, error: error.message };
    }

    console.log("[sendNotification] Risultato:", data);

    if (data?.sent > 0 && showToast) {
      toast.success(`📧 ${data.sent} email inviate con successo`);
    } else if (data?.sent === 0 && data?.message && showToast) {
      // Nessun destinatario configurato - non mostrare errore, solo log
      console.log("[sendNotification]", data.message);
    }

    if (data?.failed > 0 && showToast) {
      toast.warning(`⚠️ ${data.failed} email non inviate`);
    }

    return {
      success: true,
      sent: data?.sent || 0,
      failed: data?.failed || 0,
      total: data?.total || 0,
      message: data?.message,
    };
  } catch (err: any) {
    console.error("[sendNotification] Eccezione:", err);
    if (showToast) {
      toast.error("Errore invio notifiche email");
    }
    return { success: false, error: err.message };
  }
}

/**
 * Hook per usare sendNotification con stato di loading
 */
export function useSendNotification() {
  const send = async (
    servizioId: string,
    tipoEvento: NotificationEventType,
    showToast: boolean = true
  ) => {
    return sendNotification(servizioId, tipoEvento, showToast);
  };

  return { sendNotification: send };
}
