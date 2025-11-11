import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserFormData } from '@/lib/api/users/types';

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
  const {
    register,
    handleSubmit,
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

  const onSubmitForm = async (data: QuickFormData) => {
    await onSubmit({
      ...data,
      role: 'cliente',
      azienda_id: aziendaId,
    } as UserFormData);
  };

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
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="mario.rossi@azienda.it"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
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
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? "Creazione..." : "Crea Referente"}
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
