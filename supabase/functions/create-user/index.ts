
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserData {
  email: string;
  password?: string;
  first_name: string;
  last_name: string;
  role: string;
  azienda_id?: string | null;
}

// Handle CORS preflight requests
function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Initialize Supabase client with service role
function initializeSupabase(): { supabase: any, error: string | null } {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseKey) {
    console.error("Edge function: Variabili d'ambiente mancanti");
    console.error("Edge function: SUPABASE_URL:", supabaseUrl ? "presente" : "mancante");
    console.error("Edge function: SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "presente" : "mancante (lunghezza 0)");
    return { 
      supabase: null, 
      error: 'Configurazione del server incompleta' 
    };
  }
  
  console.log("Edge function: Supabase URL disponibile:", !!supabaseUrl);
  console.log("Edge function: Supabase Key disponibile:", !!supabaseKey);
  
  return { 
    supabase: createClient(supabaseUrl, supabaseKey),
    error: null 
  };
}

// Verify user authentication
async function verifyAuthentication(supabase: any, authHeader: string | null): Promise<{ caller: any, error: string | null }> {
  if (!authHeader) {
    console.error("Edge function: Autorizzazione mancante");
    return { 
      caller: null, 
      error: 'Autorizzazione mancante' 
    };
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !caller) {
    console.error("Edge function: Utente non autorizzato", authError);
    return { 
      caller: null, 
      error: 'Utente non autorizzato' 
    };
  }
  
  return { caller, error: null };
}

// Verify user role permissions
async function verifyUserRole(supabase: any, userId: string): Promise<{ hasPermission: boolean, callerProfile: any, error: string | null }> {
  const { data: callerProfile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (profileError) {
    console.error("Edge function: Errore nel recupero del profilo", profileError);
    return { 
      hasPermission: false, 
      callerProfile: null, 
      error: 'Errore nel recupero del profilo' 
    };
  }
  
  console.log("Edge function: Profilo del chiamante:", callerProfile);
  
  if (!callerProfile || !['admin', 'socio'].includes(callerProfile?.role)) {
    console.error("Edge function: Permessi insufficienti, ruolo:", callerProfile?.role);
    return { 
      hasPermission: false, 
      callerProfile: null, 
      error: 'Permessi insufficienti' 
    };
  }
  
  return { hasPermission: true, callerProfile, error: null };
}

// Parse and validate request body
async function parseRequestBody(req: Request): Promise<{ userData: UserData | null, error: string | null, details?: any }> {
  try {
    // CORREZIONE: Assicurati che la richiesta sia clonata prima di leggere il corpo
    const clonedReq = req.clone();
    const rawText = await clonedReq.text();
    console.log("Edge function: Raw request body:", rawText);
    
    if (!rawText || rawText.trim() === '') {
      console.error("Edge function: Corpo della richiesta vuoto");
      return { 
        userData: null, 
        error: 'Corpo della richiesta vuoto' 
      };
    }
    
    let userData: UserData;
    try {
      userData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Edge function: Errore nel parsing dei dati JSON:", parseError);
      console.error("Edge function: Testo ricevuto:", rawText);
      return { 
        userData: null, 
        error: 'Dati utente non validi: formato JSON non corretto' 
      };
    }
    
    // Validate required fields
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      console.error("Edge function: Campi obbligatori mancanti:", userData);
      return { 
        userData: null, 
        error: 'Campi obbligatori mancanti',
        details: {
          email: userData.email ? '✓' : '✗',
          first_name: userData.first_name ? '✓' : '✗',
          last_name: userData.last_name ? '✓' : '✗',
          role: userData.role ? '✓' : '✗'
        }
      };
    }
    
    // Validate role
    const validRoles = ['admin', 'socio', 'dipendente', 'cliente'];
    if (!validRoles.includes(userData.role)) {
      console.error(`Edge function: Ruolo non valido: ${userData.role}`);
      return { 
        userData: null, 
        error: 'Ruolo non valido',
        details: { valid_roles: validRoles.join(', ') }
      };
    }
    
    console.log("Edge function: Dati utente ricevuti:", userData);
    return { userData, error: null };
  } catch (e) {
    console.error("Edge function: Errore nel leggere il corpo della richiesta:", e);
    return { 
      userData: null, 
      error: 'Errore nella lettura dei dati' 
    };
  }
}

