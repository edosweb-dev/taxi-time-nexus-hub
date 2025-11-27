
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { ShiftFormData, Shift } from './types';
import { createShiftApi, updateShiftApi, deleteShiftApi } from './shiftApi';
import { supabase } from '@/lib/supabase';

export const useShiftMutations = (userId?: string) => {
  const queryClient = useQueryClient();

  // Funzione di validazione per verificare se un utente può inserire un nuovo turno
  const validateShiftRule = (shifts: Shift[], newShift: ShiftFormData, editingShiftId?: string): { isValid: boolean; errorMessage?: string } => {
    // Formatta la data del nuovo turno per il confronto
    const newShiftDate = newShift.shift_date.toISOString().split('T')[0];
    
    console.log(`[VALIDATION] Checking shift for user ${newShift.user_id} on date ${newShiftDate}, editing: ${editingShiftId || 'new'}`);
    console.log(`[VALIDATION] New shift type: ${newShift.shift_type}`);
    
    // Filtro i turni dell'utente nella stessa data (escludendo quello in modifica se esistente)
    const userShiftsOnSameDate = shifts.filter(shift => 
      shift.user_id === newShift.user_id && 
      shift.shift_date === newShiftDate &&
      (!editingShiftId || shift.id !== editingShiftId)
    );
    
    console.log(`[VALIDATION] Found ${userShiftsOnSameDate.length} existing shifts on same date:`, userShiftsOnSameDate.map(s => ({ id: s.id, type: s.shift_type })));
    
    // Se non ci sono turni esistenti per quella data, è sempre valido
    if (userShiftsOnSameDate.length === 0) {
      console.log(`[VALIDATION] ✅ No existing shifts, allowing new shift`);
      return { isValid: true };
    }

    // Per ora, con solo 4 tipi di turno, non permettiamo multipli turni nella stessa data
    console.log(`[VALIDATION] ❌ Blocking shift - multiple shifts not allowed`);
    return { 
      isValid: false, 
      errorMessage: "È possibile inserire un solo turno per giornata."
    };
  };

  // Mutation per creare un turno (ottimizzata per non fare doppia validazione in batch)
  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData & { created_by_override?: string }) => {
      // Usa override se passato, altrimenti fallback sulla closure
      const effectiveUserId = data.created_by_override || userId;
      if (!effectiveUserId) {
        console.error('[shiftMutations] No userId available - override:', data.created_by_override, 'closure:', userId);
        throw new Error('Utente non autenticato');
      }
      
      console.log('[shiftMutations] createShift with effectiveUserId:', effectiveUserId);
      
      // Skip validation per batch operations che hanno già validato
      // Mantieni validazione solo per operazioni singole
      const isBatchOperation = data.notes?.includes('[BATCH]') || false;
      
      if (!isBatchOperation) {
        const shiftDate = data.shift_date.toISOString().split('T')[0];
        const { data: existingShifts, error } = await supabase
          .from('shifts')
          .select('*')
          .eq('user_id', data.user_id)
          .eq('shift_date', shiftDate);

        if (error) {
          console.error('Error checking existing shifts:', error);
          throw new Error('Errore nel controllo dei turni esistenti');
        }
        
        const validation = validateShiftRule(existingShifts as Shift[] || [], data);
        
        if (!validation.isValid) {
          throw new Error(validation.errorMessage);
        }
      }
      
      return createShiftApi(data, effectiveUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno creato con successo');
    },
    onError: (error) => {
      console.error('Error creating shift:', error);
      toast.error(error instanceof Error ? error.message : 'Errore nella creazione del turno');
    },
  });

  // Mutation per aggiornare un turno
  const updateShiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ShiftFormData & { user_id_override?: string } }) => {
      // Usa override se passato, altrimenti fallback sulla closure
      const effectiveUserId = data.user_id_override || userId;
      if (!effectiveUserId) {
        console.error('[shiftMutations] No userId available for update - override:', data.user_id_override, 'closure:', userId);
        throw new Error('Utente non autenticato');
      }
      
      console.log('[shiftMutations] updateShift with effectiveUserId:', effectiveUserId);
      
      const shiftDate = data.shift_date.toISOString().split('T')[0];
      const { data: existingShifts, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', data.user_id)
        .eq('shift_date', shiftDate);

      if (error) {
        console.error('Error checking existing shifts:', error);
        throw new Error('Errore nel controllo dei turni esistenti');
      }
      
      // Verifica se è possibile aggiornare il turno (escluso quello corrente)
      const validation = validateShiftRule(existingShifts as Shift[] || [], data, id);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return updateShiftApi(id, data, effectiveUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno aggiornato con successo');
    },
    onError: (error) => {
      console.error('Error updating shift:', error);
      toast.error(error instanceof Error ? error.message : 'Errore nell\'aggiornamento del turno');
    },
  });

  // Mutation per eliminare un turno
  const deleteShiftMutation = useMutation({
    mutationFn: async (id: string) => {
      return deleteShiftApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['shifts']});
      toast.success('Turno eliminato con successo');
    },
    onError: (error) => {
      console.error('Error deleting shift:', error);
      toast.error('Errore nell\'eliminazione del turno');
    },
  });

  return {
    createShiftMutation,
    updateShiftMutation,
    deleteShiftMutation,
  };
};
