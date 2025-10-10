
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AziendaFormData } from '@/lib/api/aziende';
import { Azienda } from '@/lib/types';
import { Building2, Mail, Phone, MapPin, Settings, Save, X } from 'lucide-react';
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
    // Filtra email e telefoni vuoti
    const filteredEmails = values.emails?.filter(email => email.trim() !== '') || [];
    const filteredTelefoni = values.telefoni?.filter(telefono => telefono.trim() !== '') || [];
    
    // Combina email e telefoni principali con quelli aggiuntivi per il salvataggio
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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <div className="space-y-6">
          {/* Main Information Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                Informazioni Principali
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AziendaNameFields control={form.control} />
            </CardContent>
          </Card>
          
          {/* Contact Information Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Phone className="h-6 w-6 text-blue-500" />
                Informazioni di Contatto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AziendaContactFields control={form.control} />
            </CardContent>
          </Card>
          
          {/* Settings Card */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <Settings className="h-6 w-6 text-amber-500" />
                Configurazioni Azienda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AziendaSettingsFields control={form.control} />
            </CardContent>
          </Card>
        </div>
      </Form>
      
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex items-center gap-2"
        >
            <X className="h-4 w-4" />
            Annulla
          </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="flex items-center gap-2"
          onClick={form.handleSubmit(handleSubmit)}
        >
            <Save className="h-4 w-4" />
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvataggio...
              </>
          ) : isEditing ? 'Aggiorna Azienda' : 'Crea Azienda'}
        </Button>
      </div>
    </div>
  );
}
