const AI = {
  _text(key, fallback) {
    return typeof t === 'function' ? (t(key) || fallback) : fallback;
  },

  _fill(text, data) {
    return (text || '')
      .replace(/\{candidate\}/g, data.candidate ?? '')
      .replace(/\{job\}/g, data.job ?? '')
      .replace(/\{company\}/g, data.company ?? '')
      .replace(/\{date\}/g, data.date ?? '')
      .replace(/\{time\}/g, data.time ?? '')
      .replace(/\{link\}/g, data.link ?? '');
  },

  _defaults: {
    reject: {
      subject: 'Mise à jour de votre candidature',
      body: "Bonjour {candidate},\n\nNous vous remercions de l'intérêt que vous avez porté à l'offre \"{job}\" au sein de {company}.\nAprès étude de votre dossier, nous vous informons que nous ne pouvons pas donner suite à votre candidature.\n\nNous vous souhaitons une excellente continuation dans vos recherches.\n\nCordialement,\nL'équipe {company}",
    },
    invite: {
      subject: 'Invitation à un entretien',
      body: "Bonjour {candidate},\n\nNous avons le plaisir de vous inviter à un entretien pour le poste \"{job}\" au sein de {company}.\nRendez-vous le {date} à {time}.\n\nLieu : {link}\n\nMerci de confirmer votre présence.\n\nCordialement,\nL'équipe {company}",
    },
    offer: {
      subject: "Offre d'emploi",
      body: "Bonjour {candidate},\n\nFélicitations ! Votre candidature pour le poste \"{job}\" au sein de {company} a été retenue.\nVous trouverez ci-joint votre offre d'embauche.\n\nNous vous remercions de votre confiance et avons hâte de vous accueillir.\n\nCordialement,\nL'équipe {company}",
    },
    confirm: {
      subject: 'Confirmation de votre candidature',
      body: "Bonjour {candidate},\n\nNous confirmons la réception de votre candidature pour le poste \"{job}\" au sein de {company}.\nVotre dossier est en cours d'examen, nous vous tiendrons informé(e) très prochainement.\n\nCordialement,\nL'équipe {company}",
    },
  },

  async callEdgeFunction(name, body) {
    const { data } = await Auth.supabase.auth.getSession();
    const token = data?.session?.access_token || '';
    let res;
    try {
      res = await fetch(CONFIG.EDGE_FUNCTION_BASE + '/' + name, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token,
          apikey: CONFIG.SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      throw new TypeError('Impossible de joindre la fonction Edge.');
    }
    let parsed = {};
    try {
      parsed = await res.json();
    } catch (e) {}
    if (!res.ok) {
      throw new Error((parsed && (parsed.error || parsed.message)) || "Erreur lors de l'appel de la fonction.");
    }
    return parsed;
  },

  async screenOffer(jobOfferId) {
    try {
      const result = await this.callEdgeFunction(CONFIG.EDGE_FUNCTIONS.aiScreening, { job_offer_id: jobOfferId });
      return {
        processed: typeof result.processed === 'number' ? result.processed : (Array.isArray(result.results) ? result.results.length : 0),
        results: result.results || [],
        errors: result.errors || [],
      };
    } catch (e) {
      if (e instanceof TypeError) {
        throw new Error('La fonction Edge "ai-screening" n\'est pas déployée ou injoignable. Vérifiez le déploiement.');
      }
      throw e;
    }
  },

  emailContent(template, data = {}) {
    const templates = {
      reject: ['email.rejectSubject', 'email.rejectBody'],
      invite: ['email.inviteSubject', 'email.inviteBody'],
      offer: ['email.offerSubject', 'email.offerBody'],
      confirm: ['email.confirmSubject', 'email.confirmBody'],
    };
    const keys = templates[template];
    if (!keys) throw new Error("Template d'email inconnu : " + template);
    const defaults = this._defaults[template];
    return {
      subject: this._fill(this._text(keys[0], defaults.subject), data),
      body: this._fill(this._text(keys[1], defaults.body), data),
    };
  },

  async sendEmail(to, subject, html) {
    return this.callEdgeFunction('sendEmail', { to, subject, html: (html || '').replace(/\n/g, '<br>') });
  },

  async generatePdf(template, data) {
    const result = await this.callEdgeFunction('generatePdf', { template, data });
    if (!result || !result.url) throw new Error("Erreur lors de la génération du PDF.");
    return result;
  },

  async candidateResponse(letterId, response, payload) {
    return this.callEdgeFunction('candidateResponse', { letter_id: letterId, response, payload });
  },

  analyseCvLocal(text, jobOffer = {}) {
    const lower = (text || '').toLowerCase();
    let skills = [];
    if (Array.isArray(jobOffer.skills)) {
      skills = jobOffer.skills;
    } else if (typeof jobOffer.skills === 'string') {
      skills = jobOffer.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    const found = skills.filter(s => s && lower.includes(String(s).toLowerCase()));
    const score = skills.length ? Math.min(100, Math.round((found.length / skills.length) * 100)) : 0;
    let cluster = null;
    const clusters = Array.isArray(CONFIG.CLUSTERS) ? CONFIG.CLUSTERS : [];
    for (const c of clusters) {
      if (typeof c === 'string') {
        if (lower.includes(c.toLowerCase())) { cluster = c; break; }
      } else if (c && (Array.isArray(c.keywords) || Array.isArray(c.skills))) {
        const words = c.keywords || c.skills || [];
        if (words.some(w => lower.includes(String(w).toLowerCase()))) { cluster = c.name || c.id || null; break; }
      }
    }
    const summary = 'Profil analysé : ' + found.length + '/' + skills.length + ' compétences requises détectées (' + score + '%).' + (cluster ? ' Orientation suggérée : ' + cluster + '.' : '');
    return { score, summary, cluster };
  },

  async upsertCv(candidateId, file) {
    const path = 'cv-' + candidateId + '-' + Date.now() + '-' + file.name;
    const url = await DB.uploadFile('cvs', file, path);
    await DB.updateCandidate(candidateId, { cv_url: url });
    return url;
  },
};
