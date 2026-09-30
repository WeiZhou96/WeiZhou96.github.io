(() => {
  'use strict';
  const canvas = document.querySelector('#star-canvas');
  const context = canvas && canvas.getContext('2d');
  if (!context) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const TINTS = ['255,255,255', '255,255,255', '255,255,255', '179,196,255', '179,196,255', '201,184,255', '255,226,200', '217,249,157'];
  // depth layers: [density per 10k px², radius range, drift px/s, parallax px, alpha range]
  const LAYERS = [
    {density: 1.3, radius: [.4, .85], drift: 2.2, parallax: 5, alpha: [.4, .8]},
    {density: .45, radius: [.7, 1.25], drift: 4.5, parallax: 13, alpha: [.55, .95]},
    {density: .12, radius: [1.15, 1.9], drift: 8, parallax: 28, alpha: [.8, 1]}
  ];

  let width = 0, height = 0, ratio = 1;
  let stars = [], nebula = null, meteors = [];
  let paused = reduced.matches, frame = null, last = 0, nextMeteor = 0;
  const pointer = {x: 0, y: 0, sx: 0, sy: 0};
  const rand = (a, b) => a + Math.random() * (b - a);

  function buildNebula() {
    nebula = document.createElement('canvas');
    nebula.width = Math.ceil(width * ratio);
    nebula.height = Math.ceil(height * ratio);
    const n = nebula.getContext('2d');
    n.scale(ratio, ratio);
    const clouds = [
      [.18, .22, .55, '92,112,255', .13],
      [.82, .34, .5, '150,110,255', .1],
      [.5, .92, .65, '70,150,200', .08],
      [.9, .86, .4, '217,249,157', .035]
    ];
    clouds.forEach(([x, y, r, color, a]) => {
      const radius = Math.max(width, height) * r;
      const g = n.createRadialGradient(width * x, height * y, 0, width * x, height * y, radius);
      g.addColorStop(0, `rgba(${color},${a})`);
      g.addColorStop(.55, `rgba(${color},${a * .35})`);
      g.addColorStop(1, `rgba(${color},0)`);
      n.fillStyle = g;
      n.fillRect(0, 0, width, height);
    });
  }

  function buildStars() {
    stars = [];
    const area = width * height / 10000;
    LAYERS.forEach((layer, depth) => {
      const count = Math.round(area * layer.density);
      for (let i = 0; i < count; i++) {
        stars.push({
          depth,
          x: Math.random() * width,
          y: Math.random() * height,
          r: rand(...layer.radius),
          a: rand(...layer.alpha),
          tint: TINTS[(Math.random() * TINTS.length) | 0],
          speed: rand(.6, 2.4),
          phase: Math.random() * Math.PI * 2,
          spike: depth === 2 && Math.random() < .55
        });
      }
    });
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    width = box.width;
    height = box.height;
    ratio = Math.min(devicePixelRatio || 1, width < 700 ? 1.5 : 2);
    canvas.width = Math.ceil(width * ratio);
    canvas.height = Math.ceil(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    buildNebula();
    buildStars();
    draw(performance.now(), 0);
  }

  function spawnMeteor() {
    const angle = rand(.42, .72); // radians below horizontal, travelling right-down
    const speed = rand(520, 820);
    meteors.push({
      x: rand(-.05, .75) * width,
      y: rand(-.05, .4) * height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      ttl: rand(.75, 1.25),
      len: rand(90, 170)
    });
  }

  function draw(now, dt) {
    const t = now / 1000;
    context.clearRect(0, 0, width, height);
    pointer.sx += (pointer.x - pointer.sx) * .05;
    pointer.sy += (pointer.y - pointer.sy) * .05;

    // nebula drifts a little against the pointer for depth
    context.globalAlpha = .9;
    context.drawImage(nebula, -pointer.sx * 10, -pointer.sy * 8, width, height);
    context.globalAlpha = 1;

    for (const s of stars) {
      const layer = LAYERS[s.depth];
      s.y -= layer.drift * dt;
      s.x += layer.drift * .35 * dt;
      if (s.y < -4) { s.y = height + 4; s.x = Math.random() * width; }
      if (s.x > width + 4) s.x = -4;
      const tw = reduced.matches ? 1 : .55 + .45 * Math.sin(t * s.speed + s.phase);
      const alpha = s.a * tw;
      const x = s.x - pointer.sx * layer.parallax;
      const y = s.y - pointer.sy * layer.parallax;
      context.fillStyle = `rgba(${s.tint},${alpha})`;
      context.beginPath();
      context.arc(x, y, s.r, 0, 6.2832);
      context.fill();
      if (s.depth === 2) {
        const halo = context.createRadialGradient(x, y, 0, x, y, s.r * 6);
        halo.addColorStop(0, `rgba(${s.tint},${alpha * .35})`);
        halo.addColorStop(1, `rgba(${s.tint},0)`);
        context.fillStyle = halo;
        context.fillRect(x - s.r * 6, y - s.r * 6, s.r * 12, s.r * 12);
        if (s.spike) {
          const len = s.r * (5 + 3 * tw);
          context.strokeStyle = `rgba(${s.tint},${alpha * .55})`;
          context.lineWidth = .6;
          context.beginPath();
          context.moveTo(x - len, y); context.lineTo(x + len, y);
          context.moveTo(x, y - len); context.lineTo(x, y + len);
          context.stroke();
        }
      }
    }

    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life += dt;
      m.x += m.vx * dt;
      m.y += m.vy * dt;
      const k = m.life / m.ttl;
      if (k >= 1) { meteors.splice(i, 1); continue; }
      const fade = Math.sin(Math.PI * k);
      const mag = Math.hypot(m.vx, m.vy);
      const tx = m.x - m.vx / mag * m.len, ty = m.y - m.vy / mag * m.len;
      const g = context.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(236,246,255,${.9 * fade})`);
      g.addColorStop(.25, `rgba(179,196,255,${.4 * fade})`);
      g.addColorStop(1, 'rgba(179,196,255,0)');
      context.strokeStyle = g;
      context.lineWidth = 1.3;
      context.lineCap = 'round';
      context.beginPath(); context.moveTo(m.x, m.y); context.lineTo(tx, ty); context.stroke();
      context.fillStyle = `rgba(255,255,255,${fade})`;
      context.beginPath(); context.arc(m.x, m.y, 1.3, 0, 6.2832); context.fill();
    }
  }

  function tick(now) {
    frame = null;
    if (paused || document.hidden) return;
    const dt = last ? Math.min((now - last) / 1000, .066) : 0;
    last = now;
    if (now > nextMeteor) { spawnMeteor(); nextMeteor = now + rand(4200, 9500); }
    draw(now, dt);
    frame = requestAnimationFrame(tick);
  }

  function restart() {
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    last = 0;
    if (!paused && !document.hidden) {
      nextMeteor = performance.now() + rand(1800, 4000);
      frame = requestAnimationFrame(tick);
    } else {
      draw(performance.now(), 0);
    }
  }

  document.addEventListener('site:motion', event => { paused = !!(event.detail && event.detail.paused); restart(); });
  document.addEventListener('visibilitychange', restart);
  reduced.addEventListener('change', event => { paused = event.matches; restart(); });
  document.addEventListener('pointermove', event => {
    pointer.x = event.clientX / innerWidth - .5;
    pointer.y = event.clientY / innerHeight - .5;
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });
  new ResizeObserver(() => { resize(); }).observe(canvas);
  resize();
  restart();
})();
