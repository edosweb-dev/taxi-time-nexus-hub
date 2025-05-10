
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { corsHeaders } from "./constants.ts";
import { handleCorsPreflightRequest } from "./cors.ts";
import { initializeSupabase } from "./supabase-client.ts";
import { verifyAuthentication, verifyUserRole } from "./auth.ts";
import { parseRequestBody } from "./request-parser.ts";
import { createNewUser, handleUserProfile } from "./user-management.ts";

// Main handler function
serve(async (req) => {
  console.log("Edge function: create-user chiamata");
  console.log("Edge function: Request method:", req.method);
  console.log("Edge function: Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight request
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) return corsResponse;
  
  try {
    // Initialize Supabase client
    const { supabase, error: initError } = initializeSupabase();
    if (initError) {
      console.error("Edge function: Errore inizializzazione supabase:", initError);
      return new Response(
        JSON.stringify({ message: initError, error: initError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify authentication
    const { caller, error: authError } = await verifyAuthentication(
      supabase, 
      req.headers.get('Authorization')
    );
    
    if (authError) {
      console.error("Edge function: Errore autenticazione:", authError);
      return new Response(
        JSON.stringify({ message: authError, error: authError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user role permissions
    const { hasPermission, error: roleError } = await verifyUserRole(supabase, caller.id);
    
    if (!hasPermission) {
      console.error("Edge function: Errore permessi:", roleError);
      return new Response(
        JSON.stringify({ message: roleError, error: roleError }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Parse request body
    const { userData, error: parseError, details } = await parseRequestBody(req);
    
    if (parseError) {
      console.error("Edge function: Errore parsing richiesta:", parseError);
      console.error("Edge function: Dettagli errore:", details);
      return new Response(
        JSON.stringify({ message: parseError, error: parseError, details }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log dei dati ricevuti dopo il parsing
    console.log("Edge function: Dati utente dopo parsing:", JSON.stringify(userData, null, 2));
    
    // Validazione esplicita per utenti cliente
    if (userData?.role === 'cliente') {
      if (!userData.azienda_id) {
        const errorMsg = "Azienda ID mancante per utente cliente";
        console.error(`Edge function: ${errorMsg}`);
        return new Response(
          JSON.stringify({ message: errorMsg, error: errorMsg }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Verifica che l'azienda esista
      const { data: azienda, error: aziendaError } = await supabase
        .from('aziende')
        .select('id')
        .eq('id', userData.azienda_id)
        .single();
      
      if (aziendaError || !azienda) {
        const errorMsg = `Azienda con ID ${userData.azienda_id} non trovata`;
        console.error(`Edge function: ${errorMsg}`);
        return new Response(
          JSON.stringify({ message: errorMsg, error: errorMsg }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      console.log(`Edge function: Azienda verificata con ID: ${userData.azienda_id}`);
    }
    
    // Create user
    const { user, error: createError } = await createNewUser(supabase, userData!);
    
    if (createError) {
      console.error("Edge function: Errore creazione utente:", createError);
      return new Response(
        JSON.stringify({ message: `Errore nella creazione dell'utente: ${createError}`, error: createError }),
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
        status: 201, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Edge function: Errore imprevisto:', error);
    // Assicura che venga sempre restituita una risposta JSON anche in caso di errore
    let errorMessage = 'Errore imprevisto nel server';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Edge function: Stack trace:', error.stack);
    }
    
    return new Response(
      JSON.stringify({ message: errorMessage, error: errorMessage, stack: error instanceof Error ? error.stack : undefined }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
