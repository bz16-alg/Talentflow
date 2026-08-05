function getErrorMessage(error) {
  const messages = {
    '23505': 'Un enregistrement avec ces informations existe déjà.',
    '23514': 'Données invalides.',
    'PGRST116': 'Aucun enregistrement trouvé.',
    '42501': "Accès refusé : vous n'avez pas les droits nécessaires.",
    '22P02': 'Identifiant invalide.',
  };
  const code = error?.code;
  if (code && messages[code]) return messages[code];
  return error?.message || 'Erreur inattendue.';
}

const DB = {
  get _client() {
    return Auth.supabase;
  },

  async _exec(query) {
    const { data, error } = await query;
    if (error) throw new Error(getErrorMessage(error));
    return data;
  },

  async getJobOffers({ status, search } = {}) {
    try {
      let data = await this._exec(
        this._client.from('job_offers')
          .select('*, profiles(full_name)')
          .order('created_at', { ascending: false })
      );
      if (search) {
        const s = String(search).toLowerCase();
        data = (data || []).filter(o =>
          [o.title, o.department, o.location, o.company, o.contract_type, Array.isArray(o.skills) ? o.skills.join(' ') : o.skills]
            .some(v => v && String(v).toLowerCase().includes(s))
        );
      }
      if (status) data = (data || []).filter(o => o.status === status);
      return data || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getJobOffer(id) {
    try {
      return await this._exec(
        this._client.from('job_offers').select('*, profiles(full_name)').eq('id', id).single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createJobOffer(data) {
    try {
      const recruiterId = Auth.getProfile()?.id;
      const payload = recruiterId ? { ...data, recruiter_id: recruiterId } : { ...data };
      return await this._exec(this._client.from('job_offers').insert(payload).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateJobOffer(id, data) {
    try {
      return await this._exec(this._client.from('job_offers').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async deleteJobOffer(id) {
    try {
      return await this._exec(this._client.from('job_offers').delete().eq('id', id));
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getCandidates({ search, source, status } = {}) {
    try {
      let data = await this._exec(
        this._client.from('candidates')
          .select('*, applications(id, job_offer_id, status, match_score, ai_cluster, created_at)')
          .order('created_at', { ascending: false })
      );
      if (search) {
        const s = String(search).toLowerCase();
        data = (data || []).filter(c =>
          [c.full_name, c.email, c.phone, c.city].some(v => v && String(v).toLowerCase().includes(s))
        );
      }
      if (source) data = (data || []).filter(c => c.source === source);
      if (status) data = (data || []).filter(c => c.status === status);
      return data || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getCandidate(id) {
    try {
      return await this._exec(
        this._client.from('candidates')
          .select('*, applications(id, job_offer_id, status, match_score, ai_cluster, ai_summary, created_at, job_offers(title))')
          .eq('id', id).single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createCandidate(data) {
    try {
      return await this._exec(this._client.from('candidates').insert(data).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateCandidate(id, data) {
    try {
      return await this._exec(this._client.from('candidates').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getApplications({ job_offer_id, cluster, status, source, search } = {}) {
    try {
      let q = this._client.from('applications')
        .select('*, candidates(full_name, email, phone, city, cv_url, cover_letter, linkedin_url, source, status), job_offers(title, department, location, contract_type, skills, recruiter_id)')
        .order('created_at', { ascending: false });
      if (job_offer_id) q = q.eq('job_offer_id', job_offer_id);
      if (cluster) q = q.eq('ai_cluster', cluster);
      if (status) q = q.eq('status', status);
      let data = await this._exec(q);
      if (source) data = (data || []).filter(a => a.source === source || a.candidates?.source === source);
      if (search) {
        const s = String(search).toLowerCase();
        data = (data || []).filter(a =>
          [a.candidates?.full_name, a.candidates?.email, a.job_offers?.title].some(v => v && String(v).toLowerCase().includes(s))
        );
      }
      return data || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getApplication(id) {
    try {
      return await this._exec(
        this._client.from('applications')
          .select('*, candidates(full_name, email, phone, city, cv_url, cover_letter, linkedin_url, source, status), job_offers(title, department, location, contract_type, skills, recruiter_id)')
          .eq('id', id).single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createApplication(data) {
    try {
      return await this._exec(this._client.from('applications').insert(data).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateApplication(id, data) {
    try {
      return await this._exec(this._client.from('applications').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getInterviews({ job_offer_id, application_id } = {}) {
    try {
      let q = this._client.from('interviews')
        .select('*, profiles(full_name), applications(candidates(full_name, email, phone, cv_url), job_offers(title))')
        .order('date', { ascending: true })
        .order('time', { ascending: true });
      if (job_offer_id) q = q.eq('job_offer_id', job_offer_id);
      if (application_id) q = q.eq('application_id', application_id);
      return (await this._exec(q)) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createInterview({ application_id, interviewer_id, date, time, location, type, status, feedback, scores }) {
    try {
      return await this._exec(
        this._client.from('interviews')
          .insert({ application_id, interviewer_id, date, time, location, type, status, feedback, scores })
          .select().single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateInterview(id, data) {
    try {
      return await this._exec(this._client.from('interviews').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async deleteInterview(id) {
    try {
      return await this._exec(this._client.from('interviews').delete().eq('id', id));
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getCompanyProfiles() {
    try {
      const me = Auth.getProfile();
      if (!me?.company) return [];
      return (await this._exec(
        this._client.from('profiles')
          .select('id, full_name, email, role, company')
          .eq('company', me.company)
          .order('full_name')
      )) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getPublications(job_offer_id) {
    try {
      let q = this._client.from('publications').select('*').order('created_at', { ascending: false });
      if (job_offer_id) q = q.eq('job_offer_id', job_offer_id);
      return (await this._exec(q)) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createPublication(data) {
    try {
      return await this._exec(this._client.from('publications').insert(data).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updatePublication(id, data) {
    try {
      return await this._exec(this._client.from('publications').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getDecisions({ application_id, job_offer_id } = {}) {
    try {
      let q = this._client.from('decisions').select('*, profiles(full_name)').order('created_at', { ascending: false });
      if (application_id) q = q.eq('application_id', application_id);
      if (job_offer_id) q = q.eq('job_offer_id', job_offer_id);
      return (await this._exec(q)) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createDecision({ application_id, decision, decided_by, comments }) {
    try {
      return await this._exec(
        this._client.from('decisions')
          .insert({ application_id, decision, decided_by: decided_by || Auth.getProfile()?.id, comments })
          .select().single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getOfferLetters({ application_id } = {}) {
    try {
      let q = this._client.from('offer_letters')
        .select('*, applications(candidates(full_name, email), job_offers(title, department))')
        .order('created_at', { ascending: false });
      if (application_id) q = q.eq('application_id', application_id);
      return (await this._exec(q)) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createOfferLetter(data) {
    try {
      return await this._exec(this._client.from('offer_letters').insert(data).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateOfferLetter(id, data) {
    try {
      return await this._exec(this._client.from('offer_letters').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getOnboardings({ job_offer_id, status } = {}) {
    try {
      let q = this._client.from('onboardings')
        .select('*, applications(candidates(full_name, email), job_offers(title))')
        .order('created_at', { ascending: false });
      if (job_offer_id) q = q.eq('job_offer_id', job_offer_id);
      if (status) q = q.eq('status', status);
      return (await this._exec(q)) || [];
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async createOnboarding(data) {
    try {
      return await this._exec(this._client.from('onboardings').insert(data).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async updateOnboarding(id, data) {
    try {
      return await this._exec(this._client.from('onboardings').update(data).eq('id', id).select().single());
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async uploadFile(bucket, file, path) {
    try {
      const { data, error } = await Auth.supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });
      if (error) throw error;
      const { data: urlData } = Auth.supabase.storage.from(bucket).getPublicUrl(data.path);
      return urlData.publicUrl;
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async trackApplication(candidateId, jobOfferId) {
    try {
      const existing = await this._exec(
        this._client.from('applications')
          .select('*')
          .eq('candidate_id', candidateId)
          .eq('job_offer_id', jobOfferId)
          .maybeSingle()
      );
      if (existing) return existing;
      return await this._exec(
        this._client.from('applications')
          .insert({ candidate_id: candidateId, job_offer_id: jobOfferId, status: 'new' })
          .select().single()
      );
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },

  async getStats() {
    try {
      const [offers, applications, interviews, decisions] = await Promise.all([
        this._exec(this._client.from('job_offers').select('*')),
        this._exec(this._client.from('applications').select('*')),
        this._exec(this._client.from('interviews').select('*')),
        this._exec(this._client.from('decisions').select('*')),
      ]);
      const activeOffers = (offers || []).filter(o => o.status === 'published').length;
      const totalApplications = (applications || []).length;
      const today = new Date().toISOString().slice(0, 10);
      const scheduledInterviews = (interviews || []).filter(i => i.status === 'scheduled' && (i.date || '') >= today).length;
      const hires = (applications || []).filter(a => a.status === 'hired').length;
      const months = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
      }
      const countByMonth = (rows, key) => months.map(m => (rows || []).filter(r => String(r[key] || '').slice(0, 7) === m).length);
      return {
        activeOffers,
        totalApplications,
        scheduledInterviews,
        hires,
        months,
        series: {
          offers: countByMonth(offers, 'created_at'),
          applications: countByMonth(applications, 'created_at'),
          interviews: countByMonth(interviews, 'date'),
          hires: countByMonth((applications || []).filter(a => a.status === 'hired'), 'created_at'),
        },
      };
    } catch (e) {
      throw new Error(getErrorMessage(e));
    }
  },
};
