import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { AziendaFormData } from '@/lib/api/aziende';
import { Azienda } from '@/lib/types';
import { MobileAziendaFormHeader } from './MobileAziendaFormHeader';
import { MobileAziendaFormFooter } from './MobileAziendaFormFooter';
import { MobileAziendaFormSections } from './MobileAziendaFormSections';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MobileAziendaFormProps {
  azienda?: Azienda | null;
  onSubmit: (data: AziendaFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const aziendaFormSchema = z.object({
  nome: z.string().min(2, { message: 'Il nome deve contenere almeno 2 caratteri' }),
  partita_iva: z.string().regex(/^\d{11}$/, { 
    message: 'La partita IVA deve contenere esattamente 11 cifre numeriche' 
  }),
  email: z.string().email({ message: 'Inserisci un indirizzo email valido' }).optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  emails: z.array(z.string().email({ message: 'Inserisci indirizzi email validi' })).optional(),
  telefoni: z.array(z.string()).optional(),
  indirizzo: z.string().optional().or(z.literal('')),
  citta: z.string().optional().or(z.literal('')),
  sdi: z.string().optional().or(z.literal('')),
  pec: z.string().email({ message: 'Inserisci un indirizzo PEC valido' }).optional().or(z.literal('')),
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

export function MobileAziendaForm({ azienda, onSubmit, onCancel, isSubmitting }: MobileAziendaFormProps) {
  const isEditing = !!azienda;
  const [showExitDialog, setShowExitDialog] = useState(false);

  const form = useForm<z.infer<typeof aziendaFormSchema>>({
    resolver: zodResolver(aziendaFormSchema),
    defaultValues: {
      nome: azienda?.nome || '',
      partita_iva: azienda?.partita_iva || '',
      email: azienda?.email || '',
      telefono: azienda?.telefono || '',
      emails: (azienda?.emails || []).filter(email => email !== azienda?.email),
      telefoni: (azienda?.telefoni || []).filter(telefono => telefono !== azienda?.telefono),
      indirizzo: azienda?.indirizzo || '',
      citta: azienda?.citta || '',
      sdi: azienda?.sdi || '',
      pec: azienda?.pec || '',
      firma_digitale_attiva: azienda?.firma_digitale_attiva || false,
      provvigione: azienda?.provvigione || false,
      provvigione_tipo: azienda?.provvigione_tipo as 'fisso' | 'percentuale' || 'fisso',
      provvigione_valore: azienda?.provvigione_valore || 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof aziendaFormSchema>) => {
    const filteredEmails = values.emails?.filter(email => email.trim() !== '') || [];
    const filteredTelefoni = values.telefoni?.filter(telefono => telefono.trim() !== '') || [];
    
    const allEmails = [];
    if (values.email && values.email.trim()) {
      allEmails.push(values.email.trim());
    }
    allEmails.push(...filteredEmails);
    
    const allTelefoni = [];
    if (values.telefono && values.telefono.trim()) {
      allTelefoni.push(values.telefono.trim());
    }
    allTelefoni.push(...filteredTelefoni);
    
    const aziendaData: AziendaFormData = {
      nome: values.nome.trim(),
      partita_iva: values.partita_iva.trim(),
      email: values.email ? values.email.trim() : undefined,
      telefono: values.telefono ? values.telefono.trim() : undefined,
      emails: allEmails.length > 0 ? allEmails : undefined,
      telefoni: allTelefoni.length > 0 ? allTelefoni : undefined,
      indirizzo: values.indirizzo ? values.indirizzo.trim() : undefined,
      citta: values.citta ? values.citta.trim() : undefined,
      sdi: values.sdi ? values.sdi.trim() : undefined,
      pec: values.pec ? values.pec.trim() : undefined,
      firma_digitale_attiva: values.firma_digitale_attiva,
      provvigione: values.provvigione,
      provvigione_tipo: values.provvigione ? values.provvigione_tipo : undefined,
      provvigione_valore: values.provvigione ? values.provvigione_valore : undefined,
    };
    
    onSubmit(aziendaData);
  };

  const handleBack = () => {
    if (form.formState.isDirty) {
      setShowExitDialog(true);
    } else {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-background flex flex-col lg:relative lg:z-0">
      <MobileAziendaFormHeader
        title={isEditing ? 'Modifica Azienda' : 'Nuova Azienda'}
        onBack={handleBack}
      />

      <div className="flex-1 overflow-y-auto pb-24">
        <Form {...form}>
          <MobileAziendaFormSections control={form.control} />
        </Form>
      </div>

      <MobileAziendaFormFooter
        onCancel={handleBack}
        onSubmit={form.handleSubmit(handleSubmit)}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
      />

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Modifiche non salvate</AlertDialogTitle>
            <AlertDialogDescription>
              Hai modifiche non salvate. Vuoi uscire senza salvare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Resta qui</AlertDialogCancel>
            <AlertDialogAction onClick={onCancel}>
              Esci senza salvare
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
