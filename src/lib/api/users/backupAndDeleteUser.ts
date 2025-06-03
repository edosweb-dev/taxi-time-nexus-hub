
import { supabase } from '@/lib/supabase';
import { Json } from '@/integrations/supabase/types';

export interface DeleteUserSummary {
  success: boolean;
  backup_id: string;
  deleted_user: string;
  summary: {
    servizi: number;
    stipendi: number;
    spese: number;
    turni: number;
    movimenti: number;
    spese_aziendali: number;
  };
}

export async function backupAndDeleteUser(userId: string): Promise<{ success: boolean; error?: any; data?: DeleteUserSummary }> {
  try {
    console.log("[backupAndDeleteUser] Starting backup and deletion for user:", userId);
    
    const { data, error } = await supabase.functions.invoke('backup-and-delete-user', {
      body: { userId }
    });
    
    if (error) {
      console.error("[backupAndDeleteUser] Error:", error);
      return { success: false, error };
    }
    
    console.log("[backupAndDeleteUser] Success:", data);
    return { success: true, data };
  } catch (error) {
    console.error('[backupAndDeleteUser] Unexpected error:', error);
    return { success: false, error };
  }
}

export interface UserBackup {
  id: string;
  deleted_user_id: string;
  deleted_at: string;
  deleted_by: string;
  user_data: Json;
  servizi_data: Json;
  stipendi_data: Json;
  spese_data: Json;
  turni_data: Json;
  altri_dati: Json;
  created_at: string;
}

export async function getUserBackups(): Promise<UserBackup[]> {
  try {
    const { data, error } = await supabase
      .from('user_deletion_backup')
      .select(`
        *,
        deleted_by_profile:profiles!user_deletion_backup_deleted_by_fkey(first_name, last_name)
      `)
      .order('deleted_at', { ascending: false });
    
    if (error) {
      console.error("[getUserBackups] Error:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('[getUserBackups] Error fetching user backups:', error);
    throw error;
  }
}

export async function getUserBackupById(backupId: string): Promise<UserBackup | null> {
  try {
    const { data, error } = await supabase
      .from('user_deletion_backup')
      .select(`
        *,
        deleted_by_profile:profiles!user_deletion_backup_deleted_by_fkey(first_name, last_name)
      `)
      .eq('id', backupId)
      .single();
    
    if (error) {
      console.error("[getUserBackupById] Error:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[getUserBackupById] Error fetching user backup:', error);
    throw error;
  }
}
