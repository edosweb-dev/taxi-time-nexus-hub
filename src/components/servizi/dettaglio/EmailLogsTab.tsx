import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface EmailLog {
  log_id: string;
  template_nome: string;
  template_attivo: boolean;
  sent_at: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  smtp_response: string | null;
  retry_count: number;
}

interface EmailLogsTabProps {
  servizioId: string;
}

export function EmailLogsTab({ servizioId }: EmailLogsTabProps) {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["servizio-email-logs", servizioId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_servizio_email_history", {
        p_servizio_id: servizioId,
      });
      if (error) throw error;
      return (data || []) as EmailLog[];
    },
    enabled: !!servizioId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Mail className="h-12 w-12 text-muted-foreground mb-3" />
        <div className="text-lg font-medium">Nessuna email inviata</div>
        <div className="text-sm text-muted-foreground">
          Non sono state inviate email per questo servizio.
        </div>
      </div>
    );
  }

  // Group by sent_at (batch)
  const batches = new Map<string, EmailLog[]>();
  logs.forEach((log) => {
    const key = log.sent_at || "unknown";
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key)!.push(log);
  });

  return (
    <div className="space-y-4">
      {Array.from(batches.entries()).map(([sentAt, batchLogs]) => {
        const sent = batchLogs.filter((l) => l.status === "sent").length;
        const failed = batchLogs.filter((l) => l.status === "failed").length;
        const templateName = batchLogs[0]?.template_nome || "Template";

        return (
          <Card key={sentAt}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm flex items-center gap-2">
                    {templateName}
                    {batchLogs[0]?.template_attivo ? (
                      <Badge variant="default" className="text-[10px]">Attivo</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px]">Inattivo</Badge>
                    )}
                  </CardTitle>
                  <div className="text-xs text-muted-foreground mt-1">
                    {sentAt !== "unknown"
                      ? format(new Date(sentAt), "d MMMM yyyy 'alle' HH:mm", { locale: it })
                      : "Data non disponibile"}
                  </div>
                </div>
                <div className="flex gap-2">
                  {sent > 0 && (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                      {sent} inviate
                    </Badge>
                  )}
                  {failed > 0 && (
                    <Badge variant="destructive">
                      {failed} fallite
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {batchLogs.map((log) => (
                  <div
                    key={log.log_id}
                    className="flex items-start gap-2 p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    {log.status === "sent" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{log.recipient_email}</div>
                      {log.status === "failed" && log.error_message && (
                        <div className="text-xs text-destructive mt-0.5">{log.error_message}</div>
                      )}
                      {log.retry_count > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Tentativi: {log.retry_count}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
