
import { supabase } from "@/lib/supabase";
import { SpesaPersonale, MovimentoAziendale } from "@/lib/types/spese";

export const convertSpesaToMovimento = async (spesaId: string, metodoPagamentoId: string): Promise<MovimentoAziendale> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    // First, get the spesa details
    const { data: spesa, error: spesaError } = await supabase
      .from('spese_personali')
      .select('*')
      .eq('id', spesaId)
      .single();

    if (spesaError || !spesa) {
      throw spesaError || new Error("Spesa non trovata");
    }

    // Create a new movimento from the spesa
    const { data: movimento, error: movimentoError } = await supabase
      .from('movimenti_aziendali')
      .insert({
        data: spesa.data,
        importo: spesa.importo,
        causale: `Spesa personale convertita: ${spesa.causale}`,
        note: spesa.note,
        tipo: 'spesa',
        metodo_pagamento_id: metodoPagamentoId,
        stato: 'saldato',
        effettuato_da_id: spesa.user_id,
        spesa_personale_id: spesa.id,
        created_by: user.id,
      })
      .select()
      .single();

    if (movimentoError) {
      throw movimentoError;
    }

    // Mark the spesa as converted
    const { error: updateError } = await supabase
      .from('spese_personali')
      .update({ convertita_aziendale: true })
      .eq('id', spesaId);

    if (updateError) {
      throw updateError;
    }

    return movimento;
  } catch (error) {
    console.error('Error converting spesa to movimento:', error);
    throw error;
  }
};
