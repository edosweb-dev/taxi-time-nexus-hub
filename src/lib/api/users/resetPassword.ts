
import { supabase } from '@/lib/supabase';

export async function resetUserPassword(email: string): Promise<{ success: boolean; error: any }> {
  try {
    console.log("[resetUserPassword] Sending password reset email to:", email);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error("[resetUserPassword] Password reset error:", error);
      return { success: false, error };
    }

    console.log("[resetUserPassword] Password reset email sent successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[resetUserPassword] Error in resetUserPassword:', error);
    return { success: false, error };
  }
}
