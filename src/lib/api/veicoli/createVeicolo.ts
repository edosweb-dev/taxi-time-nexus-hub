
import { supabase } from '@/lib/supabase';
import { CreateVeicoloRequest, Veicolo } from '@/lib/types/veicoli';

export async function createVeicolo(data: CreateVeicoloRequest): Promise<Veicolo> {
  try {
    console.log('[createVeicolo] Creating veicolo with data:', data);

    // Get current user for created_by field
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: veicoloData, error } = await supabase
      .from('veicoli')
      .insert({
        modello: data.modello,
        targa: data.targa.toUpperCase(),
        anno: data.anno,
        colore: data.colore,
        numero_posti: data.numero_posti,
        note: data.note,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[createVeicolo] Error creating veicolo:', error);
      throw error;
    }

    console.log('[createVeicolo] Veicolo created successfully:', veicoloData);
    return veicoloData as Veicolo;
  } catch (error) {
    console.error('[createVeicolo] Unexpected error:', error);
    throw error;
  }
}
