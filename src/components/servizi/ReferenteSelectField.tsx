
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useMemo } from 'react';
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

interface ReferenteSelectFieldProps {
  aziendaId: string;
  onValueChange?: (value: string) => void;
}

export function ReferenteSelectField({ aziendaId, onValueChange }: ReferenteSelectFieldProps) {
  const form = useFormContext();
  const currentReferenteId = form.watch('referente_id');
  const previousAziendaIdRef = useRef<string | null>(null);
  const isFirstRenderRef = useRef(true);
  const previousReferenteIdRef = useRef<string | null>(null);
  
  console.log('[ReferenteSelectField] 🟡 Component render:', {
    currentReferenteId,
    currentReferenteId_type: typeof currentReferenteId,
    aziendaId,
    aziendaId_type: typeof aziendaId,
    isFirstRender: isFirstRenderRef.current
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
    <FormField
      control={form.control}
      name="referente_id"
      render={({ field }) => {
        const selectValue = currentReferenteId || '';
        
        console.log('[ReferenteSelectField] Rendering with:', {
          field_value: field.value,
          field_value_type: typeof field.value,
          selectValue: selectValue,
          currentReferenteId: currentReferenteId,
          aziendaId: aziendaId,
          referentiCount: referenti?.length || 0,
          isLoading: isLoading,
          isFirstRender: isFirstRenderRef.current
        });
        
        return (
          <FormItem className="h-full flex flex-col">
            <FormLabel>
              Referente (opzionale)
            </FormLabel>
            <Select 
              onValueChange={(value) => {
                console.log('[ReferenteSelectField] 🔄 Setting referente_id:', value);
                
                field.onChange(value);
                onValueChange?.(value);
                
                // Log dello stato form dopo setValue
                setTimeout(() => {
                  const formValue = form.getValues('referente_id');
                  console.log('[ReferenteSelectField] 📝 Form state after setValue:', formValue);
                }, 0);
              }}
              value={selectValue}
              disabled={isLoading}
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
  );
}
