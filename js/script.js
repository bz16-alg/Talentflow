(function () {
  'use strict';

  function fillLangSwitch() {
    try {
      const select = document.getElementById('lang-switch') || document.querySelector('[data-lang-switch]');
      if (!select || typeof langNames === 'undefined' || select.tagName !== 'SELECT') return;
      select.innerHTML = '';
      Object.keys(langNames).forEach(function (lang) {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = langNames[lang];
        select.appendChild(option);
      });
      select.value = typeof currentLang !== 'undefined' ? currentLang : 'fr';
      select.onchange = function () {
        if (typeof setLang === 'function') setLang(select.value);
      };
    } catch (err) {
      console.warn('[TalentFlow] fillLangSwitch', err);
    }
  }

  function wireSidebarToggle() {
    try {
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      const toggles = document.querySelectorAll('[data-sidebar-toggle]');
      if (!sidebar || !toggles.length) return;
      const isDesktop = function () { return window.matchMedia('(min-width: 769px)').matches; };
      function close() {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
      }
      function toggle() {
        if (isDesktop()) {
          document.body.classList.toggle('sidebar-collapsed');
        } else {
          sidebar.classList.toggle('open');
          if (overlay) overlay.classList.toggle('open');
        }
      }
      function onResize() {
        if (isDesktop()) {
          sidebar.classList.remove('open');
          if (overlay) overlay.classList.remove('open');
        }
      }
      toggles.forEach(function (btn) { btn.addEventListener('click', toggle); });
      if (overlay) overlay.addEventListener('click', close);
      sidebar.querySelectorAll('.sidebar-link').forEach(function (link) {
        link.addEventListener('click', close);
      });
      window.addEventListener('resize', onResize);
    } catch (err) {
      console.warn('[TalentFlow] wireSidebarToggle', err);
    }
  }

  function fillUser(profile) {
    try {
      if (!profile || typeof profile !== 'object') return;
      const name = profile.full_name || profile.email || '';
      const roleKey = profile.role === 'manager' ? 'auth.managerRole' : profile.role === 'candidate' ? 'auth.candidateRole' : profile.role === 'admin' ? 'auth.adminRole' : 'auth.recruiterRole';
      const nameEl = document.querySelector('[data-user-name]');
      const topbarEl = document.querySelector('[data-topbar-name]');
      const roleEl = document.querySelector('[data-user-role]');
      const avatarEl = document.querySelector('[data-avatar]');
      document.body.dataset.role = profile.role || '';
      if (nameEl) nameEl.textContent = name;
      if (roleEl) roleEl.textContent = typeof t === 'function' ? t(roleKey) : roleKey;
      if (topbarEl) {
        const pageTitleEl = document.querySelector('.page-title');
        topbarEl.textContent = pageTitleEl && pageTitleEl.textContent ? pageTitleEl.textContent.trim() : topbarEl.textContent;
      }
      if (avatarEl) {
        const initials = String(name).split(/\s+/).filter(Boolean).map(function (part) { return part.charAt(0); }).join('').slice(0, 2).toUpperCase();
        avatarEl.textContent = initials || '?';
      }
    } catch (err) {
      console.warn('[TalentFlow] fillUser', err);
    }
  }

  function wireLogout() {
    try {
      const elements = document.querySelectorAll('[data-logout]');
      if (!elements.length) return;
      function doLogout() {
        try {
          if (typeof Auth !== 'undefined' && Auth.logout) {
            const result = Auth.logout();
            if (result && typeof result.then === 'function') {
              result.then(function () { window.location.href = 'login.html'; }).catch(function () { window.location.href = 'login.html'; });
              return;
            }
          }
          window.location.href = 'login.html';
        } catch (e) {
          window.location.href = 'login.html';
        }
      }
      elements.forEach(function (el) {
        el.addEventListener('click', function () {
          const message = typeof t === 'function' ? t('auth.logoutConfirm') : 'Se déconnecter ?';
          if (typeof Widgets !== 'undefined' && Widgets.confirm) {
            const result = Widgets.confirm(message);
            if (result && typeof result.then === 'function') {
              result.then(function (ok) { if (ok) doLogout(); });
            } else if (result === false) {
              return;
            } else {
              doLogout();
            }
          } else if (typeof window.confirm === 'function') {
            if (window.confirm(message)) doLogout();
          } else {
            doLogout();
          }
        });
      });
    } catch (err) {
      console.warn('[TalentFlow] wireLogout', err);
    }
  }

  window.initSharedLayout = function (profile) {
    fillLangSwitch();
    wireSidebarToggle();
    wireLogout();
    fillUser(profile);
    try {
      if (typeof Widgets !== 'undefined') {
        if (Widgets.setActiveNav && document.body && document.body.dataset.page) Widgets.setActiveNav(document.body.dataset.page);
        if (Widgets.applyTranslations) Widgets.applyTranslations();
      }
    } catch (err) {
      console.warn('[TalentFlow] initSharedLayout', err);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    fillLangSwitch();
    wireSidebarToggle();
    wireLogout();
    if (typeof window.pageInit === 'function') {
      try {
        window.pageInit();
      } catch (err) {
        console.warn('[TalentFlow] pageInit', err);
      }
    }
  });
})();
