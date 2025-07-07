import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateConducenteEsterno, useUpdateConducenteEsterno } from '@/hooks/useConducentiEsterni';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

const conducenteEsternoSchema = z.object({
  nome_cognome: z.string().min(1, 'Nome e cognome obbligatorio'),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  telefono: z.string().optional(),
  note: z.string().optional(),
  attivo: z.boolean().default(true),
});

type ConducenteEsternoFormData = z.infer<typeof conducenteEsternoSchema>;

interface ConducenteEsternoFormProps {
  conducente?: ConducenteEsterno | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

export function ConducenteEsternoForm({
  conducente,
  mode,
  onSuccess,
  onCancel
}: ConducenteEsternoFormProps) {
  const createMutation = useCreateConducenteEsterno();
  const updateMutation = useUpdateConducenteEsterno();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<ConducenteEsternoFormData>({
    resolver: zodResolver(conducenteEsternoSchema),
    defaultValues: {
      nome_cognome: conducente?.nome_cognome || '',
      email: conducente?.email || '',
      telefono: conducente?.telefono || '',
      note: conducente?.note || '',
      attivo: conducente?.attivo ?? true,
    }
  });

  const attivo = watch('attivo');

  const onSubmit = async (data: ConducenteEsternoFormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync({
          nome_cognome: data.nome_cognome,
          email: data.email || undefined,
          telefono: data.telefono || undefined,
          note: data.note || undefined,
        });
      } else if (conducente) {
        await updateMutation.mutateAsync({
          id: conducente.id,
          nome_cognome: data.nome_cognome,
          email: data.email || undefined,
          telefono: data.telefono || undefined,
          note: data.note || undefined,
          attivo: data.attivo,
        });
      }
      onSuccess();
    } catch (error) {
      // Error handling is done in the hooks
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nome_cognome">Nome e Cognome *</Label>
        <Input
          id="nome_cognome"
          {...register('nome_cognome')}
          placeholder="Mario Rossi"
        />
        {errors.nome_cognome && (
          <p className="text-sm text-destructive mt-1">{errors.nome_cognome.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="mario.rossi@email.com"
        />
        {errors.email && (
          <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="telefono">Telefono</Label>
        <Input
          id="telefono"
          {...register('telefono')}
          placeholder="+39 123 456 7890"
        />
      </div>

      <div>
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          {...register('note')}
          placeholder="Note aggiuntive..."
          rows={3}
        />
      </div>

      {mode === 'edit' && (
        <div className="flex items-center space-x-2">
          <Switch
            id="attivo"
            checked={attivo}
            onCheckedChange={(checked) => setValue('attivo', checked)}
          />
          <Label htmlFor="attivo">Conducente attivo</Label>
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annulla
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvataggio...' : mode === 'create' ? 'Crea' : 'Aggiorna'}
        </Button>
      </div>
    </form>
  );
}