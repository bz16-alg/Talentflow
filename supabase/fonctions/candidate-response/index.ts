import { createClient } from 'npm:@supabase/supabase-js@2';
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

const DEFAULT_ITEMS = [
  { label: 'Création du compte email entreprise', done: false, date: null, validator: null },
  { label: 'Attribution du poste de travail', done: false, date: null, validator: null },
  { label: 'Inscription mutuelle / sécurité sociale', done: false, date: null, validator: null },
  { label: 'Remise des documents d\'embauche', done: false, date: null, validator: null },
  { label: 'Présentation à l\'équipe', done: false, date: null, validator: null },
  { label: 'Formation au poste', done: false, date: null, validator: null },
  { label: 'Signature du procès-verbal d\'installation', done: false, date: null, validator: null },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, serviceKey);

    const { letter_id, response, payload } = await req.json();
    if (!letter_id) {
      return corsResponse({ error: 'Paramètre letter_id manquant.' }, 400);
    }
    if (!['accepted', 'refused', 'negotiating'].includes(response)) {
      return corsResponse({ error: 'Paramètre response invalide (accepted | refused | negotiating).' }, 400);
    }

    const { data: letter, error: letterError } = await supabase
      .from('job_offer_letters')
      .select('id, application_id')
      .eq('id', letter_id)
      .single();
    if (letterError || !letter) {
      return corsResponse({ error: 'Lettre d\'offre introuvable.' }, 404);
    }

    const { error: updateError } = await supabase
      .from('job_offer_letters')
      .update({ candidate_response: response, candidate_response_date: new Date().toISOString() })
      .eq('id', letter_id);
    if (updateError) {
      throw new Error(`Mise à jour de la lettre impossible : ${updateError.message}`);
    }

    let status = 'updated';

    if (response === 'accepted') {
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('id, candidate_id, job_offer_id')
        .eq('id', letter.application_id)
        .single();
      if (appError || !application) {
        throw new Error('Candidature associée introuvable.');
      }

      const { error: appUpdateError } = await supabase
        .from('applications')
        .update({ status: 'hired' })
        .eq('id', application.id);
      if (appUpdateError) {
        throw new Error(`Mise à jour de la candidature impossible : ${appUpdateError.message}`);
      }

      const { error: checklistError } = await supabase
        .from('onboarding_checklist')
        .insert({
          application_id: application.id,
          items: DEFAULT_ITEMS,
          pv_signed: false,
          status: 'in_progress',
        });
      if (checklistError) {
        throw new Error(`Création de la checklist impossible : ${checklistError.message}`);
      }

      status = 'hired';
    }

    return corsResponse({ success: true, status });
  } catch (err) {
    return corsResponse({ error: `Échec du traitement de la réponse : ${err.message}` }, 500);
  }
});
