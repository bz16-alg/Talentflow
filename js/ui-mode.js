// TalentFlow — bascule clair/sombre (persistée dans localStorage, indépendante des 5 thèmes visuels)
(function () {
  'use strict';
  var KEY = 'tf-mode';
  var dark = localStorage.getItem(KEY) === 'dark';

  function sync() {
    document.documentElement.setAttribute('data-mode', dark ? 'dark' : 'light');
    document.querySelectorAll('[data-mode-toggle]').forEach(function (b) {
      b.classList.toggle('dark', dark);
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('title', dark ? 'Mode clair' : 'Mode sombre');
      b.setAttribute('aria-label', dark ? 'Mode clair' : 'Mode sombre');
    });
  }

  sync();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sync);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('[data-mode-toggle]') : null;
    if (!btn) return;
    dark = !dark;
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
    sync();
  });
})();
