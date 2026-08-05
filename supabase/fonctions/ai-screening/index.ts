import { createClient } from 'npm:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { inflate } from 'https://esm.sh/pako@2.1.0';

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

function extractPdfText(bytes) {
  try {
    const text = new TextDecoder().decode(bytes);
    let extracted = '';
    const streams = text.match(/stream\r?\n([\s\S]*?)endstream/g) || [];
    for (const stream of streams) {
      const data = stream.replace(/^stream\r?\n/, '').replace(/endstream$/, '');
      let inflated;
      try {
        inflated = inflate(new Uint8Array(data.split('').map((c) => c.charCodeAt(0))));
      } catch {
        continue;
      }
      const inflatedText = new TextDecoder().decode(inflated);
      const bts = inflatedText.match(/BT[\s\S]*?ET/g) || [];
      for (const bt of bts) {
        const tokens = bt
          .replace(/\[(.*?)\]\s*TJ/g, '$1')
          .replace(/\((.*?)\)\s*Tj/g, '$1 ')
          .replace(/\(/g, '')
          .replace(/\)/g, '')
          .replace(/[A-Za-z0-9.]+\s/g, ' ')
          .trim();
        extracted += tokens + '\n';
      }
    }
    return extracted.replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

async function analyzeWithOpenAI(job, candidate, cvText) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) throw new Error('Clé API OpenAI (OPENAI_API_KEY) manquante.');
  const payload = {
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'Tu es un assistant de recrutement expert. Analyse l\'adéquation entre un profil candidat et une offre d\'emploi. Réponds UNIQUEMENT en JSON valide, en français.',
      },
      {
        role: 'user',
        content: `Analyse la candidature suivante et renvoie un JSON strictement au format suivant :
{
  "score": nombre entier entre 0 et 100,
  "summary": "résumé de 3 lignes en français",
  "strengths": ["force 1", "force 2", "force 3"],
  "weaknesses": ["faiblesse 1", "faiblesse 2", "faiblesse 3"],
  "cluster": "A" | "B" | "C",
  "recommended": true ou false,
  "recommendation": "phrase de recommandation en français"
}
Règles : cluster A = score >= 80, B = score 60-79, C = score < 60. recommended = true si le score >= 80.

=== OFFRE D'EMPLOI ===
Titre : ${job.title}
Description : ${job.description || ''}
Exigences : ${job.requirements || ''}
Compétences : ${Array.isArray(job.skills) ? job.skills.join(', ') : ''}
Niveau d'expérience : ${job.experience_level || ''}

=== CANDIDAT ===
Nom : ${candidate.full_name}
Email : ${candidate.email}
Lettre de motivation : ${candidate.cover_letter || ''}
Contenu du CV : ${cvText || '(non disponible)'}`,
      },
    ],
  };
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erreur OpenAI (${response.status}) : ${err}`);
  }
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, serviceKey);

    const { job_offer_id } = await req.json();
    if (!job_offer_id) {
      return corsResponse({ error: 'Paramètre job_offer_id manquant.' }, 400);
    }

    const { data: job, error: jobError } = await supabase
      .from('job_offers')
      .select('id, title, description, requirements, skills, experience_level')
      .eq('id', job_offer_id)
      .single();
    if (jobError || !job) {
      return corsResponse({ error: 'Offre d\'emploi introuvable.' }, 404);
    }

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, candidate_id, match_score, status, candidates(full_name, email, cv_url, cover_letter)')
      .eq('job_offer_id', job_offer_id);
    if (appsError) {
      throw new Error(`Erreur lors du chargement des candidatures : ${appsError.message}`);
    }

    const results = [];
    const errors = [];

    for (const application of applications || []) {
      try {
        const candidate = application.candidates || {};
        let cvText = '';
        if (candidate.cv_url && candidate.cv_url.startsWith('cvs/')) {
          try {
            const { data: cvBytes, error: cvError } = await supabase
              .storage
              .from('cvs')
              .download(candidate.cv_url);
            if (!cvError && cvBytes) {
              cvText = extractPdfText(await cvBytes.arrayBuffer());
            }
          } catch {
            cvText = '';
          }
        }

        const analysis = await analyzeWithOpenAI(job, candidate, cvText);

        const score = Math.max(0, Math.min(100, Number(analysis.score) || 0));
        const cluster = ['A', 'B', 'C'].includes(analysis.cluster) ? analysis.cluster : score >= 80 ? 'A' : score >= 60 ? 'B' : 'C';

        const { error: updateError } = await supabase
          .from('applications')
          .update({
            match_score: score,
            ai_summary: analysis.summary || null,
            ai_cluster: cluster,
            status: 'screened',
          })
          .eq('id', application.id);
        if (updateError) throw new Error(`Mise à jour impossible : ${updateError.message}`);

        results.push({
          application_id: application.id,
          candidate: candidate.full_name,
          score,
          cluster,
          recommended: Boolean(analysis.recommended),
          recommendation: analysis.recommendation || null,
        });
      } catch (err) {
        errors.push({ application_id: application.id, error: err.message });
      }
    }

    return corsResponse({
      processed: results.length,
      results,
      errors,
    });
  } catch (err) {
    return corsResponse({ error: `Échec du pré-triage IA : ${err.message}` }, 500);
  }
});
