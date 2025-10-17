
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStipendi, getStipendioById, getTariffeKm, getConfigurazioneStipendi } from '@/lib/api/stipendi';
import { createStipendio, CreateStipendioParams } from '@/lib/api/stipendi/createStipendio';
import { updateStipendio, UpdateStipendioParams } from '@/lib/api/stipendi/updateStipendio';
import { updateStatoStipendio, UpdateStatoStipendioParams } from '@/lib/api/stipendi/updateStatoStipendio';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Stipendio, TariffaKm, ConfigurazioneStipendi, StatoStipendio } from '@/lib/api/stipendi';

export function useStipendi(filters?: {
  anno?: number;
  mese?: number;
  user_id?: string;
  tipo_calcolo?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: stipendi = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['stipendi', filters],
    queryFn: () => getStipendi(filters),
  });

  return {
    stipendi,
    isLoading,
    isError,
    error,
    refetch,
  };
}

export function useStipendioDetail(id: string) {
  return useQuery({
    queryKey: ['stipendio', id],
    queryFn: () => getStipendioById(id),
    enabled: !!id
  });
}

export function useTariffeKm(anno?: number) {
  return useQuery({
    queryKey: ['tariffe-km', anno],
    queryFn: () => getTariffeKm(anno),
  });
}

export function useConfigurazioneStipendi(anno: number) {
  return useQuery({
    queryKey: ['configurazione-stipendi', anno],
    queryFn: () => getConfigurazioneStipendi(anno),
    enabled: !!anno
  });
}

// Mutation for creating stipendio
export function useCreateStipendio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStipendio,
    onSuccess: (newStipendio) => {
      // Invalida le query degli stipendi per ricaricare la lista
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      
      // Mostra toast di successo
      toast.success('Stipendio salvato come bozza');
      
      console.log('[useCreateStipendio] Stipendio created successfully:', newStipendio.id);
    },
    onError: (error: Error) => {
      console.error('[useCreateStipendio] Error creating stipendio:', error);
      
      // Gestisci errori specifici
      if (error.message === 'DUPLICATE_STIPENDIO') {
        toast.error('Stipendio già presente per questo mese');
      } else if (error.message === 'PERMISSION_DENIED') {
        toast.error('Non hai i permessi per questa operazione');
      } else {
        toast.error('Errore durante il salvataggio dello stipendio');
      }
    },
  });
}

// Mutation for updating stipendio
export function useUpdateStipendio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStipendio,
    onSuccess: (updatedStipendio) => {
      // Invalida le query degli stipendi per ricaricare la lista
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      
      // Invalida anche il dettaglio specifico
      queryClient.invalidateQueries({ queryKey: ['stipendio', updatedStipendio.id] });
      
      // Mostra toast di successo
      toast.success('Stipendio modificato con successo');
      
      console.log('[useUpdateStipendio] Stipendio updated successfully:', updatedStipendio.id);
    },
    onError: (error: Error) => {
      console.error('[useUpdateStipendio] Error updating stipendio:', error);
      
      // Gestisci errori specifici
      if (error.message === 'CANNOT_MODIFY_CONFIRMED') {
        toast.error('Non è possibile modificare uno stipendio già confermato');
      } else if (error.message === 'PERMISSION_DENIED') {
        toast.error('Non hai i permessi per questa operazione');
      } else {
        toast.error('Errore durante la modifica dello stipendio');
      }
    },
  });
}

// Mutation for updating stipendio stato
export function useUpdateStatoStipendio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStatoStipendio,
    onSuccess: (result, variables) => {
      // Invalida le query degli stipendi per ricaricare la lista
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      
      // Invalida anche il dettaglio specifico
      queryClient.invalidateQueries({ queryKey: ['stipendio', variables.stipendioId] });
      
      // Se è stato creato un movimento aziendale, invalida anche quelle query
      if (result.spesaAziendaleCreata) {
        queryClient.invalidateQueries({ queryKey: ['spese-aziendali'] });
        queryClient.invalidateQueries({ queryKey: ['pending-count'] });
        queryClient.invalidateQueries({ queryKey: ['totali-mese'] });
      }
      
      // Mostra toast di successo specifico per il nuovo stato
      const messaggi = {
        'confermato': 'Stipendio confermato con successo',
        'pagato': result.spesaAziendaleCreata 
          ? 'Stipendio segnato come pagato e spesa aziendale creata'
          : 'Stipendio segnato come pagato'
      };
      
      toast.success(messaggi[variables.nuovoStato as keyof typeof messaggi] || 'Stato aggiornato con successo');
      
      console.log('[useUpdateStatoStipendio] Stato updated successfully:', variables.nuovoStato);
    },
    onError: (error: Error) => {
      console.error('[useUpdateStatoStipendio] Error updating stato:', error);
      
      // Mostra toast di errore
      toast.error(error.message || 'Errore durante il cambio di stato');
    },
  });
}

// Hook per confermare stipendio
export function useConfermaStipendio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stipendioId: string) => {
      const { data, error } = await supabase
        .from('stipendi')
        .update({ 
          stato: 'confermato', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', stipendioId)
        .eq('stato', 'bozza')
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      toast.success('Stipendio confermato con successo!');
    },
    onError: (error: Error) => {
      toast.error('Errore durante conferma: ' + error.message);
    },
  });
}
