
import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MailIcon, UserIcon } from 'lucide-react';
import { Servizio } from '@/lib/types/servizi';

interface ConducenteEsternoFormProps {
  servizio: Servizio;
  conducenteEsternoNome: string;
  setConducenteEsternoNome: (value: string) => void;
  conducenteEsternoEmail: string;
  setConducenteEsternoEmail: (value: string) => void;
}

export function ConducenteEsternoForm({
  servizio,
  conducenteEsternoNome,
  setConducenteEsternoNome,
  conducenteEsternoEmail,
  setConducenteEsternoEmail
}: ConducenteEsternoFormProps) {
  useEffect(() => {
    // Initialize values from servizio when component mounts
    setConducenteEsternoNome(servizio.conducente_esterno_nome || '');
    setConducenteEsternoEmail(servizio.conducente_esterno_email || '');
  }, [servizio, setConducenteEsternoNome, setConducenteEsternoEmail]);

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="nome-conducente">Nome e Cognome</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="nome-conducente"
            placeholder="Mario Rossi"
            value={conducenteEsternoNome}
            onChange={(e) => setConducenteEsternoNome(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="email-conducente">Email (opzionale)</Label>
        <div className="relative">
          <MailIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email-conducente"
            type="email"
            placeholder="mario.rossi@example.com"
            value={conducenteEsternoEmail}
            onChange={(e) => setConducenteEsternoEmail(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
