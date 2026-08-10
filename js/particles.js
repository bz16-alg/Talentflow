// Flux de particules TalentFlow — animation de fond (auth-left)
// Expose window.Particles.init(canvas) pour le moteur de thèmes.
(function () {
  'use strict';
  var cv = null;
  var ctx = null;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0;
  var H = 0;
  var N = 120;
  var colors = ['#4ECCEC', '#23E294', '#0560E3', '#9be8ff'];
  var ps = [];
  var raf = 0;
  var running = false;

  function resize() {
    if (!cv) return;
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = Math.max(1, W * DPR);
    cv.height = Math.max(1, H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function yAt(lane, t) {
    var base = H * (0.12 + lane * 0.24);
    return base + Math.sin(t * Math.PI * 2 + lane * 1.7) * H * 0.07 + Math.sin(t * Math.PI * 8 + lane) * 5;
  }

  function frame() {
    if (!running) return;
    ctx.fillStyle = 'rgba(10,17,34,0.16)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    for (var i = 0; i < N; i++) {
      var p = ps[i];
      p.t += p.speed;
      if (p.t > 1) { p.t = 0; p.offset = (Math.random() - 0.5) * 90; }
      var x = p.t * (W + 120) - 60 + p.offset;
      var y = yAt(p.lane, p.t);
      var a = Math.sin(p.t * Math.PI) * 0.9;
      if (a <= 0.02) continue;
      ctx.globalAlpha = a;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = a * 0.28;
      ctx.beginPath();
      ctx.arc(x, y, p.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    raf = requestAnimationFrame(frame);
  }

  function init(canvas) {
    stop();
    cv = canvas;
    if (!cv) return;
    ctx = cv.getContext('2d');
    if (!ctx) return;
    resize();
    ps = [];
    for (var i = 0; i < N; i++) {
      ps.push({
        t: Math.random(),
        speed: 0.0006 + Math.random() * 0.0014,
        lane: Math.floor(Math.random() * 4),
        offset: (Math.random() - 0.5) * 90,
        size: 1 + Math.random() * 1.8,
        c: colors[i % colors.length]
      });
    }
    running = true;
    raf = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    running = !document.hidden;
    if (running && cv) raf = requestAnimationFrame(frame);
  });

  window.Particles = { init: init, stop: stop };

  document.addEventListener('DOMContentLoaded', function () {
    var c = document.getElementById('particles-canvas');
    if (c) init(c);
  });
})();
