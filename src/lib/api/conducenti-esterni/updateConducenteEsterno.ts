import { supabase } from '@/lib/supabase';
import { UpdateConducenteEsternoRequest, ConducenteEsterno } from '@/lib/types/conducenti-esterni';

export async function updateConducenteEsterno(data: UpdateConducenteEsternoRequest): Promise<ConducenteEsterno> {
  const { id, ...updateData } = data;

  const { data: conducenteData, error } = await supabase
    .from('conducenti_esterni')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating conducente esterno:', error);
    throw new Error(`Errore nell'aggiornamento del conducente esterno: ${error.message}`);
  }

  if (!conducenteData) {
    throw new Error('Errore nell\'aggiornamento del conducente esterno: nessun dato restituito');
  }

  return conducenteData;
}