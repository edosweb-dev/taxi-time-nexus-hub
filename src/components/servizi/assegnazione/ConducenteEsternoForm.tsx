
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MailIcon, UserIcon } from 'lucide-react';
import { Servizio } from '@/lib/types/servizi';
import { useConducenteEsternoForm } from './hooks/useConducenteEsternoForm';

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
  // Using our custom hook for form validation
  const { isValid } = useConducenteEsternoForm({ servizio });

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
            className={`pl-10 ${!conducenteEsternoNome.trim() ? 'border-red-500' : ''}`}
          />
        </div>
        {!conducenteEsternoNome.trim() && (
          <p className="text-xs text-red-500 mt-1">
            Il nome è obbligatorio
          </p>
        )}
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
