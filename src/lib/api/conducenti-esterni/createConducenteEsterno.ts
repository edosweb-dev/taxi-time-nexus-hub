import { supabase } from '@/lib/supabase';
import { CreateConducenteEsternoRequest, ConducenteEsterno } from '@/lib/types/conducenti-esterni';

export async function createConducenteEsterno(data: CreateConducenteEsternoRequest): Promise<ConducenteEsterno> {
  // Get current user session for created_by field
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw new Error(`Errore di autenticazione: ${sessionError.message}`);
  }
  
  if (!sessionData?.session) {
    throw new Error('Utente non autenticato');
  }

  const userId = sessionData.session.user.id;

  const { data: conducenteData, error } = await supabase
    .from('conducenti_esterni')
    .insert({
      nome_cognome: data.nome_cognome,
      email: data.email || null,
      telefono: data.telefono || null,
      note: data.note || null,
      created_by: userId
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating conducente esterno:', error);
    throw new Error(`Errore nella creazione del conducente esterno: ${error.message}`);
  }

  if (!conducenteData) {
    throw new Error('Errore nella creazione del conducente esterno: nessun dato restituito');
  }

  return conducenteData;
}