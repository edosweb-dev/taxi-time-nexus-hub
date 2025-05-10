
import { supabase } from '@/lib/supabase';
import { UserFormData } from './types';
import { Profile } from '@/lib/types';

export async function createUser(userData: UserFormData) {
  try {
    // Dettagli per debug
    console.log('[createUser] Creating user with data:', userData);
    console.log('[createUser] First name:', userData.first_name);
    console.log('[createUser] Last name:', userData.last_name);
    console.log('[createUser] Email:', userData.email);
    console.log('[createUser] Role being assigned:', userData.role);
    if (userData.azienda_id) {
      console.log('[createUser] Azienda ID:', userData.azienda_id);
    }

    // Step 1: Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        azienda_id: userData.azienda_id,
      },
    });

    if (authError) {
      console.error('[createUser] Error creating auth user:', authError);
      return { user: null, error: authError };
    }

    console.log('[createUser] Auth data after user creation:', authData);

    // Create a profile object for immediate UI feedback
    const profileData: Profile = {
      id: authData.user.id,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      azienda_id: userData.azienda_id
    };
    
    console.log('[createUser] Created profile object for immediate UI feedback:', profileData);

    // Step 2: Verify if the profile was automatically created by the trigger
    console.log('[createUser] Verifying if profile was automatically created by trigger...');
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('[createUser] Error checking for existing profile:', profileError);
      // Continue despite error - we'll try to create or update the profile anyway
    }

    let profileUpdateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      azienda_id: userData.azienda_id
    };

    if (existingProfile) {
      console.log('[createUser] Profile was automatically created, updating it:', existingProfile);
      
      // Update the profile with the provided data
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', authData.user.id)
        .select();
        
      if (updateError) {
        console.error('[createUser] Error updating profile:', updateError);
        return { user: null, error: updateError };
      }
      
      console.log('[createUser] Profile updated successfully:', updatedProfile);
      return { user: profileData, error: null };
    } else {
      console.log('[createUser] Profile not found, creating manually...');
      
      // Create the profile manually
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...profileUpdateData
        })
        .select();
        
      if (createError) {
        console.error('[createUser] Error creating profile manually:', createError);
        return { user: null, error: createError };
      }
      
      console.log('[createUser] Profile created manually:', newProfile);
      return { user: profileData, error: null };
    }
  } catch (error) {
    console.error('[createUser] Unexpected error:', error);
    return { user: null, error };
  }
}
