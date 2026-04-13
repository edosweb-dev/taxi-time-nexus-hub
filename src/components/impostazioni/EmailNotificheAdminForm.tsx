import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, X, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface EmailNotificheAdminFormProps {
  emails: string[];
  onChange: (emails: string[]) => void;
}

export function EmailNotificheAdminForm({ emails, onChange }: EmailNotificheAdminFormProps) {
  const [inputValue, setInputValue] = useState("");
  const [errore, setErrore] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const aggiungiEmail = (raw: string) => {
    const email = raw.trim().toLowerCase().replace(/,+$/, "");
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
    setInputValue("");
    setErrore("");
  };

  const rimuoviEmail = (emailToRemove: string) => {
    onChange(emails.filter(e => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      aggiungiEmail(inputValue);
    }
    if (e.key === "Backspace" && !inputValue && emails.length > 0) {
      rimuoviEmail(emails[emails.length - 1]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    const parts = pasted.split(/[,;\s]+/).filter(Boolean);
    parts.forEach(aggiungiEmail);
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
      <CardContent className="space-y-3">
        {emails.length === 0 && !inputValue && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nessuna email configurata. Non riceverai notifiche quando i clienti creano nuovi servizi.
            </AlertDescription>
          </Alert>
        )}

        {/* Tag input area */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 min-h-[42px] w-full rounded-md border bg-background px-3 py-2 cursor-text transition-colors",
            "border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background",
            errore && "border-destructive focus-within:ring-destructive"
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {emails.map((email) => (
            <span
              key={email}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-sm font-medium animate-scale-in"
            >
              {email}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  rimuoviEmail(email);
                }}
                className="ml-0.5 rounded-full p-0.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="email"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrore("");
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue.trim()) aggiungiEmail(inputValue);
            }}
            placeholder={emails.length === 0 ? "Scrivi un'email e premi Invio..." : "Aggiungi..."}
            className="flex-1 min-w-[140px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
          />
        </div>

        {errore && (
          <p className="text-sm text-destructive">{errore}</p>
        )}
      </CardContent>
    </Card>
  );
}
