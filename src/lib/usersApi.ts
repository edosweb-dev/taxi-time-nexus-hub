
import { supabase } from './supabase';
import { Profile } from './types';

export type UserFormData = {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'socio' | 'dipendente' | 'cliente';
};

export async function getUsers(): Promise<Profile[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;
    return data as Profile[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Profile;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}

export async function createUser(userData: UserFormData): Promise<{ user: Profile | null; error: any }> {
  try {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        first_name: userData.first_name,
        last_name: userData.last_name
      }
    });

    if (authError) {
      return { user: null, error: authError };
    }

    // 2. Update profile with role (the trigger should have created the profile)
    if (authData.user) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          role: userData.role
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        return { user: null, error: profileError };
      }

      return { user: profileData as Profile, error: null };
    }

    return { user: null, error: "Failed to create user" };
  } catch (error) {
    console.error('Error creating user:', error);
    return { user: null, error };
  }
}

export async function updateUser(id: string, userData: Partial<UserFormData>): Promise<{ success: boolean; error: any }> {
  try {
    // 1. Update profile data
    const profileData: Partial<Profile> = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', id);

    if (profileError) {
      return { success: false, error: profileError };
    }

    // 2. If password is provided, update it
    if (userData.password) {
      const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
        password: userData.password
      });

      if (passwordError) {
        return { success: false, error: passwordError };
      }
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
}

export async function deleteUser(id: string): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.auth.admin.deleteUser(id);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
}
