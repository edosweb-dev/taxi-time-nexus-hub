
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { Session as SupabaseSession } from '@supabase/supabase-js';
import { Profile, UserRole } from '@/lib/types';

interface AuthContextType {
  session: SupabaseSession | null;
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  isImpersonating: boolean;
  originalAdminId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  startImpersonation: (targetUserId: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalAdminId, setOriginalAdminId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing impersonation state (security fix - use sessionStorage with expiry)
    const storedImpersonation = sessionStorage.getItem('impersonation_data');
    if (storedImpersonation) {
      try {
        const impersonationData = JSON.parse(storedImpersonation);
        // Check if impersonation has expired (24 hours)
        if (impersonationData.expiry && Date.now() > impersonationData.expiry) {
          sessionStorage.removeItem('impersonation_data');
          return;
        }
        setIsImpersonating(true);
        setOriginalAdminId(impersonationData.originalAdminId);
        setUser({ id: impersonationData.targetUser.id, email: impersonationData.targetUser.email });
        setProfile(impersonationData.targetUser);
        setLoading(false);
        return;
      } catch (error) {
        console.error('[AuthContext] Failed to restore impersonation state:', error);
        sessionStorage.removeItem('impersonation_data');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Errore nel recupero della sessione');
        return;
      }
      
      if (!isImpersonating) {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setLoading(false);
        }
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[AuthContext] Auth state changed:", event);
        
        // Don't update auth state if we're impersonating
        if (isImpersonating) {
          return;
        }
        
        // Aggiornato per utilizzare un evento valido per Supabase
        // Importante: non cambiamo sessione su determinati eventi per evitare interferenze con la creazione utenti
        if (event === "USER_UPDATED") {
          console.log("[AuthContext] Ignoring USER_UPDATED event to prevent automatic login");
          return;
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isImpersonating]);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('[AuthContext] Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[AuthContext] Error fetching profile:', error);
        throw error;
      }
      
      console.log('[AuthContext] Profile fetched successfully:', data);
      
      // Cast the role to UserRole type explicitly
      const profile = {
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role as UserRole, // Explicit cast to UserRole
        azienda_id: data.azienda_id || null,
        email: data.email,
        telefono: data.telefono
      };
      
      setProfile(profile);
      return profile;
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('[AuthContext] Iniziando signIn per:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[AuthContext] Risposta da signInWithPassword:', { 
        hasUser: !!data.user, 
        hasSession: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('[AuthContext] Errore di autenticazione:', error);
        toast.error(`Errore di accesso: ${error.message}`);
        return;
      }

      if (data.user) {
        console.log('[AuthContext] Utente autenticato, ID:', data.user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        console.log('[AuthContext] Ricerca profilo per utente:', data.user.id);
        console.log('[AuthContext] Risultato ricerca profilo:', { 
          hasProfile: !!profileData, 
          error: profileError?.message 
        });

        if (profileError) {
          console.error('[AuthContext] Errore nel recupero del profilo:', profileError);
          toast.error('Errore nel recupero del profilo');
          return;
        }

        if (profileData) {
          console.log('[AuthContext] Profilo trovato:', profileData);
          
          // Cast the role to UserRole type explicitly
          setProfile({
            id: profileData.id,
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            role: profileData.role as UserRole, // Explicit cast to UserRole
            azienda_id: profileData.azienda_id || null
          });
          
          // Reindirizza in base al ruolo
          if (profileData.role === 'cliente') {
            console.log('[AuthContext] Reindirizzamento a dashboard cliente');
            navigate('/dashboard-cliente');
          } else {
            console.log('[AuthContext] Reindirizzamento a dashboard principale');
            navigate('/dashboard');
          }
          toast.success('Accesso effettuato con successo');
        } else {
          console.error('[AuthContext] Profilo non trovato per utente:', data.user.id);
          toast.error('Profilo utente non trovato');
        }
      }
    } catch (error: any) {
      console.error('[AuthContext] Errore imprevisto durante signIn:', error);
      toast.error(error.message || 'Errore durante l\'accesso');
    } finally {
      setLoading(false);
    }
  };

  const startImpersonation = async (targetUserId: string) => {
    console.log('[AuthContext] Starting impersonation for user:', targetUserId);
    
    try {
      const { data, error } = await supabase.functions.invoke('impersonate-user', {
        body: { targetUserId }
      });

      if (error) {
        console.error('[AuthContext] Impersonation error:', error);
        throw new Error(error.message || 'Failed to start impersonation');
      }

      if (data?.success && data?.impersonationData) {
        const { targetUser, originalAdminId: adminId } = data.impersonationData;
        
        // Store original admin data
        setOriginalAdminId(adminId);
        setIsImpersonating(true);
        
        // Set the impersonated user as current user/profile
        setUser({ id: targetUser.id, email: targetUser.email });
        setProfile(targetUser);
        
        // Store impersonation state securely in sessionStorage with expiry
        const impersonationDataWithExpiry = {
          ...data.impersonationData,
          expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        sessionStorage.setItem('impersonation_data', JSON.stringify(impersonationDataWithExpiry));
        
        console.log('[AuthContext] Impersonation started successfully');
        
        // Navigate based on target user's role
        if (targetUser.role === 'cliente') {
          navigate('/dashboard-cliente');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('[AuthContext] Failed to start impersonation:', error);
      throw error;
    }
  };

  const stopImpersonation = async () => {
    console.log('[AuthContext] Stopping impersonation...');
    
    // Clear impersonation state
    setIsImpersonating(false);
    setOriginalAdminId(null);
    sessionStorage.removeItem('impersonation_data');
    
    // Restore original admin session
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession) {
      await fetchProfile(currentSession.user.id);
      setUser(currentSession.user);
    }
    
    navigate('/users');
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // If impersonating, clear impersonation state
      if (isImpersonating) {
        setIsImpersonating(false);
        setOriginalAdminId(null);
        sessionStorage.removeItem('impersonation_data');
      }
      
      await supabase.auth.signOut();
      navigate('/login');
      toast.success('Disconnessione effettuata');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Errore durante la disconnessione');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    loading,
    isImpersonating,
    originalAdminId,
    signIn,
    signOut,
    startImpersonation,
    stopImpersonation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
