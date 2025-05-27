import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';

export async function createUser(userData: UserFormData): Promise<{ user: any; error: any }> {
  try {
    console.log("[createUser] Creating user with data:", userData);
    
    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password || 'TempPassword123!',
      email_confirm: true, // Skip email verification
    });

    if (authError) {
      console.error("[createUser] Auth error:", authError);
      return { user: null, error: authError };
    }

    console.log("[createUser] User created in auth, ID:", authData.user?.id);

    // 2. Update the profile with the user data including email
    const profileData = {
      id: authData.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      email: userData.email, // Salva l'email anche nella tabella profiles
      azienda_id: userData.azienda_id || null,
    };

    const { data: profileUpdateData, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData)
      .select();

    if (profileError) {
      console.error("[createUser] Profile update error:", profileError);
      
      // If profile update fails, delete the auth user to keep things consistent
      await supabase.auth.admin.deleteUser(authData.user.id);
      
      return { user: null, error: profileError };
    }

    console.log("[createUser] Profile updated successfully:", profileUpdateData);
    return { user: profileUpdateData[0], error: null };
  } catch (error) {
    console.error('[createUser] Error in createUser:', error);
    return { user: null, error };
  }
}