// Create a new user
async function createNewUser(supabase: any, userData: UserData) {
  // CORREZIONE: Genera una password casuale se non fornita
  const password = userData.password || Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10).toUpperCase() + '!1';
  
  console.log("Edge function: Creazione utente con email:", userData.email);
  console.log("Edge function: Password generata:", userData.password ? "Fornita dall'utente" : "Generata automaticamente");
  
  // Verifica che l'azienda esista se è stato fornito un azienda_id
  if (userData.azienda_id) {
    const { data: azienda, error: aziendaError } = await supabase
      .from('aziende')
      .select('id')
      .eq('id', userData.azienda_id)
      .single();
    
    if (aziendaError || !azienda) {
      console.error("Edge function: Errore nella verifica dell'azienda:", aziendaError);
      return { user: null, error: "L'azienda specificata non esiste" };
    }
    
    console.log("Edge function: Azienda verificata:", userData.azienda_id);
  }

  const { data: authData, error: createError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: password,
    email_confirm: true,
    user_metadata: {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      azienda_id: userData.azienda_id,
    },
  });

  if (createError) {
    console.error('Edge function: Errore nella creazione dell\'utente:', createError);
    return { user: null, error: createError.message };
  }

  console.log("Edge function: Utente creato con successo:", authData.user.id);
  return { user: authData.user, error: null };
}

// Check if profile exists and update or create as needed
async function handleUserProfile(supabase: any, userId: string, userData: UserData) {
  // Prepare profile data
  const profileData = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    role: userData.role,
    azienda_id: userData.azienda_id
  };

  // Check if profile exists
  const { data: existingProfile, error: profileCheckError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileCheckError) {
    console.log("Edge function: Profilo non trovato, creazione manuale necessaria");
    
    // Create new profile
    const { data: newProfile, error: createProfileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        ...profileData
      })
      .select();
      
    if (createProfileError) {
      console.error('Edge function: Errore nella creazione manuale del profilo:', createProfileError);
      return { profile: null, error: createProfileError.message };
    }
    
    console.log("Edge function: Nuovo profilo creato:", newProfile);
    return { profile: newProfile, error: null };
  } else {
    console.log("Edge function: Profilo esistente trovato:", existingProfile);
    
    // Update existing profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select();
      
    if (updateError) {
      console.error('Edge function: Errore nell\'aggiornamento del profilo:', updateError);
      return { profile: null, error: updateError.message };
    }
    
    console.log("Edge function: Profilo aggiornato:", updatedProfile);
    return { profile: updatedProfile, error: null };
  }
}

// Main handler function
serve(async (req) => {
  console.log("Edge function: create-user chiamata");
  
  // Handle CORS preflight request
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Initialize Supabase client
    const { supabase, error: initError } = initializeSupabase();
    if (initError) {
      return new Response(
        JSON.stringify({ message: initError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify authentication
    const { caller, error: authError } = await verifyAuthentication(
      supabase, 
      req.headers.get('Authorization')
    );
    
    if (authError) {
      return new Response(
        JSON.stringify({ message: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user role permissions
    const { hasPermission, error: roleError } = await verifyUserRole(supabase, caller.id);
    
    if (!hasPermission) {
      return new Response(
        JSON.stringify({ message: roleError }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { userData, error: parseError, details } = await parseRequestBody(req);
    
    if (parseError) {
      return new Response(
        JSON.stringify({ message: parseError, details }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create user
    const { user, error: createError } = await createNewUser(supabase, userData!);
    
    if (createError) {
      return new Response(
        JSON.stringify({ message: `Errore nella creazione dell'utente: ${createError}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Handle user profile
    const { profile, error: profileError } = await handleUserProfile(supabase, user.id, userData!);
    
    if (profileError) {
      console.error('Edge function: Errore nella gestione del profilo, ma utente creato:', profileError);
      // Continue despite profile error, since user is created
    }
    
    // Prepare response data
    const responseData = {
      user: {
        id: user.id,
        first_name: userData!.first_name,
        last_name: userData!.last_name,
        role: userData!.role,
        azienda_id: userData!.azienda_id
      }
    };
    
    console.log("Edge function: Dati di risposta:", responseData);
    
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Edge function: Errore imprevisto:', error);
    return new Response(
      JSON.stringify({ message: `Errore imprevisto: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
