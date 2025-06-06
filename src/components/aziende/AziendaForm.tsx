
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { AziendaFormData } from '@/lib/api/aziende';
import { Azienda } from '@/lib/types';
import {
  AziendaNameFields,
  AziendaContactFields,
  AziendaSettingsFields
} from './form-fields';

interface AziendaFormProps {
  azienda?: Azienda | null;
  onSubmit: (data: AziendaFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function AziendaForm({ azienda, onSubmit, onCancel, isSubmitting }: AziendaFormProps) {
  const isEditing = !!azienda;

  const aziendaFormSchema = z.object({
    nome: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
    partita_iva: z.string().regex(/^\d{11}$/, { 
      message: 'La partita IVA deve contenere esattamente 11 cifre numeriche' 
    }),
    email: z.string().email({ message: 'Inserisci un indirizzo email valido' }).optional().or(z.literal('')),
    telefono: z.string().optional().or(z.literal('')),
    indirizzo: z.string().optional().or(z.literal('')),
    firma_digitale_attiva: z.boolean().default(false),
    provvigione: z.boolean().default(false),
    provvigione_tipo: z.enum(['fisso', 'percentuale']).optional(),
    provvigione_valore: z.number().min(0, { message: 'Il valore deve essere maggiore o uguale a 0' }).optional(),
  }).refine((data) => {
    if (data.provvigione && (!data.provvigione_tipo || data.provvigione_valore === undefined)) {
      return false;
    }
    return true;
  }, {
    message: 'Quando le provvigioni sono attive, è necessario specificare tipo e valore',
    path: ['provvigione_valore'],
  });

  const form = useForm<z.infer<typeof aziendaFormSchema>>({
    resolver: zodResolver(aziendaFormSchema),
    defaultValues: {
      nome: azienda?.nome || '',
      partita_iva: azienda?.partita_iva || '',
      email: azienda?.email || '',
      telefono: azienda?.telefono || '',
      indirizzo: azienda?.indirizzo || '',
      firma_digitale_attiva: azienda?.firma_digitale_attiva || false,
      provvigione: azienda?.provvigione || false,
      provvigione_tipo: azienda?.provvigione_tipo || 'fisso',
      provvigione_valore: azienda?.provvigione_valore || 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof aziendaFormSchema>) => {
    const aziendaData: AziendaFormData = {
      nome: values.nome.trim(),
      partita_iva: values.partita_iva.trim(),
      email: values.email ? values.email.trim() : undefined,
      telefono: values.telefono ? values.telefono.trim() : undefined,
      indirizzo: values.indirizzo ? values.indirizzo.trim() : undefined,
      firma_digitale_attiva: values.firma_digitale_attiva,
      provvigione: values.provvigione,
      provvigione_tipo: values.provvigione ? values.provvigione_tipo : undefined,
      provvigione_valore: values.provvigione ? values.provvigione_valore : undefined,
    };
    
    onSubmit(aziendaData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Informazioni principali</h3>
          <AziendaNameFields control={form.control} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Contatti</h3>
          <AziendaContactFields control={form.control} />
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Impostazioni</h3>
          <AziendaSettingsFields control={form.control} />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvataggio in corso...' : isEditing ? 'Aggiorna Azienda' : 'Crea Azienda'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
