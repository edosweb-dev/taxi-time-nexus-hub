
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
    
    // Filtro i turni dell'utente nella stessa data (escludendo quello in modifica se esistente)
    const userShiftsOnSameDate = shifts.filter(shift => 
      shift.user_id === newShift.user_id && 
      shift.shift_date === newShiftDate &&
      (!editingShiftId || shift.id !== editingShiftId)
    );
    
    // Se non ci sono turni esistenti per quella data, è sempre valido
    if (userShiftsOnSameDate.length === 0) {
      return { isValid: true };
    }

    // Verifica la regola: è consentito più di un turno solo se tutti sono di tipo "specific_hours"
    if (newShift.shift_type === 'specific_hours') {
      // Verifica che tutti i turni esistenti siano di tipo "specific_hours"
      const allSpecificHours = userShiftsOnSameDate.every(shift => shift.shift_type === 'specific_hours');
      if (allSpecificHours) {
        return { isValid: true };
      }
    }

    // In tutti gli altri casi, non è permesso inserire un altro turno
    return { 
      isValid: false, 
      errorMessage: "È possibile inserire un solo turno per giornata, a meno che entrambi i turni abbiano un orario specifico."
    };
  };

  // Mutation per creare un turno
  const createShiftMutation = useMutation({
    mutationFn: async (data: ShiftFormData) => {
      if (!userId) throw new Error('Utente non autenticato');
      
      // Invece di usare la query cache, facciamo una query diretta al database 
      // per ottenere tutti i turni dell'utente nella data specifica
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
      
      // Verifica se è possibile inserire il turno
      const validation = validateShiftRule(existingShifts as Shift[] || [], data);
      
      if (!validation.isValid) {
        throw new Error(validation.errorMessage);
      }
      
      return createShiftApi(data, userId);
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
    mutationFn: async ({ id, data }: { id: string; data: ShiftFormData }) => {
      if (!userId) throw new Error('Utente non autenticato');
      
      // Invece di usare la query cache, facciamo una query diretta al database 
      // per ottenere tutti i turni dell'utente nella data specifica
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
      
      return updateShiftApi(id, data, userId);
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
