import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layouts/MainLayout";
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
import { Settings, Loader2, Mail, CheckCircle2, XCircle } from "lucide-react";
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

export default function ImpostazioniSmtpPage() {
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

  const handlePortChange = (val: string) => {
    const port = parseInt(val, 10);
    setConfig((c) => ({
      ...c,
      smtp_port: port,
      smtp_secure: port === 465,
    }));
  };

  if (isLoading) {
    return (
      <MainLayout title="Configurazione SMTP">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Configurazione SMTP">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Stato Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Stato Email
            </CardTitle>
            <CardDescription>
              Abilita o disabilita l'invio di email dal sistema
            </CardDescription>
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
            <CardDescription>
              Parametri di connessione al server di posta
            </CardDescription>
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
                <Select
                  value={String(config.smtp_port)}
                  onValueChange={handlePortChange}
                >
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
    </MainLayout>
  );
}
