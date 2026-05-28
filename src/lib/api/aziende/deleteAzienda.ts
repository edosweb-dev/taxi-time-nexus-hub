
import { supabase } from '@/lib/supabase';

export async function deleteAzienda(id: string): Promise<{ success?: boolean; error?: any }> {
  try {
    console.log(`[deleteAzienda] Deleting company with ID: ${id}`);

    const [profilesRes, serviziRes, passeggeriRes] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('azienda_id', id),
      supabase.from('servizi').select('id', { count: 'exact', head: true }).eq('azienda_id', id),
      supabase.from('passeggeri').select('id', { count: 'exact', head: true }).eq('azienda_id', id),
    ]);

    const profilesError = profilesRes.error;
    const serviziError = serviziRes.error;
    const passeggeriError = passeggeriRes.error;

    if (profilesError || serviziError || passeggeriError) {
      const firstError = profilesError || serviziError || passeggeriError;
      console.error('[deleteAzienda] Error checking dependencies:', firstError);
      return { error: firstError };
    }

    const nProfiles = profilesRes.count ?? 0;
    const nServizi = serviziRes.count ?? 0;
    const nPasseggeri = passeggeriRes.count ?? 0;

    if (nProfiles > 0 || nServizi > 0 || nPasseggeri > 0) {
      const parts: string[] = [];
      if (nProfiles > 0) parts.push(`${nProfiles} ${nProfiles === 1 ? 'referente' : 'referenti'}`);
      if (nServizi > 0) parts.push(`${nServizi} ${nServizi === 1 ? 'servizio' : 'servizi'}`);
      if (nPasseggeri > 0) parts.push(`${nPasseggeri} ${nPasseggeri === 1 ? 'passeggero' : 'passeggeri'}`);
      const message = `Non è possibile eliminare l'azienda perché ha collegamenti attivi: ${parts.join(', ')}. Elimina o sposta prima questi elementi.`;
      console.error(`[deleteAzienda] Cannot delete company ${id}: ${message}`);
      return { error: { message } };
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
