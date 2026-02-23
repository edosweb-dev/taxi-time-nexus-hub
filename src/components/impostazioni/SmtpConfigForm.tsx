import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Loader2, Mail, CheckCircle2, XCircle, Send, X, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SmtpConfig {
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_password: string;
  smtp_from_name: string;
  smtp_from_email: string;
  email_enabled: boolean;
}

export default function SmtpConfigForm() {
  const queryClient = useQueryClient();

  const { data: impostazioni, isLoading } = useQuery({
    queryKey: ["impostazioni"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("impostazioni")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [config, setConfig] = useState<SmtpConfig>({
    smtp_host: "",
    smtp_port: 465,
    smtp_secure: true,
    smtp_user: "",
    smtp_password: "",
    smtp_from_name: "TaxiTime",
    smtp_from_email: "",
    email_enabled: true,
  });

  const [testEmail, setTestEmail] = useState("");
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  useEffect(() => {
    if (impostazioni) {
      setConfig({
        smtp_host: impostazioni.smtp_host || "",
        smtp_port: impostazioni.smtp_port || 465,
        smtp_secure: impostazioni.smtp_secure ?? true,
        smtp_user: impostazioni.smtp_user || "",
        smtp_password: "",
        smtp_from_name: impostazioni.smtp_from_name || "TaxiTime",
        smtp_from_email: impostazioni.smtp_from_email || "",
        email_enabled: impostazioni.email_enabled ?? true,
      });
    }
  }, [impostazioni]);

  const getPasswordForTest = () => {
    if (config.smtp_password) return config.smtp_password;
    if (impostazioni?.smtp_password_encrypted) return atob(impostazioni.smtp_password_encrypted);
    return "";
  };

  const mutation = useMutation({
    mutationFn: async (cfg: SmtpConfig) => {
      if (!impostazioni?.id) throw new Error("Impostazioni non trovate");
      const updateData: Record<string, unknown> = {
        smtp_host: cfg.smtp_host,
        smtp_port: cfg.smtp_port,
        smtp_secure: cfg.smtp_secure,
        smtp_user: cfg.smtp_user,
        smtp_from_name: cfg.smtp_from_name,
        smtp_from_email: cfg.smtp_from_email,
        email_enabled: cfg.email_enabled,
      };
      if (cfg.smtp_password) {
        updateData.smtp_password_encrypted = btoa(cfg.smtp_password);
      }
      const { error } = await supabase
        .from("impostazioni")
        .update(updateData)
        .eq("id", impostazioni.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Configurazione SMTP salvata!" });
      queryClient.invalidateQueries({ queryKey: ["impostazioni"] });
    },
    onError: (err: Error) => {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error("Inserisci email destinatario test");
      const password = getPasswordForTest();
      if (!password) throw new Error("Password SMTP non configurata");

      setTestLogs([]);
      setShowLogs(true);

      const { data, error } = await supabase.functions.invoke("test-smtp-connection", {
        body: {
          smtp_host: config.smtp_host,
          smtp_port: config.smtp_port,
          smtp_secure: config.smtp_secure,
          smtp_user: config.smtp_user,
          smtp_password: password,
          smtp_from_name: config.smtp_from_name,
          smtp_from_email: config.smtp_from_email,
          test_recipient: testEmail,
        },
      });

      if (error) {
        setTestLogs(["[ERROR] " + error.message]);
        throw error;
      }

      if (!data?.success) {
        setTestLogs(data?.logs || ["[ERROR] " + (data?.error || "Test fallito")]);
        const errMsg = data?.suggestion
          ? `${data.error}\n\n${data.suggestion}`
          : data?.error || "Test fallito";
        throw new Error(errMsg);
      }

      setTestLogs(data?.logs || []);
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "✅ Test connessione riuscito!", description: data.message });
    },
    onError: (err: Error) => {
      toast({ title: "❌ Test connessione fallito", description: err.message, variant: "destructive" });
    },
  });

  const handlePortChange = (val: string) => {
    const port = parseInt(val, 10);
    setConfig((c) => ({ ...c, smtp_port: port, smtp_secure: port === 465 }));
  };

  const getLogLineClass = (log: string) => {
    if (log.includes("[ERROR]") || log.includes("[DIAGNOSI]")) return "text-red-400";
    if (log.includes("✓") || log.includes("SUCCESS")) return "text-green-400";
    if (log.includes("[SUGGERIMENTO]")) return "text-yellow-400";
    return "text-green-300/80";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stato Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Stato Email
          </CardTitle>
          <CardDescription>Abilita o disabilita l'invio di email dal sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Abilitate</div>
              <div className="text-sm text-muted-foreground">
                {config.email_enabled ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Sistema attivo
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="h-4 w-4" /> Sistema disattivato
                  </span>
                )}
              </div>
            </div>
            <Switch
              checked={config.email_enabled}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, email_enabled: v }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurazione SMTP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurazione Server SMTP
          </CardTitle>
          <CardDescription>Parametri di connessione al server di posta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Host SMTP</Label>
              <Input
                value={config.smtp_host}
                onChange={(e) => setConfig((c) => ({ ...c, smtp_host: e.target.value }))}
                placeholder="smtp.aruba.it"
              />
            </div>
            <div className="space-y-2">
              <Label>Porta</Label>
              <Select value={String(config.smtp_port)} onValueChange={handlePortChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="465">465 (SSL)</SelectItem>
                  <SelectItem value="587">587 (TLS)</SelectItem>
                  <SelectItem value="25">25 (Non sicura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Utente SMTP</Label>
              <Input
                value={config.smtp_user}
                onChange={(e) => setConfig((c) => ({ ...c, smtp_user: e.target.value }))}
                placeholder="noreply@taxitime.it"
              />
            </div>
            <div className="space-y-2">
              <Label>Password SMTP</Label>
              <Input
                type="password"
                value={config.smtp_password}
                onChange={(e) => setConfig((c) => ({ ...c, smtp_password: e.target.value }))}
                placeholder="Lascia vuoto per mantenere"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome Mittente</Label>
              <Input
                value={config.smtp_from_name}
                onChange={(e) => setConfig((c) => ({ ...c, smtp_from_name: e.target.value }))}
                placeholder="TaxiTime"
              />
            </div>
            <div className="space-y-2">
              <Label>Email Mittente</Label>
              <Input
                type="email"
                value={config.smtp_from_email}
                onChange={(e) => setConfig((c) => ({ ...c, smtp_from_email: e.target.value }))}
                placeholder="noreply@taxitime.it"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Switch
              checked={config.smtp_secure}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, smtp_secure: v }))}
            />
            <Label>Connessione sicura (SSL/TLS)</Label>
          </div>
        </CardContent>
      </Card>

      {/* Test Connessione */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Connessione
          </CardTitle>
          <CardDescription>
            Invia un'email di test per verificare che la configurazione SMTP funzioni correttamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="tua@email.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !testEmail || !config.smtp_host}
            >
              {testMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invio test...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test Connessione
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Inserisci un indirizzo email e premi "Test Connessione" per verificare la configurazione
          </p>

          {/* Log Output */}
          {showLogs && testLogs.length > 0 && (
            <Card className={`mt-4 border-2 ${testMutation.isSuccess ? 'border-green-500' : 'border-red-500'} bg-gray-950`}>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-mono">
                    {testMutation.isSuccess ? (
                      <span className="flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Test Completato con Successo
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-red-400">
                        <XCircle className="h-4 w-4" />
                        Test Fallito
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={() => setShowLogs(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <div className="bg-black rounded-md p-3 font-mono text-xs leading-relaxed max-h-64 overflow-y-auto">
                  {testLogs.map((log, idx) => (
                    <div key={idx} className={getLogLineClass(log)}>
                      {log}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white hover:bg-gray-800 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(testLogs.join('\n'));
                      toast({ title: '📋 Log copiati negli appunti' });
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copia Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => {
            if (impostazioni) {
              setConfig({
                smtp_host: impostazioni.smtp_host || "",
                smtp_port: impostazioni.smtp_port || 465,
                smtp_secure: impostazioni.smtp_secure ?? true,
                smtp_user: impostazioni.smtp_user || "",
                smtp_password: "",
                smtp_from_name: impostazioni.smtp_from_name || "TaxiTime",
                smtp_from_email: impostazioni.smtp_from_email || "",
                email_enabled: impostazioni.email_enabled ?? true,
              });
            }
          }}
        >
          Annulla
        </Button>
        <Button
          onClick={() => mutation.mutate(config)}
          disabled={mutation.isPending}
        >
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salva Configurazione
        </Button>
      </div>
    </div>
  );
}
