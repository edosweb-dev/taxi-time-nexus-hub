
import { supabase } from '@/lib/supabase';
import { Profile } from '@/lib/types';
import { UserFormData } from './types';

export async function updateUser(id: string, userData: Partial<UserFormData>): Promise<{ success: boolean; error: any }> {
  try {
    console.log("[updateUser] Updating user with ID:", id, "and data:", userData);
    console.log("[updateUser] Role being updated to:", userData.role);
    
    // 1. Update profile data
    const profileData: Partial<Profile> = {};
    
    // Only include fields that are provided
    if (userData.first_name) profileData.first_name = userData.first_name;
    if (userData.last_name) profileData.last_name = userData.last_name;
    if (userData.role) profileData.role = userData.role;

    console.log("[updateUser] Profile data being sent to Supabase:", profileData);

    // Check if we have any profile data to update
    if (Object.keys(profileData).length > 0) {
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select();

      if (profileError) {
        console.error("[updateUser] Profile update error:", profileError);
        console.error("[updateUser] Full update error details:", JSON.stringify(profileError, null, 2));
        return { success: false, error: profileError };
      }

      console.log("[updateUser] Profile updated successfully:", updatedProfile);
    } else {
      console.log("[updateUser] No profile data to update");
    }

    // 2. If password is provided, update it using the auth.updateUser API
    if (userData.password) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: userData.password
      });

      if (passwordError) {
        console.error("[updateUser] Password update error:", passwordError);
        return { success: false, error: passwordError };
      }
      
      console.log("[updateUser] Password updated successfully");
    }

    console.log("[updateUser] User updated successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[updateUser] Error in updateUser:', error);
    return { success: false, error };
  }
}
