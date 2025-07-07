import { supabase } from '@/lib/supabase';

export async function deleteConducenteEsterno(id: string): Promise<void> {
  // Instead of hard delete, we deactivate the driver
  const { error } = await supabase
    .from('conducenti_esterni')
    .update({ attivo: false })
    .eq('id', id);

  if (error) {
    console.error('Error deactivating conducente esterno:', error);
    throw new Error(`Errore nella disattivazione del conducente esterno: ${error.message}`);
  }
}

export async function reactivateConducenteEsterno(id: string): Promise<void> {
  const { error } = await supabase
    .from('conducenti_esterni')
    .update({ attivo: true })
    .eq('id', id);

  if (error) {
    console.error('Error reactivating conducente esterno:', error);
    throw new Error(`Errore nella riattivazione del conducente esterno: ${error.message}`);
  }
}