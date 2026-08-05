import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!apiKey) {
      return corsResponse({ error: 'Clé API email (RESEND_API_KEY) manquante.' }, 400);
    }

    const { to, subject, html } = await req.json();
    if (!to || !subject || !html) {
      return corsResponse({ error: 'Paramètres manquants : to, subject, html sont requis.' }, 400);
    }

    const from = Deno.env.get('RESEND_FROM') ?? 'TalentFlow <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const err = await response.text();
      return corsResponse({ error: `Erreur d\'envoi de l\'email (${response.status}) : ${err}` }, 500);
    }

    const data = await response.json();
    return corsResponse({ success: true, id: data.id });
  } catch (err) {
    return corsResponse({ error: `Échec de l\'envoi de l\'email : ${err.message}` }, 500);
  }
});
