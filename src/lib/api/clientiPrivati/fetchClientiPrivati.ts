import { supabase } from "@/integrations/supabase/client";
import { ClientePrivato } from "@/lib/types/servizi";

export async function fetchClientiPrivati(): Promise<ClientePrivato[]> {
  const { data, error } = await supabase
    .from('clienti_privati')
    .select('*')
    .order('cognome', { ascending: true })
    .order('nome', { ascending: true });

  if (error) {
    console.error('Error fetching clienti privati:', error);
    throw error;
  }

  return data || [];
}
