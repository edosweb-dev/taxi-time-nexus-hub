
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

// Direct password reset via edge function
export async function updateUserPasswordDirect(
  userId: string, 
  newPassword: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: { message: 'Non autenticato' } };
    }

    const response = await fetch(
      `https://iczxhmzwjopfdvbxwzjs.supabase.co/functions/v1/update-user-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ userId, newPassword }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: { message: errorData.error } };
    }

    return { success: true, error: null };
  } catch (error: any) {
    console.error('[updateUserPasswordDirect] Error:', error);
    return { success: false, error };
  }
}
