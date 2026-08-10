// TalentFlow — Moteur de thèmes (3 choix : Encre / Particules / Aurore)
// Le thème sélectionné est persisté dans localStorage et s'applique au
// fond de la page de connexion + aux logos de toutes les pages.
(function () {
  'use strict';

  var KEY = 'tf-theme';
  var THEMES = {
    a: { name: 'Encre', bg: 'ink', logo: 1 },
    b: { name: 'Particules', bg: 'particles', logo: 2 },
    c: { name: 'Aurore', bg: 'orbs', logo: 3 },
    d: { name: 'Cosmos', bg: 'cosmos', logo: 4 },
    e: { name: 'Vagues', bg: 'waves', logo: 5 }
  };
  var current = THEMES[localStorage.getItem(KEY)] ? localStorage.getItem(KEY) : 'b';

  var FAVICONS = {
    a: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230560E3'/%3E%3Cstop offset='55%25' stop-color='%234ECCEC'/%3E%3Cstop offset='100%25' stop-color='%2323E294'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='60' r='57' fill='%230a1122'/%3E%3Ccircle cx='60' cy='60' r='57' fill='none' stroke='%234ECCEC' stroke-opacity='.45' stroke-width='2'/%3E%3Ctext x='60' y='73' text-anchor='middle' font-family='Arial, sans-serif' font-weight='800' font-size='44' fill='url(%23g)'%3ETF%3C/text%3E%3Cpath d='M30 86 C48 96, 76 96, 92 84' fill='none' stroke='url(%23g)' stroke-width='5' stroke-linecap='round'/%3E%3C/svg%3E",
    b: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='57' fill='%230a1122'/%3E%3Ccircle cx='60' cy='60' r='57' fill='none' stroke='%234ECCEC' stroke-opacity='.45' stroke-width='2'/%3E%3Ccircle cx='47' cy='43' r='14' fill='%234ECCEC'/%3E%3Cpath d='M27 86 C29 66, 38 60, 47 60 L68 60 C78 60, 86 72, 88 86 Z' fill='%23e6edf7'/%3E%3Ccircle cx='92' cy='26' r='4' fill='%2323E294'/%3E%3Ccircle cx='85' cy='40' r='3.5' fill='%234ECCEC'/%3E%3Ccircle cx='80' cy='16' r='3' fill='%234ECCEC'/%3E%3Ccircle cx='95' cy='44' r='2.6' fill='%2323E294'/%3E%3Ccircle cx='74' cy='52' r='2.4' fill='%2323E294'/%3E%3Ccircle cx='89' cy='58' r='2.2' fill='%234ECCEC'/%3E%3C/svg%3E",
    c: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230560E3'/%3E%3Cstop offset='55%25' stop-color='%234ECCEC'/%3E%3Cstop offset='100%25' stop-color='%2323E294'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='60' cy='60' r='57' fill='%230a1122'/%3E%3Ccircle cx='60' cy='60' r='57' fill='none' stroke='%234ECCEC' stroke-opacity='.45' stroke-width='2'/%3E%3Cpath d='M30 34 H90 L66 66 H54 Z' fill='url(%23g)'/%3E%3Crect x='51' y='66' width='18' height='14' rx='3' fill='url(%23g)'/%3E%3Ccircle cx='44' cy='44' r='3' fill='%2304258B'/%3E%3Ccircle cx='74' cy='48' r='3' fill='%2304258B'/%3E%3Ccircle cx='60' cy='58' r='3.4' fill='%2304258B'/%3E%3C/svg%3E",
    d: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='57' fill='%230a1122'/%3E%3Ccircle cx='60' cy='60' r='57' fill='none' stroke='%234ECCEC' stroke-opacity='.45' stroke-width='2'/%3E%3Cpath d='M52 76 C56 90, 64 90, 68 76 L60 70 Z' fill='%2323E294'/%3E%3Cpath d='M60 24 L74 58 L66 74 L54 74 L46 58 Z' fill='%230560E3'/%3E%3Cpath d='M46 56 L38 72 L46 68 Z' fill='%234ECCEC'/%3E%3Cpath d='M74 56 L82 72 L74 68 Z' fill='%234ECCEC'/%3E%3Ccircle cx='60' cy='52' r='6' fill='%2304258B'/%3E%3C/svg%3E",
    e: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='57' fill='%230a1122'/%3E%3Ccircle cx='60' cy='60' r='57' fill='none' stroke='%234ECCEC' stroke-opacity='.45' stroke-width='2'/%3E%3Ccircle cx='60' cy='60' r='8' fill='%234ECCEC'/%3E%3Cpath d='M60 18 A42 42 0 0 1 96 42' fill='none' stroke='%234ECCEC' stroke-width='3' stroke-linecap='round'/%3E%3Cpath d='M60 30 A30 30 0 0 1 84 48' fill='none' stroke='%2323E294' stroke-width='3' stroke-linecap='round'/%3E%3C/svg%3E"
  };

  function applyFavicon() {
    var link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = FAVICONS[current];
  }

  function gradStop(id) {
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0560E3"/><stop offset="55%" stop-color="#4ECCEC"/><stop offset="100%" stop-color="#23E294"/></linearGradient></defs>';
  }

  function logo1(id, animated) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + gradStop(id) +
      '<circle cx="60" cy="60" r="57" fill="#0a1122"/><circle cx="60" cy="60" r="57" fill="none" stroke="rgba(78,204,236,.35)" stroke-width="2"/>' +
      '<text class="tf-flow' + (animated ? ' tf-animated-flow' : '') + '" x="60" y="70" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-weight="800" font-size="40" fill="url(#' + id + ')">TF</text>' +
      '<path class="tf-swoosh' + (animated ? ' tf-animated' : '') + '" d="M30 86 C48 96, 76 96, 92 84" fill="none" stroke="url(#' + id + ')" stroke-width="5" stroke-linecap="round"/></svg>';
  }

  function logo2(id) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + gradStop(id) +
      '<circle cx="60" cy="60" r="57" fill="#0a1122"/><circle cx="60" cy="60" r="57" fill="none" stroke="rgba(78,204,236,.35)" stroke-width="2"/>' +
      '<circle class="tf-dot" cx="47" cy="43" r="13" fill="#4ECCEC"/>' +
      '<path d="M27 86 C29 66, 38 60, 47 60 L68 60 C78 60, 86 72, 88 86 Z" fill="rgba(230,237,247,.85)"/>' +
      '<circle class="tf-dot" style="animation-delay:.3s" cx="92" cy="26" r="4" fill="#23E294"/>' +
      '<circle class="tf-dot" style="animation-delay:.7s" cx="85" cy="40" r="3.5" fill="#4ECCEC"/>' +
      '<circle class="tf-dot" style="animation-delay:1.1s" cx="80" cy="16" r="3" fill="#4ECCEC"/>' +
      '<circle class="tf-dot" style="animation-delay:1.5s" cx="95" cy="44" r="2.6" fill="#23E294"/>' +
      '<circle class="tf-dot" style="animation-delay:1.9s" cx="74" cy="52" r="2.4" fill="#23E294"/>' +
      '<circle class="tf-dot" style="animation-delay:2.3s" cx="89" cy="58" r="2.2" fill="#4ECCEC"/></svg>';
  }

  function logo3(id) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + gradStop(id) +
      '<circle cx="60" cy="60" r="57" fill="#0a1122"/><circle cx="60" cy="60" r="57" fill="none" stroke="rgba(78,204,236,.35)" stroke-width="2"/>' +
      '<path d="M30 34 H90 L66 66 H54 Z" fill="url(#' + id + ')"/>' +
      '<rect x="51" y="66" width="18" height="14" rx="3" fill="url(#' + id + ')"/>' +
      '<circle class="tf-dot" cx="44" cy="44" r="3.2" fill="#04285B"/>' +
      '<circle class="tf-dot" style="animation-delay:.4s" cx="74" cy="48" r="3" fill="#04285B"/>' +
      '<circle class="tf-dot" style="animation-delay:.8s" cx="60" cy="58" r="3.4" fill="#04285B"/>' +
      '<circle class="tf-dot" style="animation-delay:1.2s" cx="50" cy="40" r="2.4" fill="#04285B"/>' +
      '<circle class="tf-dot" style="animation-delay:1.6s" cx="66" cy="38" r="2.2" fill="#04285B"/></svg>';
  }

  function logo4(id) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + gradStop(id) +
      '<circle cx="60" cy="60" r="57" fill="#0a1122"/><circle cx="60" cy="60" r="57" fill="none" stroke="rgba(78,204,236,.35)" stroke-width="2"/>' +
      '<path class="tf-dot" d="M52 76 C56 90, 64 90, 68 76 L60 70 Z" fill="#23E294"/>' +
      '<path d="M60 24 L74 58 L66 74 L54 74 L46 58 Z" fill="url(#' + id + ')"/>' +
      '<path d="M46 56 L38 72 L46 68 Z" fill="#4ECCEC"/>' +
      '<path d="M74 56 L82 72 L74 68 Z" fill="#4ECCEC"/>' +
      '<circle cx="60" cy="52" r="6" fill="#04285B"/>' +
      '<circle cx="60" cy="52" r="6" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/></svg>';
  }

  function logo5(id) {
    return '<svg viewBox="0 0 120 120" aria-hidden="true">' + gradStop(id) +
      '<circle cx="60" cy="60" r="57" fill="#0a1122"/><circle cx="60" cy="60" r="57" fill="none" stroke="rgba(78,204,236,.35)" stroke-width="2"/>' +
      '<circle cx="60" cy="60" r="8" fill="url(#' + id + ')"/>' +
      '<path class="tf-sonar" d="M60 18 A42 42 0 0 1 96 42" fill="none" stroke="#4ECCEC" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="tf-sonar" style="animation-delay:.8s" d="M60 30 A30 30 0 0 1 84 48" fill="none" stroke="#23E294" stroke-width="3" stroke-linecap="round"/>' +
      '<path class="tf-sonar" style="animation-delay:1.6s" d="M84 72 A30 30 0 0 1 60 90" fill="none" stroke="#4ECCEC" stroke-width="3" stroke-linecap="round"/>' +
      '<circle class="tf-dot" cx="36" cy="56" r="3" fill="#23E294"/></svg>';
  }

  var LOGOS = { 1: logo1, 2: logo2, 3: logo3, 4: logo4, 5: logo5 };

  function applyLogos() {
    var slots = document.querySelectorAll('[data-logo-slot]');
    var logo = LOGOS[THEMES[current].logo];
    slots.forEach(function (el, i) {
      var id = 'tg' + current + '-' + i;
      var animated = el.getAttribute('data-animated') === 'true';
      el.innerHTML = logo(id, animated);
    });
  }

  function loadScript(src, done) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = function () { done(null); };
    s.onerror = function () { done(new Error('load failed')); };
    document.head.appendChild(s);
  }

  function stopInk() {
    if (window.__liquidInkCleanup) {
      try { window.__liquidInkCleanup(); } catch (e) {}
      window.__liquidInkCleanup = null;
    }
  }

  function buildBg() {
    var host = document.getElementById('theme-bg');
    if (!host) return;
    stopInk();
    host.innerHTML = '';
    var mode = THEMES[current].bg;
    if (mode === 'ink') {
      var wrap = document.createElement('div');
      wrap.className = 'liquid-ink-bg';
      wrap.setAttribute('aria-hidden', 'true');
      wrap.innerHTML = '<div class="orb orb-cyan"></div><div class="orb orb-blue"></div><div class="orb orb-green"></div><div id="liquid-ink-root"></div>';
      host.appendChild(wrap);
      loadScript('js/liquid-ink.js?v=20260809', function (err) {
        if (err) return;
        loadScript('js/liquid-ink-boot.js?v=20260809', function () {});
      });
    } else if (mode === 'particles') {
      var cv = document.createElement('canvas');
      cv.id = 'particles-canvas';
      cv.setAttribute('aria-hidden', 'true');
      host.appendChild(cv);
      if (window.Particles) window.Particles.init(cv);
    } else if (mode === 'cosmos') {
      host.innerHTML =
        '<div class="cosmos-bg">' +
        '<div class="stars stars-1"></div><div class="stars stars-2"></div><div class="stars stars-3"></div>' +
        '<div class="shooting-star" style="top:16%;left:24%;animation-delay:.6s"></div>' +
        '<div class="shooting-star" style="top:48%;left:58%;animation-delay:3.8s"></div>' +
        '<div class="shooting-star" style="top:72%;left:34%;animation-delay:7s"></div>' +
        '</div>';
    } else if (mode === 'waves') {
      var wp = 'M0,150 C150,90 300,210 450,150 C600,90 750,210 900,150 C1050,90 1200,210 1200,150 L1200,300 L0,300 Z';
      var svgW = function (cls) {
        return '<svg class="wave ' + cls + '" viewBox="0 0 2400 300" preserveAspectRatio="none" aria-hidden="true"><g><path d="' + wp + '"/><path d="' + wp + '" transform="translate(1200,0)"/></g></svg>';
      };
      host.innerHTML = svgW('wave-1') + svgW('wave-2') + svgW('wave-3');
    } else if (mode === 'orbs') {
      var orbs = document.createElement('div');
      orbs.setAttribute('aria-hidden', 'true');
      orbs.innerHTML =
        '<div class="orb orb-c-cyan"></div><div class="orb orb-c-blue"></div><div class="orb orb-c-green"></div>' +
        '<div class="dot-c" style="width:6px;height:6px;left:22%;bottom:-8px;animation-duration:9s"></div>' +
        '<div class="dot-c g" style="width:5px;height:5px;left:55%;bottom:-8px;animation-duration:12s"></div>' +
        '<div class="dot-c" style="width:4px;height:4px;left:78%;bottom:-8px;animation-duration:8s"></div>' +
        '<div class="dot-c g" style="width:6px;height:6px;left:40%;bottom:-8px;animation-duration:14s"></div>';
      host.appendChild(orbs);
    }
  }

  function syncSwitcher() {
    document.querySelectorAll('[data-theme]').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === current);
    });
  }

  function init() {
    applyFavicon();
    applyLogos();
    buildBg();
    syncSwitcher();
    document.querySelectorAll('[data-theme]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-theme');
        if (!THEMES[t] || t === current) return;
        current = t;
        localStorage.setItem(KEY, t);
        applyFavicon();
        applyLogos();
        buildBg();
        syncSwitcher();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
