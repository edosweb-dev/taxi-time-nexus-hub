
import { supabase } from '@/lib/supabase';
import { UpdateVeicoloRequest, Veicolo } from '@/lib/types/veicoli';

export async function updateVeicolo(id: string, data: UpdateVeicoloRequest): Promise<Veicolo> {
  try {
    console.log('[updateVeicolo] Updating veicolo:', id, data);

    const updateData = {
      modello: data.modello,
      targa: data.targa.toUpperCase(),
      anno: data.anno,
      colore: data.colore,
      numero_posti: data.numero_posti,
      note: data.note,
      ...(data.attivo !== undefined && { attivo: data.attivo }),
    };

    const { data: veicoloData, error } = await supabase
      .from('veicoli')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[updateVeicolo] Error updating veicolo:', error);
      throw error;
    }

    console.log('[updateVeicolo] Veicolo updated successfully:', veicoloData);
    return veicoloData as Veicolo;
  } catch (error) {
    console.error('[updateVeicolo] Unexpected error:', error);
    throw error;
  }
}
