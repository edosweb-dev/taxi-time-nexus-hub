
import { supabase } from "@/lib/supabase";
import { MovimentoAziendaleFormData, MovimentoAziendale } from "@/lib/types/spese";

export const createMovimento = async (data: MovimentoAziendaleFormData): Promise<MovimentoAziendale> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    // Ensure importo is a number and not undefined
    const formattedData = {
      ...data,
      importo: Number(data.importo)
    };

    const { data: newMovimento, error } = await supabase
      .from('movimenti_aziendali')
      .insert({
        ...formattedData,
        created_by: user.id,
      })
      .select(`
        *,
        effettuato_da:profiles(id, first_name, last_name, role),
        metodo_pagamento:metodi_pagamento_spese(id, nome, descrizione, created_at)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Ensure the returned data conforms to the MovimentoAziendale type
    // Handle potentially missing fields or null values
    const safeMovimento: MovimentoAziendale = {
      ...newMovimento,
      tipo: newMovimento.tipo,
      stato: newMovimento.stato || null,
      effettuato_da: newMovimento.effettuato_da && typeof newMovimento.effettuato_da === 'object' ? 
        newMovimento.effettuato_da : null,
      metodo_pagamento: newMovimento.metodo_pagamento && typeof newMovimento.metodo_pagamento === 'object' ? 
        newMovimento.metodo_pagamento : undefined
    };

    return safeMovimento;
  } catch (error) {
    console.error('Error creating movimento:', error);
    throw error;
  }
};
