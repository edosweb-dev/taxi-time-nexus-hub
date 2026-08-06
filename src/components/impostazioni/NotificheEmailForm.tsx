import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Mail, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function NotificheEmailForm() {
  const queryClient = useQueryClient();

  const { data: impostazioni, isLoading } = useQuery({
    queryKey: ["impostazioni"],
    queryFn: async () => {
      const { data, error } = await supabase.from("impostazioni").select("*").single();
      if (error) throw error;
      return data;
    },
  });

  const [emailEnabled, setEmailEnabled] = useState(true);
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    if (impostazioni) setEmailEnabled(impostazioni.email_enabled ?? true);
  }, [impostazioni]);

  const salvaMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      if (!impostazioni?.id) throw new Error("Impostazioni non trovate");
      const { error } = await supabase
        .from("impostazioni")
        .update({ email_enabled: enabled })
        .eq("id", impostazioni.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Impostazione salvata" });
      queryClient.invalidateQueries({ queryKey: ["impostazioni"] });
    },
    onError: (err: Error) => {
      toast({ title: "Errore", description: err.message, variant: "destructive" });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      if (!testEmail) throw new Error("Inserisci l'indirizzo a cui inviare la prova");
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: { test_mode: true, test_emails: [testEmail] },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || data?.message || "Invio non riuscito");
      return data;
    },
    onSuccess: () => {
      toast({ title: `Email di prova inviata a ${testEmail}` });
    },
    onError: (err: Error) => {
      toast({ title: "Invio fallito", description: err.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notifiche email
        </CardTitle>
        <CardDescription>
          Le notifiche vengono inviate tramite Resend dal mittente{" "}
          <strong>noreply@taxitime.app</strong>. Le risposte dei clienti arrivano a{" "}
          <strong>info@taxitime.it</strong>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="email-enabled">Invio delle notifiche attivo</Label>
            <p className="text-sm text-muted-foreground">
              Se disattivato, nessuna notifica parte per nessun servizio.
            </p>
          </div>
          <Switch
            id="email-enabled"
            checked={emailEnabled}
            onCheckedChange={(v) => {
              setEmailEnabled(v);
              salvaMutation.mutate(v);
            }}
            disabled={salvaMutation.isPending}
          />
        </div>

        <div className="space-y-2 border-t pt-6">
          <Label htmlFor="test-email">Invia un'email di prova</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="test-email"
              type="email"
              placeholder="indirizzo@esempio.it"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              disabled={testMutation.isPending}
            />
            <Button
              onClick={() => testMutation.mutate()}
              disabled={testMutation.isPending || !testEmail}
            >
              {testMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Invia prova
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
