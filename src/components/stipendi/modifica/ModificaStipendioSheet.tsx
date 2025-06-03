
import { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';
import { useStipendioDetail, useUpdateStipendio } from '@/hooks/useStipendi';
import { useCalcoloStipendio } from '@/hooks/useCalcoloStipendio';
import { ModificaStipendioHeader } from './ModificaStipendioHeader';
import { ModificaStipendioForm, FormData } from './ModificaStipendioForm';
import { CalcoloPreview } from './CalcoloPreview';

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
  const [watchedValues, setWatchedValues] = useState<FormData>({});

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
      setWatchedValues(defaultValues);
    }
  }, [stipendio, isLoading]);

  const handleFormChange = useCallback((values: FormData) => {
    setWatchedValues(values);
  }, []);

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

  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

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
          <ModificaStipendioHeader stipendio={stipendio} months={months} />

          {!canModify && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Questo stipendio non può essere modificato perché è già stato {stipendio.stato === 'confermato' ? 'confermato' : 'pagato'}.
                Solo gli stipendi in stato "bozza" possono essere modificati.
              </AlertDescription>
            </Alert>
          )}

          <ModificaStipendioForm
            stipendio={stipendio}
            canModify={canModify}
            defaultValues={formValues}
            onSubmit={onSubmit}
            isPending={updateStipendio.isPending}
            onCancel={() => onOpenChange(false)}
            onFormChange={handleFormChange}
          />

          <CalcoloPreview
            tipoCalcolo={stipendio.tipo_calcolo}
            watchedValues={watchedValues}
            calcolo={calcolo}
            isCalculating={isCalculating}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
