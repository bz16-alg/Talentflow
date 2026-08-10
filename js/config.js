const CONFIG = {
  APP_NAME: 'TalentFlow',
  APP_URL: 'https://bz16-alg.github.io/Talentflow/',
  SUPABASE_URL: 'https://aaytjrtkrdmqairnrevi.supabase.co',
  SUPABASE_ANON_KEY: 'VOTRE-CLE-ANON', // à remplacer par la clé "anon public"
  DEFAULT_LANG: 'fr',
  EDGE_FUNCTION_BASE: 'https://aaytjrtkrdmqairnrevi.supabase.co/functions/v1',
  EDGE_FUNCTIONS: { aiScreening: 'ai-screening', sendEmail: 'send-email', generatePdf: 'generate-pdf', candidateResponse: 'candidate-response' },
  PLATFORMS: {
    emploitic: { name: 'EmploiTic', url: 'https://www.emploitic.com', color: '#2563eb' },
    emploipartner: { name: 'EmploiPartner', url: 'https://www.emploipartner.com', color: '#16a34a' },
    talentdz: { name: 'IT TalentDZ', url: 'https://ittalents.dz', color: '#d97706' },
    ouedknis: { name: 'Ouedkniss', url: 'https://www.ouedkniss.com', color: '#dc2626' },
    linkedin: { name: 'LinkedIn', url: 'https://www.linkedin.com', color: '#0284c7' },
    email: { name: 'Email', url: '', color: '#64748b' }
  },
  CLUSTERS: { A: { min: 80, label: 'Fortement recommandé' }, B: { min: 60, label: 'À considérer' }, C: { min: 0, label: 'Non retenu' } }
};
function buildTrackedLink(offerId, platform) {
  return CONFIG.APP_URL + '/apply.html?job=' + encodeURIComponent(offerId) + '&utm_source=' + encodeURIComponent(platform) + '&utm_medium=recruitment&utm_campaign=job_' + encodeURIComponent(offerId);
}
