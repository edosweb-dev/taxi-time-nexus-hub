
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AlertTriangle, Calculator, User } from 'lucide-react';
import { useStipendioDetail, useUpdateStipendio } from '@/hooks/useStipendi';
import { useCalcoloStipendio } from '@/hooks/useCalcoloStipendio';
import { formatCurrency } from '@/lib/utils';
import { getInitials, getRuoloBadge } from './TabellaStipendi/utils';

const formSchema = z.object({
  km: z.number().min(0, 'I KM devono essere un numero positivo').optional(),
  ore_attesa: z.number().min(0, 'Le ore di attesa devono essere un numero positivo').optional(),
  ore_lavorate: z.number().min(0, 'Le ore lavorate devono essere un numero positivo').optional(),
  tariffa_oraria: z.number().min(0, 'La tariffa oraria deve essere un numero positivo').optional(),
  note: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ModificaStipendioSheetProps {
  stipendioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStipendioUpdated?: () => void;
}

export function ModificaStipendioSheet({
  stipendioId,
  open,
  onOpenChange,
  onStipendioUpdated
}: ModificaStipendioSheetProps) {
  const { data: stipendio, isLoading, isError } = useStipendioDetail(stipendioId);
  const updateStipendio = useUpdateStipendio();
  const [formValues, setFormValues] = useState<FormData>({});

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formValues,
  });

  const watchedValues = form.watch();

  // Setup calcolo real-time per soci
  const calcoloParams = stipendio?.tipo_calcolo === 'socio' && watchedValues.km ? {
    userId: stipendio.user_id,
    mese: stipendio.mese,
    anno: stipendio.anno,
    km: watchedValues.km || 0,
    oreAttesa: watchedValues.ore_attesa || 0,
  } : null;

  const { calcolo, isCalculating } = useCalcoloStipendio(calcoloParams, {
    enableRealTime: true,
    debounceMs: 500,
  });

  // Pre-popola il form quando i dati sono caricati
  useEffect(() => {
    if (stipendio && !isLoading) {
      const defaultValues: FormData = {
        note: stipendio.note || '',
      };

      if (stipendio.tipo_calcolo === 'socio') {
        defaultValues.km = Number(stipendio.totale_km) || 0;
        defaultValues.ore_attesa = Number(stipendio.totale_ore_attesa) || 0;
      } else {
        defaultValues.ore_lavorate = Number(stipendio.totale_ore_lavorate) || 0;
        // Calcola tariffa oraria dai dati esistenti
        if (stipendio.totale_ore_lavorate && stipendio.totale_lordo) {
          defaultValues.tariffa_oraria = Number(stipendio.totale_lordo) / Number(stipendio.totale_ore_lavorate);
        }
      }

      setFormValues(defaultValues);
      form.reset(defaultValues);
    }
  }, [stipendio, isLoading, form]);

  const onSubmit = async (data: FormData) => {
    if (!stipendio) return;

    try {
      await updateStipendio.mutateAsync({
        stipendioId: stipendio.id,
        formData: {
          km: data.km,
          ore_attesa: data.ore_attesa,
          ore_lavorate: data.ore_lavorate,
          tariffa_oraria: data.tariffa_oraria,
          note: data.note,
        },
        calcolo: stipendio.tipo_calcolo === 'socio' ? calcolo : null,
      });

      onStipendioUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating stipendio:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </SheetHeader>
          <div className="space-y-6 py-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Error state
  if (isError || !stipendio) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[600px] sm:max-w-[600px]">
          <SheetHeader>
            <SheetTitle>Errore</SheetTitle>
            <SheetDescription>
              Impossibile caricare i dati dello stipendio.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  // Check if can be modified
  const canModify = stipendio.stato === 'bozza';

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Modifica Stipendio</SheetTitle>
          <SheetDescription>
            Modifica i parametri di calcolo dello stipendio
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Header con info utente */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-lg">
                    {getInitials(stipendio.user?.first_name, stipendio.user?.last_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold text-lg">
                    {stipendio.user?.first_name} {stipendio.user?.last_name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRuoloBadge(stipendio.tipo_calcolo)}
                    <Badge variant={stipendio.stato === 'bozza' ? 'secondary' : 'default'}>
                      {stipendio.stato}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {months[stipendio.mese - 1]} {stipendio.anno}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Alert se non modificabile */}
          {!canModify && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Questo stipendio non può essere modificato perché è già stato {stipendio.stato === 'confermato' ? 'confermato' : 'pagato'}.
                Solo gli stipendi in stato "bozza" possono essere modificati.
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Campi input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Parametri Calcolo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stipendio.tipo_calcolo === 'socio' ? (
                    <>
                      <FormField
                        control={form.control}
                        name="km"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chilometri percorsi</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder="Inserisci i km"
                                disabled={!canModify}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ore_attesa"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ore di attesa</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Inserisci le ore di attesa"
                                disabled={!canModify}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <FormField
                        control={form.control}
                        name="ore_lavorate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ore lavorate</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="Inserisci le ore lavorate"
                                disabled={!canModify}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tariffa_oraria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tariffa oraria (€)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="Inserisci la tariffa oraria"
                                disabled={!canModify}
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Note</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Note aggiuntive..."
                            disabled={!canModify}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Preview calcolo per soci */}
              {stipendio.tipo_calcolo === 'socio' && watchedValues.km && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Anteprima Calcolo
                      {isCalculating && <span className="text-xs text-muted-foreground">(Calcolando...)</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {calcolo ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Base chilometrica:</span>
                          <span>{formatCurrency(calcolo.baseKm)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>+ Aumento:</span>
                          <span>{formatCurrency(calcolo.dettaglioCalcolo.parametriUsati.coefficienteAumento * calcolo.baseKm)}</span>
                        </div>
                        {watchedValues.ore_attesa && watchedValues.ore_attesa > 0 && (
                          <div className="flex justify-between">
                            <span>+ Ore attesa:</span>
                            <span>{formatCurrency(calcolo.importoOreAttesa)}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between font-semibold">
                          <span>Totale Lordo:</span>
                          <span>{formatCurrency(calcolo.totaleLordo)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg text-primary">
                          <span>Totale Netto:</span>
                          <span>{formatCurrency(calcolo.totaleNetto)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Inserisci i KM per vedere l'anteprima del calcolo
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Preview semplice per dipendenti */}
              {stipendio.tipo_calcolo === 'dipendente' && watchedValues.ore_lavorate && watchedValues.tariffa_oraria && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Anteprima Calcolo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Ore lavorate:</span>
                        <span>{watchedValues.ore_lavorate}h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>× Tariffa oraria:</span>
                        <span>{formatCurrency(watchedValues.tariffa_oraria)}/h</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-lg text-primary">
                        <span>Totale:</span>
                        <span>{formatCurrency(watchedValues.ore_lavorate * watchedValues.tariffa_oraria)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                
                {canModify && (
                  <Button
                    type="submit"
                    disabled={updateStipendio.isPending}
                    className="flex-1"
                  >
                    {updateStipendio.isPending ? 'Salvando...' : 'Salva Modifiche'}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
