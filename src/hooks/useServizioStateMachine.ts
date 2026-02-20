import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateServizioStato, 
  getMissingFields, 
  formatStatoLabel 
} from '@/utils/servizioValidation';
import { 
  createServizio as apiCreateServizio, 
  updateServizio as apiUpdateServizio 
} from '@/lib/api/servizi';
import { sendNotification } from '@/hooks/useSendNotification';
import type { CreateServizioRequest, UpdateServizioRequest } from '@/lib/api/servizi/types';
import type { Servizio, StatoServizio } from '@/lib/types/servizi';

/**
 * Custom hook per gestire le mutations di servizi con transizione automatica degli stati.
 * 
 * Questo hook estende la logica base di creazione/aggiornamento servizi con
 * un sistema di state machine che calcola automaticamente lo stato del servizio
 * in base alla completezza dei campi obbligatori e all'assegnazione del conducente.
 * 
 * @returns Oggetto con funzioni di mutation e stati di loading
 */
export function useServizioStateMachine() {
  const queryClient = useQueryClient();

  /**
   * Mutation per la creazione di un nuovo servizio con calcolo automatico dello stato.
   * 
   * Flow:
   * 1. Calcola stato automatico con calculateServizioStato()
   * 2. Chiama API di creazione con stato calcolato
   * 3. Mostra toast personalizzato in base allo stato finale
   * 4. Invalida cache TanStack Query
   */
  const createMutation = useMutation({
    mutationFn: async (data: CreateServizioRequest) => {
      console.log('[useServizioStateMachine] Creating servizio with data:', data);
      
      // Calcola stato automatico prima di inviare
      const statoCalcolato = calculateServizioStato({
        ...data.servizio,
        stato: data.servizio.stato || 'bozza'
      });
      
      console.log('[useServizioStateMachine] Calculated stato:', statoCalcolato);
      
      return apiCreateServizio({
        ...data,
        servizio: {
          ...data.servizio,
          stato: statoCalcolato
        }
      });
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      
      const { servizio } = result;
      if (!servizio) return;
      
      // Toast personalizzato in base allo stato finale
      if (servizio.stato === 'bozza') {
        const missing = getMissingFields(servizio);
        if (missing.length > 0) {
          toast.warning(`Bozza servizio salvata! Compila: ${missing.join(', ')}`);
        } else {
          toast.success('Bozza servizio salvata');
        }
      } else if (servizio.stato === 'da_assegnare') {
        toast.success('Servizio creato! Pronto per l\'assegnazione.');
      } else if (servizio.stato === 'assegnato') {
        toast.success('Servizio creato e assegnato!');
      } else {
        toast.success(`Servizio creato con stato: ${formatStatoLabel(servizio.stato)}`);
      }
    },
    onError: (error: any) => {
      console.error('[useServizioStateMachine] Error creating servizio:', error);
      toast.error(`Errore creazione servizio: ${error.message}`);
    }
  });

  /**
   * Mutation per l'aggiornamento di un servizio esistente con transizione di stato.
   * 
   * Flow:
   * 1. Fetch servizio corrente dal database
   * 2. Merge dati correnti + nuovi dati
   * 3. Calcola nuovo stato SOLO se corrente è 'bozza'
   * 4. Aggiorna servizio con stato calcolato
   * 5. Mostra toast in base alla transizione di stato
   * 6. Invalida cache TanStack Query
   */
  const updateMutation = useMutation({
    mutationFn: async (data: UpdateServizioRequest) => {
      console.log('[useServizioStateMachine] Updating servizio:', data.servizio.id);
      
      // Fetch servizio corrente per confrontare lo stato
      const { data: currentServizio, error: fetchError } = await supabase
        .from('servizi')
        .select('*')
        .eq('id', data.servizio.id)
        .single();
      
      if (fetchError || !currentServizio) {
        throw new Error('Servizio non trovato');
      }
      
      // Merge dati
      const mergedServizio = {
        ...currentServizio,
        ...data.servizio
      };
      
      // Calcola nuovo stato SOLO se corrente è 'bozza'
      const oldStato = currentServizio.stato as StatoServizio;
      const newStato = (oldStato === 'bozza' || oldStato === 'richiesta_cliente')
        ? calculateServizioStato(mergedServizio as any)
        : oldStato;
      
      const statoChanged = oldStato !== newStato;
      
      console.log('[useServizioStateMachine] State transition:', { oldStato, newStato, statoChanged });
      
      // Update con stato calcolato
      const result = await apiUpdateServizio({
        ...data,
        servizio: {
          ...data.servizio,
          stato: newStato
        }
      });
      
      return {
        result,
        statoChanged,
        oldStato,
        newStato
      };
    },
    onSuccess: ({ result, statoChanged, oldStato, newStato }) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      
      // Toast personalizzato in base alla transizione
      if (statoChanged) {
        if (newStato === 'da_assegnare') {
          toast.success('Servizio completato! Pronto per l\'assegnazione.');
        } else if (newStato === 'assegnato') {
          toast.success('Servizio assegnato automaticamente!');
        } else {
          toast.success(`Stato aggiornato: ${formatStatoLabel(oldStato)} → ${formatStatoLabel(newStato)}`);
        }
      } else {
        toast.success('Servizio aggiornato con successo');
      }
    },
    onError: (error: any) => {
      console.error('[useServizioStateMachine] Error updating servizio:', error);
      toast.error(`Errore aggiornamento servizio: ${error.message}`);
    }
  });

  /**
   * Mutation per assegnare un servizio a un conducente.
   * 
   * Questa mutation cambia sempre lo stato a 'assegnato' indipendentemente dallo stato precedente.
   */
  const assignMutation = useMutation({
    mutationFn: async ({ 
      id, 
      assegnato_a, 
      veicolo_id, 
      conducente_esterno, 
      conducente_esterno_id 
    }: { 
      id: string; 
      assegnato_a?: string; 
      veicolo_id?: string;
      conducente_esterno?: boolean;
      conducente_esterno_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('servizi')
        .update({
          assegnato_a,
          veicolo_id,
          conducente_esterno,
          conducente_esterno_id,
          stato: 'assegnato'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Servizio assegnato!');
      
      // Invia notifica email ai destinatari configurati
      if (data?.id) {
        sendNotification(data.id, 'assegnato');
      }
    },
    onError: (error: any) => {
      console.error('[useServizioStateMachine] Error assigning servizio:', error);
      toast.error(`Errore assegnazione servizio: ${error.message}`);
    }
  });

  /**
   * Mutation per rimuovere l'assegnazione di un servizio (torna a da_assegnare).
   */
  const unassignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('servizi')
        .update({
          assegnato_a: null,
          veicolo_id: null,
          conducente_esterno: false,
          conducente_esterno_id: null,
          conducente_esterno_nome: null,
          conducente_esterno_email: null,
          stato: 'da_assegnare'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Assegnazione rimossa');
    },
    onError: (error: any) => {
      console.error('[useServizioStateMachine] Error unassigning servizio:', error);
      toast.error(`Errore rimozione assegnazione: ${error.message}`);
    }
  });

  /**
   * Mutation per eliminare un servizio.
   */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('servizi')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Servizio eliminato');
    },
    onError: (error: any) => {
      console.error('[useServizioStateMachine] Error deleting servizio:', error);
      toast.error(`Errore eliminazione servizio: ${error.message}`);
    }
  });

  return {
    // Mutations
    createServizio: createMutation.mutate,
    updateServizio: updateMutation.mutate,
    assignServizio: assignMutation.mutate,
    unassignServizio: unassignMutation.mutate,
    deleteServizio: deleteMutation.mutate,
    
    // Loading states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isAssigning: assignMutation.isPending,
    isUnassigning: unassignMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Raw mutation objects (per uso avanzato)
    createMutation,
    updateMutation,
    assignMutation,
    unassignMutation,
    deleteMutation
  };
}
