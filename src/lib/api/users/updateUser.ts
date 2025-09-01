
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
    if (userData.email) profileData.email = userData.email;
    if (userData.telefono !== undefined) profileData.telefono = userData.telefono;
    if (userData.color !== undefined) {
      console.log("[updateUser] Color field detected:", userData.color);
      profileData.color = userData.color;
    }

    console.log("[updateUser] Profile data being sent to Supabase:", profileData);

    // Check if we have any profile data to update
    if (Object.keys(profileData).length > 0) {
      // First verify the user exists
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, color')
        .eq('id', id)
        .single();
      
      if (checkError || !existingUser) {
        console.error("[updateUser] User not found:", id, checkError);
        return { success: false, error: "User not found" };
      }
      
      console.log("[updateUser] User exists, current data:", existingUser);
      console.log("[updateUser] Attempting to update user ID:", id);
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id)
        .select('*'); // Make sure to select all fields to verify update

      if (profileError) {
        console.error("[updateUser] Profile update error:", profileError);
        console.error("[updateUser] Full update error details:", JSON.stringify(profileError, null, 2));
        return { success: false, error: profileError };
      }

      console.log("[updateUser] Profile updated successfully:", updatedProfile);
      
      // Check if any rows were actually updated
      if (!updatedProfile || updatedProfile.length === 0) {
        console.error("[updateUser] No rows were updated! User ID might not exist:", id);
        return { success: false, error: "No user found with the provided ID" };
      }
    } else {
      console.log("[updateUser] No profile data to update");
    }

    // 2. Se password è fornita, usa la edge function per aggiornare la password
    if (userData.password) {
      console.log("[updateUser] Updating password via edge function");
      
      const { data, error: passwordError } = await supabase.functions.invoke('update-user-password', {
        body: {
          userId: id,
          newPassword: userData.password
        }
      });

      if (passwordError) {
        console.error("[updateUser] Password update error:", passwordError);
        return { success: false, error: passwordError };
      }
      
      console.log("[updateUser] Password updated successfully via edge function");
    }

    console.log("[updateUser] User updated successfully");
    return { success: true, error: null };
  } catch (error) {
    console.error('[updateUser] Error in updateUser:', error);
    return { success: false, error };
  }
}
