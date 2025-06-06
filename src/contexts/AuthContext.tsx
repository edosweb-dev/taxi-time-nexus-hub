
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
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        toast.error('Errore nel recupero della sessione');
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("[AuthContext] Auth state changed:", event);
        
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
  }, []);

  const fetchProfile = async (userId: string) => {
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
      setProfile({
        id: data.id,
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role as UserRole, // Explicit cast to UserRole
        azienda_id: data.azienda_id || null
      });
    } catch (error) {
      console.error('[AuthContext] Error fetching profile:', error);
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

  const signOut = async () => {
    try {
      setLoading(true);
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
    signIn,
    signOut,
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
