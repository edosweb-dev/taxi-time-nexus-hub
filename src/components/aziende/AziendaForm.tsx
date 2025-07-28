
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
      emails: azienda?.emails || [],
      telefoni: azienda?.telefoni || [],
      indirizzo: azienda?.indirizzo || '',
      firma_digitale_attiva: azienda?.firma_digitale_attiva || false,
      provvigione: azienda?.provvigione || false,
      provvigione_tipo: azienda?.provvigione_tipo || 'fisso',
      provvigione_valore: azienda?.provvigione_valore || 0,
    },
  });

  const handleSubmit = (values: z.infer<typeof aziendaFormSchema>) => {
    // Filtra email e telefoni vuoti
    const filteredEmails = values.emails?.filter(email => email.trim() !== '') || [];
    const filteredTelefoni = values.telefoni?.filter(telefono => telefono.trim() !== '') || [];
    
    const aziendaData: AziendaFormData = {
      nome: values.nome.trim(),
      partita_iva: values.partita_iva.trim(),
      email: values.email ? values.email.trim() : undefined,
      telefono: values.telefono ? values.telefono.trim() : undefined,
      emails: filteredEmails.length > 0 ? filteredEmails : undefined,
      telefoni: filteredTelefoni.length > 0 ? filteredTelefoni : undefined,
      indirizzo: values.indirizzo ? values.indirizzo.trim() : undefined,
      firma_digitale_attiva: values.firma_digitale_attiva,
      provvigione: values.provvigione,
      provvigione_tipo: values.provvigione ? values.provvigione_tipo : undefined,
      provvigione_valore: values.provvigione ? values.provvigione_valore : undefined,
    };
    
    onSubmit(aziendaData);
  };

  return (
    <div className="relative">
      <Form {...form}>
        <div className="space-y-8">
          {/* Main Information Card */}
          <Card className="border-l-4 border-l-primary shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in">
            <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                Informazioni Principali
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AziendaNameFields control={form.control} />
            </CardContent>
          </Card>
          
          {/* Contact Information Card */}
          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in [animation-delay:100ms]">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-500/5 to-transparent">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Phone className="h-5 w-5 text-blue-500" />
                </div>
                Informazioni di Contatto
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AziendaContactFields control={form.control} />
            </CardContent>
          </Card>
          
          {/* Settings Card */}
          <Card className="border-l-4 border-l-amber-500 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in [animation-delay:200ms]">
            <CardHeader className="pb-6 bg-gradient-to-r from-amber-500/5 to-transparent">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Settings className="h-5 w-5 text-amber-500" />
                </div>
                Configurazioni Azienda
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <AziendaSettingsFields control={form.control} />
            </CardContent>
          </Card>
        </div>
      </Form>
      
      {/* Action Buttons Sticky */}
      <div className="sticky bottom-0 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-sm border-t border-border/50 p-6 mt-8 animate-fade-in [animation-delay:300ms]">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex items-center gap-2 px-6 py-3 hover-scale transition-all duration-200"
            size="lg"
          >
            <X className="h-4 w-4" />
            Annulla
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 hover-scale transition-all duration-200 shadow-lg"
            onClick={form.handleSubmit(handleSubmit)}
            size="lg"
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
    </div>
  );
}
