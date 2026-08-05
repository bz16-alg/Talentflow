import { createClient } from 'npm:@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

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

async function buildPdf(template, data) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({
    x: 40,
    y: 40,
    width: 515.28,
    height: 761.89,
    borderColor: rgb(0.1, 0.3, 0.55),
    borderWidth: 2,
  });

  page.drawText('TechDZ Algérie - TalentFlow', {
    x: 70,
    y: 780,
    size: 14,
    font: bold,
    color: rgb(0.1, 0.3, 0.55),
  });
  page.drawText(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, {
    x: 70,
    y: 760,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const title = template === 'pv' ? "PROCÈS-VERBAL D'INSTALLATION" : "OFFRE D'EMPLOI";
  page.drawText(title, {
    x: 70,
    y: 710,
    size: 20,
    font: bold,
    color: rgb(0.1, 0.1, 0.1),
  });

  const fields = [
    ['Candidat', data.candidate || '-'],
    ['Poste', data.job_title || '-'],
    ['Département', data.department || '-'],
    ['Manager / Interlocuteur', data.manager || '-'],
    ['Salaire proposé', data.salary || '-'],
    ['Date de début', data.start_date || '-'],
    ['Conditions', data.conditions || '-'],
  ];
  if (template === 'pv') {
    fields.push(['Règlement intérieur', data.regulations || '-']);
  }

  let y = 665;
  for (const [label, value] of fields) {
    page.drawText(label, {
      x: 70,
      y,
      size: 11,
      font: bold,
      color: rgb(0.1, 0.3, 0.55),
    });
    page.drawText(String(value), {
      x: 250,
      y,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    page.drawLine({
      start: { x: 70, y: y - 6 },
      end: { x: 525, y: y - 6 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 28;
  }

  page.drawText('Signatures :', { x: 70, y: 220, size: 12, font: bold });
  page.drawText('Candidat', { x: 100, y: 190, size: 11, font });
  page.drawLine({ start: { x: 100, y: 182 }, end: { x: 260, y: 182 }, thickness: 1, color: rgb(0.2, 0.2, 0.2) });
  page.drawText('Représentant de la société', { x: 330, y: 190, size: 11, font });
  page.drawLine({ start: { x: 330, y: 182 }, end: { x: 490, y: 182 }, thickness: 1, color: rgb(0.2, 0.2, 0.2) });

  page.drawText(`Généré par TalentFlow le ${new Date().toLocaleDateString('fr-FR')}`, {
    x: 70,
    y: 60,
    size: 9,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  return pdf.save();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl, serviceKey);

    const { template, data } = await req.json();
    if (!template || !['offer_letter', 'pv'].includes(template)) {
      return corsResponse({ error: 'Paramètre template manquant ou invalide (offer_letter | pv).' }, 400);
    }
    if (!data) {
      return corsResponse({ error: 'Paramètre data manquant.' }, 400);
    }

    const pdfBytes = await buildPdf(template, data);
    const fileName =
      template === 'offer_letter'
        ? `offer-letters/${(data.candidate || 'candidat').toString().replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase()}-${Date.now()}.pdf`
        : `pv/${Date.now()}.pdf`;
    const bucket = template === 'offer_letter' ? 'documents' : 'pv';

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });
    if (uploadError) {
      throw new Error(`Erreur d\'upload du PDF : ${uploadError.message}`);
    }

    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return corsResponse({ url: publicUrl.publicUrl });
  } catch (err) {
    return corsResponse({ error: `Échec de la génération du PDF : ${err.message}` }, 500);
  }
});
