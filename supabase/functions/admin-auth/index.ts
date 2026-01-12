import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'login' && req.method === 'POST') {
      const { username, password } = await req.json();

      const { data: credentials, error: credError } = await supabase
        .from('admin_credentials')
        .select('username, password_hash')
        .eq('username', username)
        .single();

      if (credError || !credentials || credentials.password_hash !== password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8);

      const { error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          session_token: sessionToken,
          admin_username: username,
          expires_at: expiresAt.toISOString(),
        });

      if (sessionError) {
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create session' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken,
          expiresAt: expiresAt.toISOString(),
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'validate' && req.method === 'POST') {
      const { sessionToken } = await req.json();

      const { data: session, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !session) {
        return new Response(
          JSON.stringify({ valid: false }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({ valid: true, username: session.admin_username }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'logout' && req.method === 'POST') {
      const { sessionToken } = await req.json();

      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
