import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase environment variables missing');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to verify admin
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract JWT token
    const token = authorization.replace('Bearer ', '');
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || adminProfile?.role !== 'admin') {
      console.error('Admin check failed:', profileError);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { targetUserId } = await req.json();
    
    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get target user profile
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetProfile) {
      console.error('Target user not found:', targetError);
      return new Response(
        JSON.stringify({ error: 'Target user not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user agent and IP for logging
    const userAgent = req.headers.get('User-Agent') || '';
    const xForwardedFor = req.headers.get('X-Forwarded-For');
    const ipAddress = xForwardedFor ? xForwardedFor.split(',')[0].trim() : 'unknown';

    // Log the impersonation
    const { error: logError } = await supabase
      .from('admin_impersonation_log')
      .insert({
        admin_user_id: user.id,
        target_user_id: targetUserId,
        ip_address: ipAddress,
        user_agent: userAgent
      });

    if (logError) {
      console.error('Failed to log impersonation:', logError);
    }

    // Create impersonation session data
    const impersonationData = {
      isImpersonating: true,
      originalAdminId: user.id,
      targetUser: {
        id: targetProfile.id,
        email: targetProfile.email,
        role: targetProfile.role,
        first_name: targetProfile.first_name,
        last_name: targetProfile.last_name,
        azienda_id: targetProfile.azienda_id,
        telefono: targetProfile.telefono
      },
      impersonationStartTime: new Date().toISOString()
    };

    console.log('Impersonation started:', {
      admin: user.id,
      target: targetUserId,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        impersonationData,
        message: `Impersonation started for user: ${targetProfile.first_name} ${targetProfile.last_name}` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in impersonate-user function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});