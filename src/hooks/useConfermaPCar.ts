import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { sendEmailNotification } from '@/lib/api/email/sendNotification';
import { toast } from 'sonner';

interface ConfermaPCaricoPayload {
  servizio_id: string;
  assegnato_a?: string;
  veicolo_id?: string;
  metodo_pagamento?: string;
  km_totali?: number;
  incasso_netto_previsto?: number;
  incasso_previsto?: number;
  iva?: number;
  note?: string;
}

/**
 * Hook per confermare presa in carico richiesta cliente.
 * 1. Aggiorna servizio con dettagli compilati
 * 2. Invia email conferma_presa_carico_completo
 */
export function useConfermaPCar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ConfermaPCaricoPayload) => {
      const { servizio_id, ...updateFields } = payload;

      console.log('[useConfermaPCar] Start:', servizio_id);

      // 1. Verifica che sia richiesta cliente
      const { data: servizio, error: checkError } = await supabase
        .from('servizi')
        .select('is_richiesta_cliente, stato')
        .eq('id', servizio_id)
        .single();

      if (checkError) throw checkError;

      if (!servizio?.is_richiesta_cliente) {
        throw new Error('Servizio non è una richiesta cliente');
      }

      // 2. Build update object (only non-undefined fields)
      const updateData: Record<string, unknown> = {};
      if (updateFields.assegnato_a) updateData.assegnato_a = updateFields.assegnato_a;
      if (updateFields.veicolo_id) updateData.veicolo_id = updateFields.veicolo_id;
      if (updateFields.metodo_pagamento) updateData.metodo_pagamento = updateFields.metodo_pagamento;
      if (updateFields.km_totali != null) updateData.km_totali = updateFields.km_totali;
      if (updateFields.incasso_previsto != null) updateData.incasso_previsto = updateFields.incasso_previsto;
      if (updateFields.note) updateData.note = updateFields.note;

      // Stato: assegnato se autista selezionato, altrimenti da_assegnare
      updateData.stato = updateFields.assegnato_a ? 'assegnato' : 'da_assegnare';

      const { error: updateError } = await supabase
        .from('servizi')
        .update(updateData)
        .eq('id', servizio_id);

      if (updateError) throw updateError;

      // 3. Invia email conferma presa in carico (fire-and-forget)
      try {
        await sendEmailNotification(servizio_id, 'conferma_presa_carico_completo');
        console.log('[useConfermaPCar] Email sent');
      } catch (emailError) {
        console.error('[useConfermaPCar] Email error:', emailError);
        toast.warning('Servizio confermato ma email non inviata');
      }

      return { servizio_id };
    },

    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['servizi'] }),
        queryClient.invalidateQueries({ queryKey: ['servizio', data.servizio_id] }),
        queryClient.invalidateQueries({ queryKey: ['richieste-clienti'] }),
        queryClient.invalidateQueries({ queryKey: ['richiesta-cliente', data.servizio_id] }),
      ]);
      toast.success('CONFERMA DI PRESA IN CARICO INVIATA');
    },

    onError: (error: Error) => {
      console.error('[useConfermaPCar] Error:', error);
      toast.error(error.message || 'Errore durante la conferma');
    },
  });
}
