
import { supabase } from "@/lib/supabase";
import { SpesaPersonaleFormData, SpesaPersonale } from "@/lib/types/spese";

export const createSpesa = async (data: SpesaPersonaleFormData): Promise<SpesaPersonale> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const { data: newSpesa, error } = await supabase
      .from('spese_personali')
      .insert({
        ...data,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newSpesa;
  } catch (error) {
    console.error('Error creating spesa:', error);
    throw error;
  }
};
