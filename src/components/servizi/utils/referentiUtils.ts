
import { supabase } from '@/lib/supabase';
import { UserFormData } from '@/lib/api/users/types';
import { toast } from '@/components/ui/use-toast';

export async function createReferente(userData: UserFormData) {
  try {
    // Assicuriamoci che ruolo e azienda_id siano impostati
    if (!userData.role) {
      userData.role = 'cliente';
    }
    
    if (!userData.azienda_id) {
      throw new Error('Per creare un referente è necessario specificare l\'azienda');
    }
    
    // Chiamata all'API esistente via endpoint Edge Function di Supabase
    const response = await fetch('https://iczxhmzwjopfdvbxwzjs.supabase.co/functions/v1/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      let errorMessage = 'Errore durante la creazione del referente';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // In caso di errore nel parsing della risposta
      }
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    return { user: data.user, error: null };
  } catch (error: any) {
    console.error('Error in createReferente:', error);
    return { user: null, error };
  }
}
