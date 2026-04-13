import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, X, Mail, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailNotificheAdminFormProps {
  emails: string[];
  onChange: (emails: string[]) => void;
}

export function EmailNotificheAdminForm({ emails, onChange }: EmailNotificheAdminFormProps) {
  const [nuovaEmail, setNuovaEmail] = useState("");
  const [errore, setErrore] = useState("");

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const aggiungiEmail = () => {
    const email = nuovaEmail.trim().toLowerCase();
    if (!email) return;

    if (!isValidEmail(email)) {
      setErrore("Formato email non valido");
      return;
    }

    if (emails.includes(email)) {
      setErrore("Email già presente nella lista");
      return;
    }

    onChange([...emails, email]);
    setNuovaEmail("");
    setErrore("");
  };

  const rimuoviEmail = (emailToRemove: string) => {
    onChange(emails.filter(e => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      aggiungiEmail();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Notifiche Admin
        </CardTitle>
        <CardDescription>
          Questi indirizzi riceveranno una notifica automatica ogni volta che un cliente crea una nuova richiesta di servizio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {emails.length === 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nessuna email configurata. Non riceverai notifiche quando i clienti creano nuovi servizi.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista email esistenti */}
        {emails.length > 0 && (
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email} className="flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{email}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => rimuoviEmail(email)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Input nuova email */}
        <div className="space-y-2">
          <Label htmlFor="nuova-email-admin">Aggiungi indirizzo email</Label>
          <div className="flex gap-2">
            <Input
              id="nuova-email-admin"
              type="email"
              placeholder="admin@esempio.it"
              value={nuovaEmail}
              onChange={(e) => {
                setNuovaEmail(e.target.value);
                setErrore("");
              }}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={aggiungiEmail}
              disabled={!nuovaEmail.trim()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errore && (
            <p className="text-sm text-destructive">{errore}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
