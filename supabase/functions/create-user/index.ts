
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

serve(async (req) => {
  // Gestione delle richieste CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Edge function: create-user chiamata");
    
    // Verifica dell'autenticazione
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Edge function: Autorizzazione mancante");
      return new Response(
        JSON.stringify({ message: 'Autorizzazione mancante' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Crea un client Supabase con il service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseKey) {
      console.error("Edge function: Variabili d'ambiente mancanti");
      console.error("Edge function: SUPABASE_URL:", supabaseUrl ? "presente" : "mancante");
      console.error("Edge function: SUPABASE_SERVICE_ROLE_KEY:", supabaseKey ? "presente" : "mancante (lunghezza 0)");
      return new Response(
        JSON.stringify({ message: 'Configurazione del server incompleta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Edge function: Supabase URL disponibile:", !!supabaseUrl);
    console.log("Edge function: Supabase Key disponibile:", !!supabaseKey);
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Estrai il token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Verifica l'utente corrente
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !caller) {
      console.error("Edge function: Utente non autorizzato", authError);
      return new Response(
        JSON.stringify({ message: 'Utente non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verifica che l'utente chiamante abbia il ruolo di admin o socio
    const { data: callerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();
    
    if (profileError) {
      console.error("Edge function: Errore nel recupero del profilo", profileError);
    }
    
    console.log("Edge function: Profilo del chiamante:", callerProfile);
    
    if (!callerProfile || !['admin', 'socio'].includes(callerProfile?.role)) {
      console.error("Edge function: Permessi insufficienti, ruolo:", callerProfile?.role);
      return new Response(
        JSON.stringify({ message: 'Permessi insufficienti' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Ottieni i dati dell'utente da creare
    let userData: UserData;
    try {
      userData = await req.json();
      console.log("Edge function: Dati utente ricevuti:", userData);
    } catch (e) {
      console.error("Edge function: Errore nel parsing dei dati JSON:", e);
      return new Response(
        JSON.stringify({ message: 'Dati utente non validi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Crea l'utente con admin.createUser
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password || Math.random().toString(36).substring(2, 10),
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
      return new Response(
        JSON.stringify({ message: `Errore nella creazione dell'utente: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Edge function: Utente creato con successo:", authData.user.id);

    // Verifica se il profilo è stato automaticamente creato dal trigger
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileCheckError) {
      console.log("Edge function: Profilo non trovato, creazione manuale necessaria");
    } else {
      console.log("Edge function: Profilo esistente trovato:", existingProfile);
    }

    // Prepara i dati del profilo
    const profileUpdateData = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      azienda_id: userData.azienda_id
    };

    if (existingProfile) {
      // Aggiorna il profilo esistente
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdateData)
        .eq('id', authData.user.id)
        .select();
        
      if (updateError) {
        console.error('Edge function: Errore nell\'aggiornamento del profilo:', updateError);
      } else {
        console.log("Edge function: Profilo aggiornato:", updatedProfile);
      }
    } else {
      // Crea il profilo manualmente
      const { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          ...profileUpdateData
        })
        .select();
        
      if (createProfileError) {
        console.error('Edge function: Errore nella creazione manuale del profilo:', createProfileError);
      } else {
        console.log("Edge function: Nuovo profilo creato:", newProfile);
      }
    }
    
    const responseData = {
      user: {
        id: authData.user.id,
        ...profileUpdateData
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
