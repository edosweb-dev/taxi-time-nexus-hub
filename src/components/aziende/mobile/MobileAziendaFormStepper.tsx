import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AziendaFormData } from '@/lib/api/aziende';
import { Azienda } from '@/lib/types';
import { useFormStepper } from '@/hooks/useFormStepper';
import { useDraftSave } from '@/hooks/useDraftSave';
import { MobileFormHeader } from './MobileFormHeader';
import { MobileFormFooter } from './MobileFormFooter';
import { MobileArrayField } from './MobileArrayField';
import { Mail, Phone, Building2, FileText, CreditCard, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Info Base', fields: ['nome', 'partita_iva', 'indirizzo', 'citta'] },
  { id: 2, title: 'Fatturazione', fields: ['sdi', 'pec'] },
  { id: 3, title: 'Contatti', fields: ['email', 'telefono', 'emails', 'telefoni'] },
  { id: 4, title: 'Settings', fields: ['firma_digitale_attiva', 'provvigione', 'provvigione_tipo', 'provvigione_valore'] },
];

interface MobileAziendaFormStepperProps {
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

export function MobileAziendaFormStepper({ 
  azienda, 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: MobileAziendaFormStepperProps) {
  const { toast } = useToast();
  const isEditing = !!azienda;
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

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
      provvigione_tipo: (azienda?.provvigione_tipo as 'fisso' | 'percentuale') || 'fisso',
      provvigione_valore: azienda?.provvigione_valore || 0,
    },
  });

  const draftKey = azienda?.id ? `azienda_edit_${azienda.id}` : 'azienda_create';
  const { loadDraft, clearDraft, hasDraft } = useDraftSave({
    form,
    draftKey,
    enabled: !isEditing, // Only auto-save for new companies
  });

  const {
    currentStep,
    completedSteps,
    isFirstStep,
    isLastStep,
    progress,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    totalSteps,
  } = useFormStepper({
    steps: STEPS,
    form,
  });

  // Load draft on mount (only for new companies)
  useEffect(() => {
    if (!isEditing && hasDraft()) {
      setShowDraftDialog(true);
    }
  }, []);

  const handleLoadDraft = () => {
    const draft = loadDraft();
    if (draft) {
      form.reset(draft);
      toast({
        title: 'Bozza caricata',
        description: 'La bozza salvata è stata ripristinata',
      });
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftDialog(false);
  };

  const handleBack = () => {
    if (form.formState.isDirty) {
      setShowExitDialog(true);
    } else {
      clearDraft();
      onCancel();
    }
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Bozza salvata',
      description: 'I tuoi dati sono stati salvati automaticamente',
    });
  };

  const handleNext = async () => {
    const success = await goToNextStep();
    if (!success) {
      toast({
        variant: 'destructive',
        title: 'Errore validazione',
        description: 'Completa tutti i campi obbligatori prima di continuare',
      });
    }
  };

  const handleFormSubmit = (values: z.infer<typeof aziendaFormSchema>) => {
    // Filter empty emails and phones
    const filteredEmails = values.emails?.filter(email => email.trim() !== '') || [];
    const filteredTelefoni = values.telefoni?.filter(telefono => telefono.trim() !== '') || [];
    
    // Combine primary and additional contacts
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
    
    clearDraft();
    onSubmit(aziendaData);
  };

  const provvigioneAttiva = form.watch('provvigione');
  const provvigioneTipo = form.watch('provvigione_tipo');

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Info Base
        return (
          <div className="space-y-6">
            <Card className="p-4 border-l-4 border-l-primary">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-base">Informazioni Principali</h3>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Azienda *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Inserisci il nome dell'azienda" 
                          className="text-base"
                          autoComplete="organization"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="partita_iva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Partita IVA *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="11 cifre numeriche"
                          inputMode="numeric"
                          pattern="[0-9]{11}"
                          maxLength={11}
                          className="text-base"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Deve essere di 11 cifre numeriche
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="indirizzo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Indirizzo completo" 
                          className="text-base"
                          autoComplete="street-address"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="citta"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Città</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Città" 
                          className="text-base"
                          autoComplete="address-level2"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </div>
        );

      case 2: // Fatturazione
        return (
          <div className="space-y-6">
            <Card className="p-4 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-base">Fatturazione Elettronica</h3>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="sdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice SDI</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Codice SDI per fatturazione elettronica" 
                          className="text-base"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Codice Sistema di Interscambio per fatturazione elettronica
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pec"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PEC</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="Posta Elettronica Certificata" 
                          className="text-base"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Indirizzo di Posta Elettronica Certificata
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </div>
        );

      case 3: // Contatti
        return (
          <div className="space-y-6">
            <Card className="p-4 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold text-base">Contatti Principali</h3>
              </div>
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Principale</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          placeholder="Email aziendale" 
                          className="text-base"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono Principale</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          placeholder="Numero di telefono" 
                          className="text-base"
                          {...field} 
                          value={field.value || ''} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Additional Emails */}
            <FormField
              control={form.control}
              name="emails"
              render={({ field }) => (
                <FormItem>
                  <MobileArrayField
                    label="Email Aggiuntive"
                    icon={Mail}
                    items={field.value || []}
                    maxItems={5}
                    placeholder="Email aggiuntiva"
                    type="email"
                    onChange={field.onChange}
                  />
                </FormItem>
              )}
            />

            {/* Additional Phones */}
            <FormField
              control={form.control}
              name="telefoni"
              render={({ field }) => (
                <FormItem>
                  <MobileArrayField
                    label="Telefoni Aggiuntivi"
                    icon={Phone}
                    items={field.value || []}
                    maxItems={5}
                    placeholder="Telefono aggiuntivo"
                    type="tel"
                    onChange={field.onChange}
                  />
                </FormItem>
              )}
            />
          </div>
        );

      case 4: // Settings
        return (
          <div className="space-y-6">
            <Card className="p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold text-base">Configurazioni</h3>
              </div>
              
              <div className="space-y-6">
                {/* Firma Digitale */}
                <FormField
                  control={form.control}
                  name="firma_digitale_attiva"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div className="space-y-0.5 flex-1">
                        <FormLabel className="text-base font-medium">Firma Digitale</FormLabel>
                        <FormDescription className="text-xs">
                          Abilita la firma digitale per i servizi
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Provvigione */}
                <FormField
                  control={form.control}
                  name="provvigione"
                  render={({ field }) => (
                    <FormItem className="rounded-lg border p-4 bg-muted/50">
                      <div className="flex flex-row items-center justify-between mb-4">
                        <div className="space-y-0.5 flex-1">
                          <FormLabel className="text-base font-medium">Provvigione</FormLabel>
                          <FormDescription className="text-xs">
                            Abilita la gestione delle provvigioni
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </div>

                      {/* Conditional Provvigione Fields */}
                      {provvigioneAttiva && (
                        <div className="space-y-4 pt-4 border-t">
                          {/* Provvigione Tipo - Segmented Control */}
                          <FormField
                            control={form.control}
                            name="provvigione_tipo"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">Tipo Provvigione</FormLabel>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                  <Button
                                    type="button"
                                    variant={field.value === 'fisso' ? 'default' : 'outline'}
                                    className="min-h-[44px]"
                                    onClick={() => field.onChange('fisso')}
                                  >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Fisso
                                  </Button>
                                  <Button
                                    type="button"
                                    variant={field.value === 'percentuale' ? 'default' : 'outline'}
                                    className="min-h-[44px]"
                                    onClick={() => field.onChange('percentuale')}
                                  >
                                    Percentuale
                                  </Button>
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Provvigione Valore */}
                          <FormField
                            control={form.control}
                            name="provvigione_valore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm">
                                  Valore {provvigioneTipo === 'percentuale' ? '(%)' : '(€)'}
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.01"
                                    min="0"
                                    placeholder="Inserisci il valore"
                                    className="text-base"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormDescription className="text-xs">
                                  {provvigioneTipo === 'percentuale'
                                    ? 'Inserisci la percentuale (es. 10 per 10%)'
                                    : 'Inserisci il valore fisso in euro'}
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Form {...form}>
        <div className="min-h-screen bg-background pb-32 lg:pb-0">
          {/* Mobile Header */}
          <MobileFormHeader
            currentStep={currentStep}
            totalSteps={totalSteps}
            title={isEditing ? 'Modifica Azienda' : 'Nuova Azienda'}
            subtitle={STEPS[currentStep - 1]?.title}
            progress={progress}
            completedSteps={completedSteps}
            onBack={handleBack}
            onSaveDraft={!isEditing ? handleSaveDraft : undefined}
            onStepClick={goToStep}
          />

          {/* Step Content */}
          <div className="p-4 lg:p-6">
            {renderStep()}
          </div>

          {/* Mobile Footer */}
          <MobileFormFooter
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isSubmitting={isSubmitting}
            onPrevious={goToPreviousStep}
            onNext={handleNext}
            onSubmit={form.handleSubmit(handleFormSubmit)}
          />
        </div>
      </Form>

      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center lg:hidden">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div>
              <p className="font-medium">Salvataggio in corso...</p>
              <p className="text-sm text-muted-foreground">Non chiudere l'app</p>
            </div>
          </div>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="max-w-[90vw] lg:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Modifiche non salvate</AlertDialogTitle>
            <AlertDialogDescription>
              Hai modifiche non salvate. Vuoi uscire senza salvare?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="min-h-[44px]">Resta qui</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                clearDraft();
                onCancel();
              }}
              className="min-h-[44px]"
            >
              Esci senza salvare
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Draft Recovery Dialog */}
      <AlertDialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <AlertDialogContent className="max-w-[90vw] lg:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Bozza trovata</AlertDialogTitle>
            <AlertDialogDescription>
              È stata trovata una bozza salvata. Vuoi riprendere da dove avevi lasciato?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel onClick={handleDiscardDraft} className="min-h-[44px]">
              Inizia da capo
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLoadDraft} className="min-h-[44px]">
              Carica bozza
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
