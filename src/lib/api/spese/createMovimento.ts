
import { supabase } from "@/lib/supabase";
import { MovimentoAziendaleFormData, MovimentoAziendale } from "@/lib/types/spese";

export const createMovimento = async (data: MovimentoAziendaleFormData): Promise<MovimentoAziendale> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Utente non autenticato");

    const { data: newMovimento, error } = await supabase
      .from('movimenti_aziendali')
      .insert({
        ...data,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newMovimento;
  } catch (error) {
    console.error('Error creating movimento:', error);
    throw error;
  }
};
