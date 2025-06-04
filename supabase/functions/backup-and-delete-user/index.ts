
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[backup-and-delete-user] Starting function');
    
    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('[backup-and-delete-user] No authorization header');
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    
    // Create a client with anon key to verify the user token
    const supabaseAnon = createClient(
      supabaseUrl, 
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify user token
    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(token);

    if (authError || !user) {
      console.log('[backup-and-delete-user] Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.log('[backup-and-delete-user] User is not admin:', profile?.role);
      return new Response(JSON.stringify({ error: 'Accesso negato. Solo gli admin possono eliminare utenti.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const { userId }: DeleteUserRequest = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId richiesto' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[backup-and-delete-user] Starting backup for user:', userId);

    // Start transaction-like approach by collecting all data first
    const backupData: any = {
      user_data: null,
      servizi_data: [],
      stipendi_data: [],
      spese_data: [],
      turni_data: [],
      altri_dati: {}
    };

    // 1. Get user profile data
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.log('[backup-and-delete-user] Error fetching user data:', userError);
      return new Response(JSON.stringify({ error: 'Utente non trovato' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    backupData.user_data = userData;

    // 2. Get servizi data
    const { data: serviziData } = await supabase
      .from('servizi')
      .select('*')
      .eq('assegnato_a', userId);
    
    if (serviziData) {
      backupData.servizi_data = serviziData;
    }

    // 3. Get stipendi data
    const { data: stipendiData } = await supabase
      .from('stipendi')
      .select('*')
      .eq('user_id', userId);
    
    if (stipendiData) {
      backupData.stipendi_data = stipendiData;
    }

    // 4. Get spese dipendenti data
    const { data: speseData } = await supabase
      .from('spese_dipendenti')
      .select('*')
      .eq('user_id', userId);
    
    if (speseData) {
      backupData.spese_data = speseData;
    }

    // 5. Get shifts data
    const { data: shiftsData } = await supabase
      .from('shifts')
      .select('*')
      .eq('user_id', userId);
    
    if (shiftsData) {
      backupData.turni_data = shiftsData;
    }

    // 6. Get other related data
    const { data: movimentiData } = await supabase
      .from('movimenti_aziendali')
      .select('*')
      .eq('effettuato_da_id', userId);

    const { data: speseAziendaliData } = await supabase
      .from('spese_aziendali')
      .select('*')
      .eq('socio_id', userId);

    backupData.altri_dati = {
      movimenti_aziendali: movimentiData || [],
      spese_aziendali: speseAziendaliData || []
    };

    console.log('[backup-and-delete-user] Data collected, creating backup record');

    // Create backup record
    const { data: backupRecord, error: backupError } = await supabase
      .from('user_deletion_backup')
      .insert({
        deleted_user_id: userId,
        deleted_by: user.id,
        user_data: backupData.user_data,
        servizi_data: backupData.servizi_data,
        stipendi_data: backupData.stipendi_data,
        spese_data: backupData.spese_data,
        turni_data: backupData.turni_data,
        altri_dati: backupData.altri_dati
      })
      .select()
      .single();

    if (backupError) {
      console.log('[backup-and-delete-user] Error creating backup:', backupError);
      return new Response(JSON.stringify({ error: 'Errore durante la creazione del backup' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[backup-and-delete-user] Backup created, proceeding with deletion');

    // Now proceed with deletion - order matters for foreign key constraints
    
    // Delete shifts
    await supabase.from('shifts').delete().eq('user_id', userId);
    
    // Delete spese_dipendenti
    await supabase.from('spese_dipendenti').delete().eq('user_id', userId);
    
    // Delete stipendi
    await supabase.from('stipendi').delete().eq('user_id', userId);
    
    // Update servizi to remove assignment
    await supabase
      .from('servizi')
      .update({ assegnato_a: null })
      .eq('assegnato_a', userId);
    
    // Update other tables that reference the user
    await supabase
      .from('movimenti_aziendali')
      .update({ effettuato_da_id: null })
      .eq('effettuato_da_id', userId);
    
    await supabase
      .from('spese_aziendali')
      .update({ socio_id: null })
      .eq('socio_id', userId);

    // Finally delete the user profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.log('[backup-and-delete-user] Error deleting user profile:', deleteError);
      return new Response(JSON.stringify({ error: 'Errore durante l\'eliminazione dell\'utente' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('[backup-and-delete-user] User deleted successfully');

    // Return summary
    const summary = {
      success: true,
      backup_id: backupRecord.id,
      deleted_user: userData.first_name + ' ' + userData.last_name,
      summary: {
        servizi: backupData.servizi_data.length,
        stipendi: backupData.stipendi_data.length,
        spese: backupData.spese_data.length,
        turni: backupData.turni_data.length,
        movimenti: backupData.altri_dati.movimenti_aziendali.length,
        spese_aziendali: backupData.altri_dati.spese_aziendali.length
      }
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[backup-and-delete-user] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Errore interno del server' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
