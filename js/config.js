const CONFIG = {
  APP_NAME: 'TalentFlow',
  APP_URL: 'http://localhost:5500', // à remplacer par l'URL de déploiement
  SUPABASE_URL: 'https://aaytjrtkrdmqairnrevi.supabase.co', // à remplacer
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheXRqcnRrcmRtcWFpcm5yZXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3OTEyMDAsImV4cCI6MjEwMTM2NzIwMH0.reMFKn5gSj0Ki_JewXBLOYyetOZZrOZdl2CPs66htQs', // à remplacer
  DEFAULT_LANG: 'fr',
  EDGE_FUNCTION_BASE: 'https://aaytjrtkrdmqairnrevi.supabase.co/functions/v1', // à remplacer
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
