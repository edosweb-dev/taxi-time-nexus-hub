
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { SupabaseClientResult } from "./types.ts";

export function initializeSupabase(): SupabaseClientResult {
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
