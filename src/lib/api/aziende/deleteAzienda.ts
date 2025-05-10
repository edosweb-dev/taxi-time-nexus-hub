
import { supabase } from '@/lib/supabase';

export async function deleteAzienda(id: string): Promise<{ success?: boolean; error?: any }> {
  try {
    console.log(`[deleteAzienda] Deleting company with ID: ${id}`);
    
    // Check if company has associated profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('azienda_id', id);
      
    if (profilesError) {
      console.error('[deleteAzienda] Error checking for associated profiles:', profilesError);
      return { error: profilesError };
    }
    
    if (profiles && profiles.length > 0) {
      console.error(`[deleteAzienda] Cannot delete company with ID ${id}, it has ${profiles.length} associated profiles`);
      return { 
        error: { 
          message: 'Non è possibile eliminare l\'azienda perché ha dei referenti associati'
        }
      };
    }

    const { error: deleteError } = await supabase
      .from('aziende')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[deleteAzienda] Error deleting company:', deleteError);
      return { error: deleteError };
    }

    console.log(`[deleteAzienda] Company with ID ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error('[deleteAzienda] Unexpected error:', error);
    return { error };
  }
}
