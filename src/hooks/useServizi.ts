import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createServizio, getServizi, getServizioById, completaServizio, consuntivaServizio, updateServizio, deleteServizio } from '@/lib/api/servizi';
import { CreateServizioRequest, UpdateServizioRequest } from '@/lib/api/servizi/types';
import { toast } from '@/components/ui/sonner';
import { StatoServizio } from '@/lib/types/servizi';
import { supabase } from '@/lib/supabase';
import { sendNotification } from '@/hooks/useSendNotification';
import { 
  calculateServizioStato, 
  getMissingFields,
  formatStatoLabel 
} from '@/utils/servizioValidation';

export function useServizi() {
  const queryClient = useQueryClient();

  const {
    data: servizi = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['servizi'],
    queryFn: getServizi,
  });

  const createServizioMutation = useMutation({
    mutationFn: async (data: CreateServizioRequest) => {
      console.log('[useServizi] Creating servizio with data:', data);
      console.log('[DEBUG useServizi] createServizio - data.servizio completo:', data.servizio);
      console.log('[DEBUG useServizi] createServizio - stato iniziale:', data.servizio.stato || 'bozza');
      
      // ✨ CALCOLA STATO AUTOMATICO
      const statoCalcolato = calculateServizioStato({
        ...data.servizio,
        stato: data.servizio.stato || 'bozza'
      } as any);
      
      console.log('[useServizi] Calculated stato:', statoCalcolato);
      console.log('[DEBUG useServizi] createServizio - Stato calcolato:', statoCalcolato);
      console.log('[DEBUG useServizi] createServizio - Servizio finale con stato:', {
        ...data.servizio,
        stato: statoCalcolato
      });
      
      // Chiama API con stato calcolato
      return createServizio({
        ...data,
        servizio: {
          ...data.servizio,
          stato: statoCalcolato
        }
      });
    },
    onSuccess: (result) => {
      if (result.error) {
        toast.error(`Errore nella creazione del servizio: ${result.error.message}`);
        throw result.error;
      }
      
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      
      const servizio = result.servizio;
      if (!servizio) {
        toast.success('Servizio creato con successo');
        return;
      }
      
      // ✨ Toast personalizzato in base allo stato finale
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
      
      return servizio;
    },
    onError: (error: any) => {
      console.error('Error creating servizio:', error);
      toast.error(`Errore nella creazione del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateStatoServizioMutation = useMutation({
    mutationFn: async ({ id, stato }: { id: string; stato: StatoServizio }) => {
      const { data, error } = await supabase
        .from('servizi')
        .update({ stato })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return { servizio: data?.[0] || null, stato };
    },
    onSuccess: ({ servizio, stato }) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Stato del servizio aggiornato con successo');
      
      // Invia notifica email per annullamento
      if (stato === 'annullato' && servizio?.id) {
        sendNotification(servizio.id, 'annullato');
      }
    },
    onError: (error: any) => {
      console.error('Error updating service status:', error);
      toast.error(`Errore nell'aggiornamento dello stato: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const completaServizioMutation = useMutation({
    mutationFn: completaServizio,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Servizio completato con successo');
      
      // Invia notifica email per completamento
      if (result?.data?.[0]?.id) {
        sendNotification(result.data[0].id, 'completato');
      }
    },
    onError: (error: any) => {
      console.error('Error completing service:', error);
      toast.error(`Errore nel completamento del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const consuntivaServizioMutation = useMutation({
    mutationFn: consuntivaServizio,
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Servizio consuntivato con successo');
    },
    onError: (error: any) => {
      console.error('Error finalizing service:', error);
      toast.error(`Errore nella consuntivazione del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const updateServizioMutation = useMutation({
    mutationFn: async (data: UpdateServizioRequest) => {
      console.log('[useServizi] Updating servizio:', data.servizio.id);
      console.log('[DEBUG useServizi] updateServizio - data.servizio ricevuto:', data.servizio);
      console.log('[DEBUG useServizi] updateServizio - ID servizio:', data.servizio.id);
      
      // ✨ FETCH SERVIZIO CORRENTE per confrontare stato
      const { data: currentServizio, error: fetchError } = await supabase
        .from('servizi')
        .select('*')
        .eq('id', data.servizio.id)
        .single();
      
      if (fetchError || !currentServizio) {
        throw new Error('Servizio non trovato');
      }
      
      console.log('[🔧 useServizi] === UPDATE SERVIZIO ===');
      console.log('[🔧 useServizi] oldServizio dal DB:', {
        id: currentServizio.id,
        stato: currentServizio.stato,
        metodo_pagamento: currentServizio.metodo_pagamento,
      });
      console.log('[🔧 useServizi] updates (data.servizio):', data.servizio);
      
      // Merge dati
      const mergedServizio = {
        ...currentServizio,
        ...data.servizio
      };
      
      console.log('[🔧 useServizi] mergedServizio:', {
        id: mergedServizio.id,
        stato: mergedServizio.stato,
        metodo_pagamento: mergedServizio.metodo_pagamento,
        assegnato_a: mergedServizio.assegnato_a,
        data_servizio: mergedServizio.data_servizio,
        indirizzo_presa: mergedServizio.indirizzo_presa,
        indirizzo_destinazione: mergedServizio.indirizzo_destinazione,
        azienda_id: mergedServizio.azienda_id,
      });
      
      // ✨ CALCOLA NUOVO STATO solo se corrente è 'bozza' o 'richiesta_cliente'
      const oldStato = currentServizio.stato as StatoServizio;
      console.log('[🔧 useServizi] oldStato:', oldStato);
      console.log('[🔧 useServizi] Condizione (bozza || richiesta_cliente):', 
        oldStato === 'bozza' || oldStato === 'richiesta_cliente'
      );
      
      const newStato = (oldStato === 'bozza' || oldStato === 'richiesta_cliente') 
        ? calculateServizioStato(mergedServizio as any)
        : oldStato;
      
      const statoChanged = oldStato !== newStato;
      
      console.log('[🔧 useServizi] newStato calcolato:', newStato);
      console.log('[🔧 useServizi] statoChanged:', statoChanged);
      
      console.log('[DEBUG useServizi] updateServizio - Servizio FINALE per API:', {
        ...data.servizio,
        stato: newStato
      });
      
      // Chiama API con stato calcolato
      const result = await updateServizio({
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
      
      // ✨ Toast personalizzato per transizione stato
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
      console.error('Error updating servizio:', error);
      toast.error(`Errore nell'aggiornamento del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  const deleteServizioMutation = useMutation({
    mutationFn: deleteServizio,
    
    // ✅ OPTIMISTIC UPDATE: Rimuovi dalla cache PRIMA della risposta server
    onMutate: async (deletedId: string) => {
      // 1. Cancella refetch in corso per evitare race condition
      await queryClient.cancelQueries({ queryKey: ['servizi'] });
      
      // 2. Snapshot dello stato precedente (per rollback in caso di errore)
      const previousServizi = queryClient.getQueryData(['servizi']);
      
      // 3. Aggiorna ottimisticamente la cache - rimuovi il servizio eliminato
      queryClient.setQueryData(['servizi'], (old: any) => {
        if (!old) return old;
        return old.filter((s: any) => s.id !== deletedId);
      });
      
      // 4. Invalida anche altre query che potrebbero contenere servizi
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      
      console.log('[deleteServizio] Optimistic update applied - removed:', deletedId);
      
      // 5. Ritorna context per rollback
      return { previousServizi };
    },
    
    onSuccess: () => {
      // ✅ Conferma eliminazione e invalida per sicurezza
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return key === 'servizi' || key === 'servizio' || key === 'servizi-with-passeggeri';
        }
      });
      toast.success('Servizio eliminato definitivamente');
    },
    
    onError: (error: any, deletedId: string, context: any) => {
      // ❌ Rollback in caso di errore
      if (context?.previousServizi) {
        queryClient.setQueryData(['servizi'], context.previousServizi);
        console.log('[deleteServizio] Rollback applied due to error');
      }
      
      console.error('Error deleting service:', error);
      toast.error(`Errore nell'eliminazione del servizio: ${error.message || 'Si è verificato un errore'}`);
    },
  });

  return {
    servizi,
    isLoading,
    isError,
    error,
    refetch,
    createServizio: (data: CreateServizioRequest) => createServizioMutation.mutate(data),
    updateServizio: (data: UpdateServizioRequest) => updateServizioMutation.mutate(data),
    updateStatoServizio: (id: string, stato: StatoServizio) => 
      updateStatoServizioMutation.mutate({ id, stato }),
    completaServizio: completaServizioMutation.mutate,
    consuntivaServizio: consuntivaServizioMutation.mutate,
    deleteServizio: (id: string) => deleteServizioMutation.mutateAsync(id),
    isCreating: createServizioMutation.isPending,
    isUpdating: updateStatoServizioMutation.isPending,
    isUpdatingServizio: updateServizioMutation.isPending,
    isCompletando: completaServizioMutation.isPending,
    isConsuntivando: consuntivaServizioMutation.isPending,
    isDeleting: deleteServizioMutation.isPending
  };
}

export function useServizio(id?: string) {
  return useQuery({
    queryKey: ['servizio', id],
    queryFn: () => getServizioById(id!),
    enabled: !!id
  });
}
