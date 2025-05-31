
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Loader2 } from 'lucide-react';
import { resetUserPassword } from '@/lib/api/users';
import { toast } from '@/components/ui/sonner';

interface RecuperaPasswordDialogProps {
  children: React.ReactNode;
}

export function RecuperaPasswordDialog({ children }: RecuperaPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Inserisci un indirizzo email valido');
      return;
    }

    setIsLoading(true);
    
    try {
      const { success, error } = await resetUserPassword(email);
      
      if (success) {
        toast.success(`Email di recupero password inviata a ${email}`);
        setEmail('');
        setIsOpen(false);
      } else {
        toast.error(`Errore nell'invio dell'email: ${error?.message || 'Si è verificato un errore'}`);
      }
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(`Errore nell'invio dell'email: ${error.message || 'Si è verificato un errore'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recupera Password</DialogTitle>
          <DialogDescription>
            Inserisci il tuo indirizzo email e ti invieremo un link per reimpostare la password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Indirizzo Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="nome@esempio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-taxitime-600 hover:bg-taxitime-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Invia Email
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
