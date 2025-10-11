import { supabase } from "@/integrations/supabase/client";

export async function deleteClientePrivato(id: string): Promise<void> {
  const { error } = await supabase
    .from('clienti_privati')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting cliente privato:', error);
    throw error;
  }
}
