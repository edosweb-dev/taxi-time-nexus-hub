
import { supabase } from '@/lib/supabase';

export async function deleteUser(id: string): Promise<{ success: boolean; error: any }> {
  try {
    console.log("[deleteUser] Deleting user with ID:", id);
    
    // Delete user from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("[deleteUser] User deletion error:", error);
      console.error("[deleteUser] Full deletion error details:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    
    console.log("[deleteUser] User deleted successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[deleteUser] Error in deleteUser:', error);
    return { success: false, error };
  }
}
