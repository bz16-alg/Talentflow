const Auth = {
  _client: null,
  _subscribed: false,
  _user: null,
  _profile: null,

  get supabase() {
    if (!this._client) {
      this._client = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
    }
    return this._client;
  },

  async _getProfile(userId) {
    const { data, error } = await this.supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    return error ? null : data;
  },

  async _getProfileWithRetry(userId) {
    let profile = await this._getProfile(userId);
    if (!profile) {
      await new Promise(r => setTimeout(r, 300));
      profile = await this._getProfile(userId);
    }
    return profile;
  },

  async init() {
    const { data } = await this.supabase.auth.getSession();
    const user = data?.session?.user || null;
    if (!user) return null;
    this._user = user;
    this._profile = await this._getProfileWithRetry(user.id);
    if (!this._profile) return null;
    return { user, profile: this._profile };
  },

  async login(email, password) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(this._loginError(error));
    this._user = data.user;
    this._profile = await this._getProfileWithRetry(data.user.id);
    return { user: data.user, profile: this._profile };
  },

  _loginError(error) {
    const code = error?.code || error?.message;
    if (code === 'invalid_credentials' || code === 'UserNotFound' || code === 'InvalidLoginCredentials') {
      return 'Email ou mot de passe incorrect';
    }
    if (code === 'email_not_confirmed') {
      return 'Veuillez confirmer votre email avant de vous connecter';
    }
    return error?.message || 'Erreur de connexion';
  },

  async register({ fullName, email, phone, role, company, password }) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role, company },
      },
    });
    if (error) throw new Error(error.message || "Erreur lors de l'inscription.");
    if (data.session) {
      this._user = data.session.user;
      this._profile = await this._getProfileWithRetry(data.session.user.id);
    } else {
      this._user = data.user || this._user;
    }
    return data.user;
  },

  async logout() {
    await this.supabase.auth.signOut();
    this._user = null;
    this._profile = null;
  },

  getUser() {
    return this._user || null;
  },

  getProfile() {
    return this._profile || null;
  },

  getRole() {
    return this._profile?.role || null;
  },

  async requireAuth(roles = ['recruiter', 'manager']) {
    const { data } = await this.supabase.auth.getSession();
    if (!data?.session?.user) {
      location.href = 'login.html';
      return null;
    }
    this._user = data.session.user;
    let profile = this._profile || await this._getProfile(data.session.user.id);
    if (!profile) {
      await new Promise(r => setTimeout(r, 300));
      profile = await this._getProfile(data.session.user.id);
    }
    if (!profile) {
      location.href = 'login.html';
      return null;
    }
    this._profile = profile;
    if (!roles.includes(profile.role)) {
      Auth.redirectByRole(profile);
    }
    return profile;
  },

  redirectByRole(profile) {
    const role = profile?.role;
    if (role === 'recruiter' || role === 'manager') {
      location.href = 'recruiter-dashboard.html';
    } else {
      location.href = 'apply.html';
    }
  },

  onAuthChange(cb) {
    this._authCb = cb;
    if (this._subscribed) return;
    this._subscribed = true;
    this.supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user || null;
      if (user) {
        this._user = user;
      } else {
        this._user = null;
        this._profile = null;
      }
      if (this._authCb) this._authCb(user);
    });
  },
};
