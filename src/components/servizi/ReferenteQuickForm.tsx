import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserFormData } from '@/lib/api/users/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const quickFormSchema = z.object({
  first_name: z.string().min(1, "Nome richiesto"),
  last_name: z.string().min(1, "Cognome richiesto"),
  email: z.string().email("Email non valida").optional().or(z.literal('')),
  phone: z.string().optional(),
});

type QuickFormData = z.infer<typeof quickFormSchema>;

interface ReferenteQuickFormProps {
  aziendaId: string;
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel: () => void;
  onSwitchToComplete: () => void;
  isSubmitting: boolean;
}

export function ReferenteQuickForm({
  aziendaId,
  onSubmit,
  onCancel,
  onSwitchToComplete,
  isSubmitting,
}: ReferenteQuickFormProps) {
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<QuickFormData>({
    resolver: zodResolver(quickFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  const emailValue = watch('email');

  // Verifica email con debounce
  useEffect(() => {
    const checkEmailExists = async () => {
      const trimmedEmail = emailValue?.trim().toLowerCase();
      
      if (!trimmedEmail || trimmedEmail.length < 5 || !trimmedEmail.includes('@')) {
        setEmailExists(false);
        setIsCheckingEmail(false);
        return;
      }

      setIsCheckingEmail(true);
      
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', trimmedEmail)
          .maybeSingle();
        
        setEmailExists(!!data);
      } catch (error) {
        console.error('Error checking email:', error);
        setEmailExists(false);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timer = setTimeout(checkEmailExists, 300);
    return () => clearTimeout(timer);
  }, [emailValue]);

  const onSubmitForm = async (data: QuickFormData) => {
    if (emailExists) {
      toast.error("L'email inserita è già registrata. Utilizza un indirizzo diverso.");
      return;
    }
    
    await onSubmit({
      ...data,
      role: 'cliente',
      azienda_id: aziendaId,
    } as UserFormData);
  };

  const hasValidEmail = emailValue && emailValue.trim().length >= 5 && emailValue.includes('@');
  const showEmailStatus = hasValidEmail && !isCheckingEmail;

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="first_name">
            Nome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="first_name"
            {...register('first_name')}
            placeholder="Mario"
            disabled={isSubmitting}
          />
          {errors.first_name && (
            <p className="text-sm text-destructive">{errors.first_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">
            Cognome <span className="text-destructive">*</span>
          </Label>
          <Input
            id="last_name"
            {...register('last_name')}
            placeholder="Rossi"
            disabled={isSubmitting}
          />
          {errors.last_name && (
            <p className="text-sm text-destructive">{errors.last_name.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="mario.rossi@azienda.it"
            disabled={isSubmitting}
            className={cn(
              "pr-10",
              showEmailStatus && emailExists && "border-destructive focus-visible:ring-destructive",
              showEmailStatus && !emailExists && "border-green-500 focus-visible:ring-green-500"
            )}
          />
          {isCheckingEmail && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {showEmailStatus && emailExists && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
          {showEmailStatus && !emailExists && (
            <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
        {showEmailStatus && emailExists && (
          <p className="text-sm text-destructive">
            Questa email è già registrata. Utilizza un indirizzo diverso.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefono</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="+39 123 456 7890"
          disabled={isSubmitting}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-4 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            disabled={isSubmitting}
          >
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isCheckingEmail || emailExists} 
            className="flex-1"
          >
            {isCheckingEmail ? "Verifica..." : isSubmitting ? "Creazione..." : "Crea Referente"}
          </Button>
        </div>

        <Button
          type="button"
          variant="link"
          onClick={onSwitchToComplete}
          className="text-xs text-muted-foreground h-auto py-1"
          disabled={isSubmitting}
        >
          Vuoi aggiungere più dettagli? →
        </Button>
      </div>
    </form>
  );
}
