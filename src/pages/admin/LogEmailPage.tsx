import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, Mail, Loader2, ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";
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

export default function LogEmailPage() {
  const [inputId, setInputId] = useState("");
  const [searchedId, setSearchedId] = useState("");
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ["email-logs-search", searchedId],
    queryFn: async () => {
      if (!searchedId) return null;
      const { data, error } = await supabase.rpc("get_servizio_email_history", {
        p_servizio_id: searchedId,
      });
      if (error) throw error;
      return (data || []) as EmailLog[];
    },
    enabled: !!searchedId,
  });

  const handleSearch = () => {
    if (inputId.trim()) {
      setSearchedId(inputId.trim());
      setOpenItems(new Set());
    }
  };

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Group by sent_at
  const batches = new Map<string, EmailLog[]>();
  logs?.forEach((log) => {
    const key = log.sent_at || "unknown";
    if (!batches.has(key)) batches.set(key, []);
    batches.get(key)!.push(log);
  });

  return (
    <MainLayout title="Log Email">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Ricerca Log Email</h2>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Input
                placeholder="Inserisci ID servizio (UUID)"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={!inputId.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">Cerca</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {searchedId && !isLoading && logs !== null && logs !== undefined && (
          <>
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="h-12 w-12 text-muted-foreground mb-3" />
                <div className="text-lg font-medium">Nessun risultato</div>
                <div className="text-sm text-muted-foreground">
                  Nessuna email trovata per questo servizio.
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from(batches.entries()).map(([sentAt, batchLogs]) => {
                  const sent = batchLogs.filter((l) => l.status === "sent").length;
                  const failed = batchLogs.filter((l) => l.status === "failed").length;
                  const templateName = batchLogs[0]?.template_nome || "Template";
                  const isOpen = openItems.has(sentAt);

                  return (
                    <Collapsible key={sentAt} open={isOpen} onOpenChange={() => toggleItem(sentAt)}>
                      <Card>
                        <CollapsibleTrigger asChild>
                          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-sm">{templateName}</CardTitle>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {sentAt !== "unknown"
                                    ? format(new Date(sentAt), "d MMMM yyyy 'alle' HH:mm", { locale: it })
                                    : "Data non disponibile"}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {sent > 0 && (
                                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                                    {sent} ✓
                                  </Badge>
                                )}
                                {failed > 0 && (
                                  <Badge variant="destructive">{failed} ✗</Badge>
                                )}
                                {isOpen ? (
                                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CardHeader>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {batchLogs.map((log) => (
                                <div
                                  key={log.log_id}
                                  className="p-3 rounded-lg bg-muted/30 text-sm space-y-1"
                                >
                                  <div className="flex items-center gap-2">
                                    {log.status === "sent" ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                                    )}
                                    <span className="font-medium">{log.recipient_email}</span>
                                    <Badge variant={log.status === "sent" ? "default" : "destructive"} className="text-[10px]">
                                      {log.status}
                                    </Badge>
                                  </div>
                                  {log.error_message && (
                                    <div className="text-xs text-destructive pl-6">{log.error_message}</div>
                                  )}
                                  {log.smtp_response && (
                                    <div className="text-xs text-muted-foreground pl-6">
                                      SMTP: {log.smtp_response}
                                    </div>
                                  )}
                                  {log.retry_count > 0 && (
                                    <div className="text-xs text-muted-foreground pl-6">
                                      Tentativi: {log.retry_count}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
