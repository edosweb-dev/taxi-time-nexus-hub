
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useMemo, useState } from 'react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClientForm } from '@/components/users/ClientForm';
import { ReferenteQuickForm } from './ReferenteQuickForm';
import { createReferente } from './utils/referentiUtils';
import { toast } from '@/components/ui/use-toast';
import { UserFormData } from '@/lib/api/users/types';
import { toast as sonnerToast } from 'sonner';

interface ReferenteSelectFieldProps {
  aziendaId: string;
  onValueChange?: (value: string) => void;
}

export function ReferenteSelectField({ aziendaId, onValueChange }: ReferenteSelectFieldProps) {
  const form = useFormContext();
  const queryClient = useQueryClient();
  const currentReferenteId = form.watch('referente_id');
  const previousAziendaIdRef = useRef<string | null>(aziendaId || null);
  const isFirstRenderRef = useRef(true);
  const previousReferenteIdRef = useRef<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modeReferente, setModeReferente] = useState<'rapido' | 'completo'>('rapido');
  
  console.log('[ReferenteSelectField] 🟡 Component render:', {
    currentReferenteId,
    currentReferenteId_type: typeof currentReferenteId,
    currentReferenteId_is_null: currentReferenteId === null,
    currentReferenteId_is_undefined: currentReferenteId === undefined,
    currentReferenteId_is_empty: currentReferenteId === '',
    aziendaId,
    aziendaId_type: typeof aziendaId,
    isFirstRender: isFirstRenderRef.current,
    formState: {
      isDirty: form.formState.isDirty,
      isSubmitting: form.formState.isSubmitting,
      isLoading: form.formState.isLoading
    }
  });

  const { data: referenti = [], isLoading } = useQuery({
    queryKey: ['referenti', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return [];
      
      console.log('[ReferenteSelectField] Fetching referenti for azienda:', aziendaId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('azienda_id', aziendaId)
        .eq('role', 'cliente');
      
      if (error) throw error;
      console.log('[ReferenteSelectField] Fetched referenti:', data);
      return data || [];
    },
    enabled: !!aziendaId,
  });

  // Get azienda data for preselection in form
  const { data: azienda } = useQuery({
    queryKey: ['azienda', aziendaId],
    queryFn: async () => {
      if (!aziendaId) return null;
      const { data, error } = await supabase
        .from('aziende')
        .select('*')
        .eq('id', aziendaId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!aziendaId,
  });

  const handleCreateReferente = async (userData: UserFormData) => {
    setIsSubmitting(true);

    const operation = (async () => {
      const { user, error } = await createReferente({
        ...userData,
        role: 'cliente',
        azienda_id: aziendaId,
      });

      if (error) {
        throw new Error(error.message || "Errore durante la creazione del referente");
      }

      // Invalida tutte le cache che mostrano referenti
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['referenti', aziendaId] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['all-referenti'] }),
      ]);

      return user;
    })();

    sonnerToast.promise(operation, {
      loading: 'Creazione referente e sincronizzazione in corso...',
      success: 'Referente creato e disponibile in tutte le pagine',
      error: (err: any) => err?.message || 'Errore durante la creazione del referente',
    });

    try {
      const user = await operation;

      // Seleziona automaticamente il nuovo referente nel form
      if (user?.id) {
        form.setValue('referente_id', user.id);
        onValueChange?.(user.id);
      }

      setIsDialogOpen(false);
    } catch (error) {
      // Errore già mostrato dal toast.promise sopra; non serve altro
      console.error('[ReferenteSelectField] handleCreateReferente error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcolo intelligente del valore del Select per gestire race conditions
  const selectValue = useMemo(() => {
    console.log('[ReferenteSelectField] 🔍 Computing selectValue:', {
      currentReferenteId,
      referenti_length: referenti.length,
      isLoading
    });
    
    // Se non c'è referente salvato, campo vuoto
    if (!currentReferenteId) {
      console.log('[ReferenteSelectField] ⚪ No currentReferenteId - returning empty');
      return '';
    }
    
    // ✅ FIX PRINCIPALE: Se referenti non ancora caricati, mantieni valore corrente
    // Questo previene che Select riceva value valido con options vuote
    if (referenti.length === 0 && currentReferenteId) {
      console.log('[ReferenteSelectField] ⏳ Referenti loading - keeping saved value:', currentReferenteId);
      return currentReferenteId;
    }
    
    // Se referente esiste nella lista caricata, usalo
    if (referenti.some(r => r.id === currentReferenteId)) {
      console.log('[ReferenteSelectField] ✅ Referente in list - using:', currentReferenteId);
      return currentReferenteId;
    }
    
    // ⚠️ CRITICAL: Se referente NON è nella lista MA lista è caricata
    // Significa che referente appartiene ad altra azienda o è stato cancellato
    // In questo caso, mantieni il valore per ora (non resettare)
    console.log('[ReferenteSelectField] ⚠️ Referente not in current list - keeping anyway:', currentReferenteId);
    return currentReferenteId;
  }, [currentReferenteId, referenti, isLoading]);

  // Reset referente_id when azienda changes, but only if current referente doesn't belong to new azienda
  useEffect(() => {
    console.log('[ReferenteSelectField] Effect - aziendaId:', aziendaId, 'previousAziendaId:', previousAziendaIdRef.current, 'currentReferenteId:', currentReferenteId, 'referenti:', referenti, 'isLoading:', isLoading, 'isFirstRender:', isFirstRenderRef.current);
    
    // Skip during loading to avoid race condition - NON toccare i ref!
    if (isLoading) {
      console.log('[ReferenteSelectField] Skipping - query is loading');
      return;
    }
    
    // Ora che la query è completata, controlliamo se è il first render
    if (isFirstRenderRef.current) {
      console.log('[ReferenteSelectField] First render after loading - currentReferenteId:', currentReferenteId);
      isFirstRenderRef.current = false;
      previousAziendaIdRef.current = aziendaId;
      
      // Se abbiamo un valore iniziale, non fare nulla (lascialo com'è)
      if (currentReferenteId) {
        console.log('[ReferenteSelectField] Keeping initial referente_id');
        return;
      }
      // Se non abbiamo un valore iniziale, continua normalmente
      return;
    }
    
    // Da qui in poi gestiamo i cambiamenti di azienda
    const aziendaChanged = previousAziendaIdRef.current !== null && previousAziendaIdRef.current !== aziendaId;
    
    if (aziendaChanged) {
      console.log('[ReferenteSelectField] Azienda changed - checking if referente is valid');
      
      // ✅ FIX: Non validare se query ancora in loading
      if (isLoading) {
        console.log('[ReferenteSelectField] Referenti still loading - skipping validation');
        return;
      }
      
      // ✅ NUOVO: Se non abbiamo currentReferenteId, non c'è nulla da validare
      if (!currentReferenteId) {
        console.log('[ReferenteSelectField] No currentReferenteId - nothing to validate');
        previousAziendaIdRef.current = aziendaId;
        return;
      }
      
      // ✅ NUOVO: Se referenti = [], ma query completata, significa "azienda senza referenti"
      // In questo caso, resetta il referente_id perché non è valido
      // MA aspetta almeno un render cycle dopo il cambio azienda per dare tempo al form di caricare
      if (referenti.length === 0) {
        console.log('[ReferenteSelectField] ⚠️ No referenti available for this azienda');
        // Resetta solo se non siamo in fase di "form reset" (se previousAziendaId era già impostato)
        if (previousAziendaIdRef.current !== '') {
          console.log('[ReferenteSelectField] Resetting referente_id - azienda has no referenti');
          form.setValue('referente_id', '');
          onValueChange?.('');
        } else {
          console.log('[ReferenteSelectField] Skipping reset - likely during form initialization');
        }
        previousAziendaIdRef.current = aziendaId;
        return;
      }
      
      // ✅ VALIDAZIONE FINALE: Controlla se il referente esiste nell'azienda
      const referenteExists = referenti.some(r => r.id === currentReferenteId);
      console.log('[ReferenteSelectField] Referente validation:', {
        currentReferenteId,
        referenteExists,
        availableReferenti: referenti.map(r => r.id)
      });
      
      if (!referenteExists) {
        console.log('[ReferenteSelectField] ❌ Resetting referente_id - not found in new azienda');
        form.setValue('referente_id', '');
        onValueChange?.('');
      } else {
        console.log('[ReferenteSelectField] ✅ Referente is valid for this azienda');
      }
    }
    
    // Update previous azienda reference
    previousAziendaIdRef.current = aziendaId;
  }, [aziendaId, referenti, currentReferenteId, form, onValueChange, isLoading]);

  // Salva il valore corrente per il prossimo render
  useEffect(() => {
    previousReferenteIdRef.current = currentReferenteId;
  }, [currentReferenteId]);

  console.log('[ReferenteSelectField] Render - aziendaId:', aziendaId, 'field.value:', currentReferenteId, 'referenti.length:', referenti.length);

  return (
    <>
      <FormField
        control={form.control}
        name="referente_id"
        render={({ field }) => {
          console.log('[ReferenteSelectField] 🎮 Rendering Controller:', {
            field_value: field.value,
            field_value_type: typeof field.value,
            field_name: field.name,
            selectValue: selectValue,
            selectValue_type: typeof selectValue,
            currentReferenteId: currentReferenteId,
            aziendaId: aziendaId,
            referentiCount: referenti?.length || 0,
            referenti_list: referenti.map(r => ({ 
              id: r.id, 
              name: `${r.first_name} ${r.last_name}` 
            })),
            referente_in_list: currentReferenteId ? referenti.some(r => r.id === currentReferenteId) : false,
            isLoading: isLoading,
            isFirstRender: isFirstRenderRef.current
          });
          
          return (
            <FormItem className="h-full flex flex-col">
              <div className="flex items-center justify-between">
                <FormLabel>
                  Referente (opzionale)
                </FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModeReferente('rapido');
                    setIsDialogOpen(true);
                  }}
                  className="h-8 text-xs"
                  disabled={!aziendaId}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Nuovo
                </Button>
              </div>
              <Select 
                onValueChange={(value) => {
                  console.log('[ReferenteSelectField] 🔄 onChange called with:', value, 'current:', currentReferenteId);
                  
                  // ✅ FIX CRITICO: Blocca onChange vuoti quando form ha già un valore
                  if (!value || value === '') {
                    const currentFormValue = form.getValues('referente_id');
                    
                    if (currentFormValue && currentFormValue !== '') {
                      console.log('[ReferenteSelectField] ⛔ Blocking spurious empty onChange:', {
                        reason: 'form already has valid value',
                        currentFormValue,
                        attemptedValue: value,
                        currentReferenteId
                      });
                      // NON applicare il cambio - mantieni valore esistente nel form
                      return;
                    }
                  }
                  
                  // Applica il cambio
                  console.log('[ReferenteSelectField] ✅ Applying onChange:', value);
                  field.onChange(value);
                  onValueChange?.(value);
                  
                  setTimeout(() => {
                    console.log('[ReferenteSelectField] 📝 Form state:', form.getValues('referente_id'));
                  }, 0);
                }}
                value={selectValue}
                disabled={isLoading || referenti.length === 0}
              >
              <FormControl className="flex-1">
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={
                    isLoading 
                      ? "Caricamento..." 
                      : referenti.length === 0 
                        ? "Nessun referente disponibile"
                        : "Seleziona un referente (opzionale)"
                  } />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background border shadow-lg z-50">
                {referenti.map((referente) => (
                  <SelectItem key={referente.id} value={referente.id}>
                    {referente.first_name} {referente.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
          );
        }}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={modeReferente === 'completo' ? 'sm:max-w-2xl max-h-[80vh]' : 'sm:max-w-md'}
          onEscapeKeyDown={(e) => { if (isSubmitting) e.preventDefault(); }}
          onPointerDownOutside={(e) => { if (isSubmitting) e.preventDefault(); }}
        >
          <DialogHeader>
            <DialogTitle>Nuovo Referente</DialogTitle>
            <DialogDescription>
              Aggiungi un referente per {azienda?.nome || 'questa azienda'}
            </DialogDescription>
          </DialogHeader>

          {modeReferente === 'rapido' ? (
            <ReferenteQuickForm
              aziendaId={aziendaId}
              onSubmit={handleCreateReferente}
              onCancel={() => setIsDialogOpen(false)}
              onSwitchToComplete={() => setModeReferente('completo')}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <ClientForm
                onSubmit={handleCreateReferente}
                onCancel={() => setModeReferente('rapido')}
                isSubmitting={isSubmitting}
                preselectedAzienda={azienda}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
