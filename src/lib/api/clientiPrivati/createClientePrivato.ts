import { supabase } from "@/integrations/supabase/client";
import { ClientePrivato } from "@/lib/types/servizi";

export interface CreateClientePrivatoInput {
  nome: string;
  cognome: string;
  email?: string;
  telefono?: string;
  indirizzo?: string;
  citta?: string;
  note?: string;
}

export async function createClientePrivato(
  input: CreateClientePrivatoInput
): Promise<ClientePrivato> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Non autenticato");

  const { data, error } = await supabase
    .from('clienti_privati')
    .insert({
      ...input,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating cliente privato:', error);
    throw error;
  }

  return data;
}
