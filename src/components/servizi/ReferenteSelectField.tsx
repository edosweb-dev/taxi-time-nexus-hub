
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
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
    
    // Skip during loading to avoid race condition
    if (isLoading) {
      console.log('[ReferenteSelectField] Skipping - query is loading');
      return;
    }
    
    // Skip on first render if we have an initial value (edit mode)
    if (isFirstRenderRef.current && currentReferenteId) {
      console.log('[ReferenteSelectField] First render with initial value - skipping reset');
      isFirstRenderRef.current = false;
      previousAziendaIdRef.current = aziendaId;
      return;
    }
    
    // Mark first render as complete
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousAziendaIdRef.current = aziendaId;
      return;
    }
    
    // Only reset if azienda actually changed
    const aziendaChanged = previousAziendaIdRef.current !== null && previousAziendaIdRef.current !== aziendaId;
    
    if (aziendaChanged) {
      console.log('[ReferenteSelectField] Azienda changed - checking if referente is valid');
      
      if (currentReferenteId && referenti.length > 0) {
        const referenteExists = referenti.some(r => r.id === currentReferenteId);
        console.log('[ReferenteSelectField] Referente exists in new azienda:', referenteExists);
        
        if (!referenteExists) {
          console.log('[ReferenteSelectField] Resetting referente_id - not found in new azienda');
          form.setValue('referente_id', '');
          onValueChange?.('');
        }
      }
    }
    
    // Update previous azienda reference
    previousAziendaIdRef.current = aziendaId;
  }, [aziendaId, referenti, currentReferenteId, form, onValueChange, isLoading]);

  return (
    <FormField
      control={form.control}
      name="referente_id"
      render={({ field }) => {
        // Determine the current value for the Select component
        const selectValue = field.value && field.value !== '' ? field.value : 'all';
        console.log('[ReferenteSelectField] Rendering - field.value:', field.value, 'selectValue:', selectValue);
        
        return (
          <FormItem className="h-full flex flex-col">
            <FormLabel>
              Referente (opzionale)
            </FormLabel>
            <Select 
              onValueChange={(value) => {
                const newValue = value === 'all' ? '' : value;
                console.log('[ReferenteSelectField] Value changing from', field.value, 'to', newValue);
                field.onChange(newValue);
                onValueChange?.(newValue);
              }} 
              value={selectValue}
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
              <SelectItem value="all">
                <div className="flex flex-col items-start">
                  <span>Tutti i referenti</span>
                  <span className="text-xs text-muted-foreground">Passeggeri collegati all'azienda</span>
                </div>
              </SelectItem>
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
