import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Profile } from '@/lib/types';
import { Eye, EyeOff, RefreshCw, Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile;
  onSuccess: () => void;
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
  onSuccess
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    const newPassword = Array.from({ length: 12 }, () => 
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    setPassword(newPassword);
    setShowPassword(true);
  };

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast.error('La password deve essere minimo 6 caratteri');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `https://iczxhmzwjopfdvbxwzjs.supabase.co/functions/v1/update-user-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            newPassword: password,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Errore durante il reset della password');
      }

      // Copy password to clipboard
      await navigator.clipboard.writeText(password);

      toast.success(
        `Password aggiornata con successo per ${user.first_name} ${user.last_name}. Password copiata negli appunti: ${password}`,
        { duration: 10000 }
      );

      onSuccess();
      onOpenChange(false);
      setPassword('');
      setShowPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Errore durante il reset della password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setPassword('');
    setShowPassword(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Reset Password - {user.first_name} {user.last_name}
          </DialogTitle>
          <DialogDescription>
            Imposta una nuova password per questo utente. La password verrà aggiornata immediatamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nuova Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci nuova password"
                  minLength={6}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={generatePassword}
                title="Genera password casuale"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              La password deve essere minimo 6 caratteri
            </p>
          </div>

          {password && (
            <div className="p-3 bg-muted rounded-md flex items-center justify-between">
              <code className="text-sm font-mono">{password}</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(password);
                  toast.success('Password copiata negli appunti');
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aggiornamento...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Salva Nuova Password
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
