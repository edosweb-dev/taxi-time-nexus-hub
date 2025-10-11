import { supabase } from "@/integrations/supabase/client";
import { ClientePrivato } from "@/lib/types/servizi";

export interface UpdateClientePrivatoInput {
  nome?: string;
  cognome?: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  citta?: string;
  note?: string;
}

export async function updateClientePrivato(
  id: string,
  input: UpdateClientePrivatoInput
): Promise<ClientePrivato> {
  const { data, error } = await supabase
    .from('clienti_privati')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating cliente privato:', error);
    throw error;
  }

  return data;
}
