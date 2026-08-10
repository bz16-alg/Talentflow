/* TalentFlow â€” Animations d'entrÃ©e : 3 variantes (A Â· Minimal Reveal, B Â· Brand Flow, C Â· Premium Flow)
   Web Animations API â€” transform/opacity uniquement. SÃ©lecteur persistant (localStorage). */
(function () {
  'use strict';

  var KEY = 'tf-anim';
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var variant = localStorage.getItem(KEY) || 'b';
  if (['a', 'b', 'c'].indexOf(variant) === -1) variant = 'b';

  var easeOut = 'cubic-bezier(.22,.61,.36,1)';
  var spring = 'cubic-bezier(.34,1.56,.64,1)';
  var live = [];

  function anim(el, frames, opt) {
    if (!el || RM) return null;
    var a;
    try {
      a = el.animate(frames, Object.assign({ fill: 'backwards', easing: easeOut }, opt));
    } catch (e) {
      return null;
    }
    live.push(a);
    return a;
  }

  function rise(el, dur, delay, extra) {
    if (!el) return null;
    var from = extra && extra.x ? 'translateX(' + extra.x + 'px)' : 'translateY(14px)';
    var to = 'translateY(0)';
    if (extra && extra.x) to = 'translateX(0)';
    return anim(el, [{ opacity: 0, transform: from }, { opacity: 1, transform: to }], { duration: dur || 450, delay: delay || 0 });
  }

  function visible(el) {
    return el && el.offsetParent !== null;
  }

  function cleanupDecor() {
    document.querySelectorAll('.tf-fly-dot, .tf-flow-line, .tf-flow-dot, .tf-shine, .tf-halo').forEach(function (el) { el.remove(); });
    document.querySelectorAll('.tf-step-glow').forEach(function (el) { el.classList.remove('tf-step-glow'); });
  }

  function stopAll() {
    live.forEach(function (a) { try { a.cancel(); } catch (e) {} });
    live = [];
    cleanupDecor();
  }

  /* ---------- SPLASH ---------- */
  function flyDots(n, dur, delayBase) {
    var logo = document.querySelector('.splash-logo');
    var scene = document.querySelector('.splash-screen');
    if (!logo || !scene) return;
    var lr = logo.getBoundingClientRect();
    var sr = scene.getBoundingClientRect();
    var cx = lr.left - sr.left + lr.width / 2;
    var cy = lr.top - sr.top + lr.height / 2;
    var cols = ['#4ECCEC', '#23E294', '#9be8ff', '#0560E3', '#4ECCEC', '#23E294', '#9be8ff'];
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i');
      d.className = 'tf-fly-dot';
      d.style.background = cols[i % cols.length];
      d.style.boxShadow = '0 0 12px ' + cols[i % cols.length];
      var ang = (i / n) * Math.PI * 2 + Math.random();
      var dist = Math.max(lr.width, lr.height) * (1.4 + Math.random() * 0.8);
      d.style.left = (cx + Math.cos(ang) * dist) + 'px';
      d.style.top = (cy + Math.sin(ang) * dist) + 'px';
      scene.appendChild(d);
      anim(d, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }, { opacity: .9, transform: 'scale(.5)' }], { duration: dur, delay: delayBase + i * 90 });
      (function (el) { setTimeout(function () { el.remove(); }, delayBase + i * 90 + dur + 100); })(d);
    }
  }

  function splashA() {
    rise(document.querySelector('.splash-logo'), 550, 0);
    rise(document.querySelector('.splash-name'), 550, 160);
    rise(document.querySelector('.splash-tagline'), 500, 300);
    rise(document.getElementById('splash-enter'), 450, 440);
  }

  function splashB() {
    var badge = document.querySelector('.splash-logo');
    rise(badge, 550, 0);
    var pulse = anim(badge, [{ opacity: 0, transform: 'scale(.85)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 600 });
    if (pulse) pulse.onfinish = function () { anim(badge, [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 700, easing: spring }); };
    flyDots(7, 900, 350);
    rise(document.querySelector('.splash-name'), 600, 650);
    rise(document.querySelector('.splash-tagline'), 500, 850);
    rise(document.getElementById('splash-enter'), 450, 1000);
  }

  function splashC() {
    var badge = document.querySelector('.splash-logo');
    if (badge) {
      badge.style.position = 'relative';
      var halo = document.createElement('i');
      halo.className = 'tf-halo';
      badge.appendChild(halo);
      anim(halo, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 1 }, { transform: 'scale(1.5)', opacity: 0 }], { duration: 1500, easing: easeOut });
      (function (el) { setTimeout(function () { el.remove(); }, 1600); })(halo);
      anim(badge, [{ opacity: 0, transform: 'scale(.78)' }, { opacity: 1, transform: 'scale(1.06)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 850, easing: spring });
      var shine = document.createElement('i');
      shine.className = 'tf-shine';
      shine.style.left = '-60%';
      badge.appendChild(shine);
      anim(shine, [{ transform: 'translateX(0) skewX(-18deg)' }, { transform: 'translateX(280%) skewX(-18deg)' }], { duration: 950, delay: 350, easing: 'cubic-bezier(.4,0,.2,1)' });
      (function (el) { setTimeout(function () { el.remove(); }, 1500); })(shine);
    }
    flyDots(10, 950, 420);
    rise(document.querySelector('.splash-name'), 650, 700);
    rise(document.querySelector('.splash-tagline'), 500, 900);
    rise(document.getElementById('splash-enter'), 450, 1050);
  }

  /* ---------- LOGIN ---------- */
  function loginPanel(fnPerItem) {
    var left = document.querySelector('.auth-left');
    if (!left) return;
    var items = Array.prototype.slice.call(left.children).filter(function (c) { return !c.classList.contains('theme-bg'); });
    items.forEach(function (el, i) { fnPerItem(el, i); });
  }

  function loginFields(fnPerField) {
    var fields = Array.prototype.slice.call(document.querySelectorAll('.signin-card .form-group')).filter(visible);
    fields.forEach(function (f, i) { fnPerField(f, i); });
  }

  function loginA() {
    loginPanel(function (el, i) { rise(el, 450, 0 + i * 110, { x: -18 }); });
    rise(document.querySelector('.signin-card'), 550, 350);
    rise(document.querySelector('#card-title'), 300, 650);
    rise(document.querySelector('#card-subtitle'), 300, 720);
    loginFields(function (f, i) { rise(f, 400, 780 + i * 90); });
    rise(document.getElementById('login-submit'), 400, 980);
    rise(visible(document.getElementById('switch-to-login')) ? document.getElementById('switch-to-login') : document.getElementById('switch-to-register'), 350, 1080);
  }

  function loginB() {
    loginPanel(function (el, i) { rise(el, 450, 0 + i * 100, { x: -18 }); });
    var card = document.querySelector('.signin-card');
    if (card) {
      card.style.position = 'relative';
      rise(card, 600, 250);
      var line = document.createElement('i');
      line.className = 'tf-flow-line';
      card.appendChild(line);
      anim(line, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 700, delay: 480 });
      var dot = document.createElement('i');
      dot.className = 'tf-flow-dot';
      dot.style.background = '#23E294';
      dot.style.boxShadow = '0 0 10px #23E294';
      card.appendChild(dot);
      anim(dot, [{ transform: 'translate(0,-50%)' }, { transform: 'translate(' + Math.max(0, card.offsetWidth - 24) + 'px,-50%)' }], { duration: 700, delay: 480 });
      (function (el1, el2) { setTimeout(function () { el1.remove(); el2.remove(); }, 1300); })(line, dot);
      rise(document.querySelector('#card-title'), 300, 760);
      rise(document.querySelector('#card-subtitle'), 300, 830);
      loginFields(function (f, i) { rise(f, 420, 900 + i * 100); });
      var btn = anim(document.getElementById('login-submit'), [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, delay: 1120 });
      if (btn) btn.onfinish = function () { anim(document.getElementById('login-submit'), [{ boxShadow: '0 4px 12px rgba(37,99,235,.3)' }, { boxShadow: '0 6px 20px rgba(35,226,148,.45)' }, { boxShadow: '0 4px 12px rgba(37,99,235,.3)' }], { duration: 600 }); };
      rise(visible(document.getElementById('switch-to-login')) ? document.getElementById('switch-to-login') : document.getElementById('switch-to-register'), 350, 1260);
    } else {
      loginA();
    }
  }

  function loginC() {
    loginPanel(function (el, i) {
      rise(el, 500, 0 + i * 100, { x: -18 });
      if (el.tagName === 'UL') {
        Array.prototype.slice.call(el.children).forEach(function (li, j) { rise(li, 450, 150 + j * 110, { x: -18 }); });
      }
    });
    var card = document.querySelector('.signin-card');
    if (card) {
      card.style.position = 'relative';
      var shine = document.createElement('i');
      shine.className = 'tf-shine';
      shine.style.left = '-60%';
      card.appendChild(shine);
      anim(shine, [{ transform: 'translateX(0) skewX(-18deg)' }, { transform: 'translateX(320%) skewX(-18deg)' }], { duration: 900, delay: 420, easing: 'cubic-bezier(.4,0,.2,1)' });
      (function (el) { setTimeout(function () { el.remove(); }, 1400); })(shine);
      anim(card, [{ opacity: 0, transform: 'translateY(28px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1.01)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 800, delay: 200, easing: spring });
      rise(document.querySelector('#card-title'), 400, 640);
      rise(document.querySelector('#card-subtitle'), 350, 720);
      loginFields(function (f, i) {
        rise(f, 480, 800 + i * 140);
        var ic = f.querySelector('i');
        if (ic) anim(ic, [{ transform: 'scale(.3) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 420, delay: 850 + i * 140, easing: spring });
      });
      var btn = anim(document.getElementById('login-submit'), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 480, delay: 1120 });
      if (btn) btn.onfinish = function () { anim(document.getElementById('login-submit'), [{ boxShadow: '0 4px 12px rgba(37,99,235,.3)' }, { boxShadow: '0 8px 24px rgba(78,204,236,.5)' }], { duration: 700, direction: 'alternate', iterations: 2 }); };
      rise(visible(document.getElementById('switch-to-login')) ? document.getElementById('switch-to-login') : document.getElementById('switch-to-register'), 350, 1280);
    } else {
      loginA();
    }
  }

  /* ---------- DASHBOARD ---------- */
  function dashEntrance(staggerStep, stepDelay, statDelay, cardDelay) {
    rise(document.querySelector('.sidebar'), 450, 0, { x: -24 });
    Array.prototype.slice.call(document.querySelectorAll('.sidebar-link')).forEach(function (l, i) { rise(l, 380, 120 + i * 60, { x: -14 }); });
    rise(document.querySelector('.topbar'), 400, 100);
    rise(document.querySelector('.page-header'), 400, 160);
    Array.prototype.slice.call(document.querySelectorAll('.pipeline-step')).forEach(function (s, i) { rise(s, 380, stepDelay + i * staggerStep); });
  }

  function pipelineFlow(dur, base) {
    var pipe = document.querySelector('.pipeline');
    var steps = Array.prototype.slice.call(document.querySelectorAll('.pipeline-step'));
    if (!pipe || !steps.length) return;
    pipe.style.position = 'relative';
    var dot = document.createElement('i');
    dot.className = 'tf-flow-dot';
    dot.style.background = '#23E294';
    dot.style.boxShadow = '0 0 14px #23E294';
    dot.style.left = '0';
    pipe.appendChild(dot);
    var dist = Math.max(0, pipe.offsetWidth - 24);
    var d = anim(dot, [{ transform: 'translate(0,-50%) scale(1)' }, { transform: 'translate(' + dist + 'px,-50%) scale(.6)' }], { duration: dur, delay: base, easing: 'cubic-bezier(.4,0,.2,1)' });
    if (d) d.onfinish = function () { dot.remove(); };
    else dot.remove();
    steps.forEach(function (st, i) {
      var on = anim(st, [{ background: 'transparent' }, { background: 'var(--primary-light)' }], { duration: 220, delay: base + i * (dur / steps.length) });
      if (on) on.onfinish = function () { st.classList.add('tf-step-glow'); setTimeout(function () { st.classList.remove('tf-step-glow'); }, 1000); };
    });
  }

  function statCountUp(dur) {
    document.querySelectorAll('.stat-card .stat-value').forEach(function (el) {
      if (!visible(el)) return;
      if (!el.hasAttribute('data-final')) el.setAttribute('data-final', el.textContent.trim());
      var to = parseInt(el.getAttribute('data-final').replace(/[^\d-]/g, ''), 10);
      if (isNaN(to)) return;
      var start = null;
      el.textContent = '0';
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  function dashA() {
    dashEntrance(45, 200, 550, 900);
    Array.prototype.slice.call(document.querySelectorAll('.stat-card')).forEach(function (s, i) { rise(s, 420, 550 + i * 80); });
    Array.prototype.slice.call(document.querySelectorAll('.card')).forEach(function (c, i) { rise(c, 450, 900 + i * 100); });
  }

  function dashB() {
    dashEntrance(45, 180, 900, 1250);
    pipelineFlow(1600, 450);
    Array.prototype.slice.call(document.querySelectorAll('.stat-card')).forEach(function (s, i) { rise(s, 420, 900 + i * 80); });
    Array.prototype.slice.call(document.querySelectorAll('.card')).forEach(function (c, i) { rise(c, 450, 1250 + i * 100); });
  }

  function dashC() {
    dashEntrance(45, 150, 850, 1500);
    pipelineFlow(1500, 400);
    Array.prototype.slice.call(document.querySelectorAll('.stat-card')).forEach(function (s, i) {
      anim(s, [{ opacity: 0, transform: 'translateY(20px) scale(.97)' }, { opacity: 1, transform: 'translateY(0) scale(1.02)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 600, delay: 850 + i * 90, easing: spring });
    });
    statCountUp(1100);
    Array.prototype.slice.call(document.querySelectorAll('.card')).forEach(function (c, i) { rise(c, 500, 1500 + i * 100); });
  }

  /* ---------- Dispatch ---------- */
  var RUN = {
    splash: { a: splashA, b: splashB, c: splashC },
    login: { a: loginA, b: loginB, c: loginC },
    dash: { a: dashA, b: dashB, c: dashC }
  };

  function play(scene) {
    stopAll();
    if (RM) return;
    if (RUN[scene] && RUN[scene][variant]) RUN[scene][variant]();
  }

  function sceneFromBody() {
    var p = document.body.getAttribute('data-page') || '';
    if (p === 'login') return 'login';
    if (p === 'splash') return 'splash';
    return 'dash';
  }

  /* ---------- Sélecteur de variante (UI) : baguette magique + menu déroulant ---------- */
  var WAND_ITEMS = [
    { v: 'a', name: 'Minimal Reveal', desc: 'Discret, sobre, efficace' },
    { v: 'b', name: 'Brand Flow', desc: 'Le flux de talents en mouvement' },
    { v: 'c', name: 'Premium Flow', desc: 'Effet premium maîtrisé' }
  ];

  function mountWand() {
    if (document.getElementById('tfAnimWand')) return;
    var wrap = document.createElement('div');
    wrap.className = 'tf-anim-wand';
    wrap.id = 'tfAnimWand';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tf-anim-wand-btn';
    btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i>';
    btn.title = 'Variantes d\'animation';
    btn.setAttribute('aria-label', 'Variantes d\'animation');
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');

    var menu = document.createElement('div');
    menu.className = 'tf-anim-menu';
    menu.id = 'tfAnimMenu';
    menu.setAttribute('role', 'menu');

    function toggleMenu(open) {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
    }

    function syncItems() {
      menu.querySelectorAll('.tf-anim-item[data-tf-anim]').forEach(function (x) {
        x.classList.toggle('active', x.dataset.tfAnim === variant);
      });
    }

    WAND_ITEMS.forEach(function (it) {
      var item = document.createElement('button');
      item.type = 'button';
      item.className = 'tf-anim-item';
      item.dataset.tfAnim = it.v;
      item.setAttribute('role', 'menuitem');
      item.innerHTML = '<span class="tf-anim-item-check"><i class="fa-solid fa-check"></i></span>' +
        '<span class="tf-anim-item-txt"><strong>' + it.name + '</strong><small>' + it.desc + '</small></span>';
      item.addEventListener('click', function () {
        variant = it.v;
        localStorage.setItem(KEY, variant);
        syncItems();
        toggleMenu(false);
        play(sceneFromBody());
      });
      menu.appendChild(item);
    });

    var replay = document.createElement('button');
    replay.type = 'button';
    replay.className = 'tf-anim-item tf-anim-item-replay';
    replay.id = 'tfAnimReplay';
    replay.setAttribute('role', 'menuitem');
    replay.innerHTML = '<span class="tf-anim-item-check"></span>' +
      '<span class="tf-anim-item-txt"><strong><i class="fa-solid fa-rotate-right"></i> Rejouer l\'animation</strong></span>';
    replay.addEventListener('click', function () { toggleMenu(false); play(sceneFromBody()); });
    menu.appendChild(replay);

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu(!menu.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!(e.target.closest && e.target.closest('.tf-anim-wand'))) toggleMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') toggleMenu(false);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    syncItems();
    document.body.appendChild(wrap);
  }

  document.addEventListener('DOMContentLoaded', mountWand);

  window.TFAnim = {
    play: play,
    replay: function () { play(sceneFromBody()); },
    getVariant: function () { return variant; },
    setVariant: function (v) {
      if (['a', 'b', 'c'].indexOf(v) === -1) return;
      variant = v;
      localStorage.setItem(KEY, variant);
      var b = document.querySelector('[data-tf-anim="' + v + '"]');
      if (b) b.click();
      else play(sceneFromBody());
    }
  };
})();

