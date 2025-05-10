
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
    // Verifica dell'autenticazione
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ message: 'Autorizzazione mancante' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Crea un client Supabase con il service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Estrai il token JWT
    const token = authHeader.replace('Bearer ', '');
    
    // Verifica l'utente corrente
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !caller) {
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
    
    if (profileError || !['admin', 'socio'].includes(callerProfile?.role)) {
      return new Response(
        JSON.stringify({ message: 'Permessi insufficienti' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Ottieni i dati dell'utente da creare
    const userData: UserData = await req.json();
    console.log("Creazione utente con dati:", userData);
    
    // Crea l'utente con admin.createUser
    const { data: authData, error: createError } = await supabase.auth.admin.createUser({
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

    if (createError) {
      console.error('Errore nella creazione dell\'utente:', createError);
      return new Response(
        JSON.stringify({ message: `Errore nella creazione dell'utente: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verifica se il profilo è stato automaticamente creato dal trigger
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

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
        console.error('Errore nell\'aggiornamento del profilo:', updateError);
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
        console.error('Errore nella creazione manuale del profilo:', createProfileError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        user: {
          id: authData.user.id,
          ...profileUpdateData
        } 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Errore imprevisto:', error);
    return new Response(
      JSON.stringify({ message: `Errore imprevisto: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
