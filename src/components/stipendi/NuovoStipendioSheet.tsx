
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useCalcoloStipendio } from '@/hooks/useCalcoloStipendio';
import { useConfigurazioneStipendi, useCreateStipendio } from '@/hooks/useStipendi';
import { toast } from '@/components/ui/sonner';
import {
  UserSelectionSection,
  CalcoloDataSection,
  CalcoloPreviewSection,
  NotesSection,
  stipendioSchema,
  type StipendioFormData
} from './nuovo';

interface NuovoStipendioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMonth: number;
  selectedYear: number;
  onStipendioCreated: () => void;
}

export function NuovoStipendioSheet({
  open,
  onOpenChange,
  selectedMonth,
  selectedYear,
  onStipendioCreated,
}: NuovoStipendioSheetProps) {
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
  
  const { data: configurazione } = useConfigurazioneStipendi(selectedYear);
  const createStipendioMutation = useCreateStipendio();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const form = useForm<StipendioFormData>({
    resolver: zodResolver(stipendioSchema),
    defaultValues: {
      user_id: '',
      km: 12,
      ore_attesa: 0,
      ore_lavorate: 0,
      tariffa_oraria: configurazione?.tariffa_oraria_attesa || 15,
      note: '',
    },
  });

  const watchedValues = form.watch();

  // Update tariffa_oraria default when configurazione loads
  useEffect(() => {
    if (configurazione?.tariffa_oraria_attesa) {
      form.setValue('tariffa_oraria', Number(configurazione.tariffa_oraria_attesa));
    }
  }, [configurazione, form]);

  // Find selected user details
  useEffect(() => {
    if (watchedValues.user_id) {
      const user = users.find(u => u.id === watchedValues.user_id);
      setSelectedUser(user);
    } else {
      setSelectedUser(null);
    }
  }, [watchedValues.user_id, users]);

  // Calculate salary in real-time for soci
  const calcoloParams = selectedUser?.role === 'socio' && watchedValues.km && watchedValues.km >= 12 ? {
    userId: watchedValues.user_id,
    mese: selectedMonth,
    anno: selectedYear,
    km: watchedValues.km,
    oreAttesa: watchedValues.ore_attesa || 0,
  } : null;

  const { calcolo, isCalculating } = useCalcoloStipendio(calcoloParams, {
    enableRealTime: true,
    debounceMs: 500,
  });

  const handleSubmit = async (data: StipendioFormData) => {
    try {
      console.log('[NuovoStipendioSheet] Submitting stipendio:', data);
      
      if (!data.user_id) {
        throw new Error('User ID is required');
      }

      await createStipendioMutation.mutateAsync({
        formData: {
          user_id: data.user_id,
          km: data.km,
          ore_attesa: data.ore_attesa,
          ore_lavorate: data.ore_lavorate,
          tariffa_oraria: data.tariffa_oraria,
          note: data.note,
        },
        mese: selectedMonth,
        anno: selectedYear,
        calcolo: selectedUser?.role === 'socio' ? calcolo : null,
      });

      onOpenChange(false);
      onStipendioCreated();
      form.reset();
      setSelectedUser(null);
    } catch (error) {
      console.error('[NuovoStipendioSheet] Error submitting stipendio:', error);
    }
  };

  const isFormValid = form.formState.isValid && selectedUser && 
    (selectedUser.role === 'dipendente' || selectedUser.role === 'admin' || 
     (selectedUser.role === 'socio' && watchedValues.km && watchedValues.km >= 12));

  const isLoading = createStipendioMutation.isPending || isCalculating;
  
  // Handlers for ServiziUtilityButtons
  const handleKmCalculated = (km: number) => {
    if (km > 0) {
      form.setValue('km', km);
    }
  };
  
  const handleOreCalculated = (ore: number) => {
    if (ore > 0) {
      if (selectedUser?.role === 'socio') {
        form.setValue('ore_attesa', ore);
      } else {
        form.setValue('ore_lavorate', ore);
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuovo Stipendio</SheetTitle>
          <SheetDescription>
            Calcola e crea un nuovo stipendio per {selectedMonth}/{selectedYear}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <UserSelectionSection
              form={form}
              selectedUser={selectedUser}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isLoading={isLoading}
              configurazione={configurazione}
              onKmCalculated={handleKmCalculated}
              onOreCalculated={handleOreCalculated}
            />

            <CalcoloDataSection
              form={form}
              selectedUser={selectedUser}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isLoading={isLoading}
              configurazione={configurazione}
            />

            <CalcoloPreviewSection
              form={form}
              selectedUser={selectedUser}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isLoading={isLoading}
              configurazione={configurazione}
              watchedValues={watchedValues}
              calcolo={calcolo}
              isCalculating={isCalculating}
            />

            <NotesSection
              form={form}
              selectedUser={selectedUser}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              isLoading={isLoading}
              configurazione={configurazione}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="flex-1"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salva come bozza
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
