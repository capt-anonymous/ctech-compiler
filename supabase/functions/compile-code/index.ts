import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

 // Bypass auth locally
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    // For local testing, you can comment out the return line
    // return new Response(JSON.stringify({ error: "Unauthorized Request" }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const { code, language } = await req.json();
    //placed here
      const supportedVersions: Record<string, string> = {
      python: "3",
      java: "4",
      c: "5",
      cpp: "5",
      javascript: "3"
    };
    const versionIndex = supportedVersions[language.toLowerCase()];

if (!versionIndex) {
  return new Response(
    JSON.stringify({ error: `Language ${language} not supported` }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

    // Call external compiler API (JDoodle)
    const response = await fetch('https://api.jdoodle.com/v1/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: Deno.env.get('JDOODLE_CLIENT_ID'),
        clientSecret: Deno.env.get('JDOODLE_CLIENT_SECRET'),
        script: code,
        language: language,
        versionIndex: versionIndex
      })
    });

    const result = await response.json();

    return new Response(
      JSON.stringify({ output: result.output, error: result.error }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
