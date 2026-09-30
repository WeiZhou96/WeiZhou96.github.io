(() => {
  'use strict';
  const canvas = document.querySelector('#star-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const colors = ['194,213,255', '157,179,255', '197,163,255', '255,224,189'];
  let width = 0, height = 0, ratio = 1, stars = [], meteors = [];
  let galaxy, haze, frame = null, last = 0, elapsed = 0, nextMeteor = 2;
  let paused = document.documentElement.dataset.motion === 'paused';
  const pointer = {x: 0, y: 0, sx: 0, sy: 0};

  function cloud(c, x, y, r, color, alpha) {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${color},${alpha})`);
    g.addColorStop(.35, `rgba(${color},${alpha * .38})`);
    g.addColorStop(1, `rgba(${color},0)`);
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Cache the detailed spiral; frames only transform this texture.
  function buildGalaxy() {
    const size = width < 700 ? 900 : 1600;
    galaxy = document.createElement('canvas');
    galaxy.width = galaxy.height = size;
    const c = galaxy.getContext('2d');
    c.translate(size / 2, size / 2);
    const radius = size * .47;
    cloud(c, 0, 0, radius, '88,100,218', .24);
    for (let arm = 0; arm < 4; arm++) {
      for (let j = 0; j < 50; j++) {
        const u = .06 + j / 54;
        const a = arm * TAU / 4 + u * 5.1;
        const r = u * radius;
        cloud(c, Math.cos(a) * r, Math.sin(a) * r, radius * (.05 + u * .075),
          arm % 2 ? '145,97,239' : '76,139,240', .105 * (1 - u * .65));
      }
    }
    for (let i = 0; i < 14500; i++) {
      const u = Math.pow(Math.random(), .76);
      const arm = i % 4;
      const spread = (Math.random() + Math.random() + Math.random() - 1.5);
      const a = arm * TAU / 4 + u * 5.1 + spread * (.14 + u * .43);
      const r = u * radius;
      const x = Math.cos(a) * r, y = Math.sin(a) * r;
      const tint = u < .2 ? '255,226,193' : colors[i % 3];
      const alpha = rand(.12, .62) * Math.pow(1 - u, .55);
      c.fillStyle = `rgba(${tint},${alpha})`;
      const s = rand(.35, 1.25);
      c.fillRect(x, y, s, s);
      if (i % 130 === 0) cloud(c, x, y, 7, tint, .36);
    }
    cloud(c, 0, 0, radius * .3, '191,165,247', .5);
    cloud(c, 0, 0, radius * .15, '255,211,166', .75);
    cloud(c, 0, 0, radius * .055, '255,246,227', .85);
    haze = document.createElement('canvas');
    haze.width = 960; haze.height = 640;
    const h = haze.getContext('2d');
    cloud(h, 740, 190, 420, '76,87,210', .23);
    cloud(h, 330, 440, 340, '93,54,170', .19);
    cloud(h, 860, 520, 310, '37,115,156', .15);
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    width = box.width; height = box.height;
    ratio = Math.min(devicePixelRatio || 1, 1.6, Math.sqrt(4000000 / (width * height)));
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({length: Math.min(900, Math.round(width * height / 2200))}, () => ({
      x: rand(0, width), y: rand(0, height), depth: Math.random(),
      r: rand(.4, 1.5), phase: rand(0, TAU), speed: rand(.6, 1.9), color: colors[Math.floor(rand(0, 4))]
    }));
    meteors = [];
    buildGalaxy(); draw(0);
  }

  function spawnMeteor() {
    const angle = rand(.28, .48), speed = rand(370, 580);
    meteors.push({x: rand(.18, .88) * width, y: rand(-.08, .28) * height,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, ttl: 1.5, length: rand(100, 190)});
  }

  function draw(dt) {
    if (!galaxy) return;
    ctx.clearRect(0, 0, width, height);
    if (dt > 0) {
      pointer.sx += (pointer.x - pointer.sx) * .045;
      pointer.sy += (pointer.y - pointer.sy) * .045;
    }
    ctx.drawImage(haze, -20 - pointer.sx * 12, -20 - pointer.sy * 10, width + 40, height + 40);
    const diameter = Math.max(width * 1.13, height * 1.55);
    ctx.save();
    ctx.translate(width * (width < 700 ? .6 : .5) - pointer.sx * 20, height * .47 - pointer.sy * 14);
    ctx.rotate(-.34 + Math.sin(elapsed * .025) * .025);
    ctx.scale(1, .57);
    ctx.rotate(elapsed * .018);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = .86;
    ctx.drawImage(galaxy, -diameter / 2, -diameter / 2, diameter, diameter);
    ctx.restore();
    for (const s of stars) {
      s.x += (1 + s.depth * 3) * dt;
      s.y -= (1 + s.depth * 5) * dt;
      if (s.x > width + 8) s.x = -8;
      if (s.y < -8) s.y = height + 8;
      const x = s.x - pointer.sx * (5 + s.depth * 22);
      const y = s.y - pointer.sy * (5 + s.depth * 22);
      const glow = .5 + .5 * Math.sin(elapsed * s.speed + s.phase);
      const alpha = .25 + glow * .65;
      ctx.fillStyle = `rgba(${s.color},${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
      if (s.depth > .93) {
        cloud(ctx, x, y, s.r * 9, s.color, alpha * .2);
        const len = s.r * (3 + glow * 4);
        ctx.strokeStyle = `rgba(${s.color},${alpha * .5})`;
        ctx.lineWidth = .55;
        ctx.beginPath();
        ctx.moveTo(x - len, y); ctx.lineTo(x + len, y);
        ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
      }
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.life += dt; m.x += m.vx * dt; m.y += m.vy * dt;
      if (m.life >= m.ttl) { meteors.splice(i, 1); continue; }
      const a = Math.sin(m.life / m.ttl * Math.PI);
      const v = Math.hypot(m.vx, m.vy);
      const tx = m.x - m.vx / v * m.length, ty = m.y - m.vy / v * m.length;
      const g = ctx.createLinearGradient(m.x, m.y, tx, ty);
      g.addColorStop(0, `rgba(229,241,255,${a * .8})`);
      g.addColorStop(.3, `rgba(155,180,255,${a * .4})`);
      g.addColorStop(1, 'rgba(155,180,255,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
  }

  function tick(now) {
    frame = null;
    if (paused || document.hidden) return;
    // 30fps leaves headroom for Clawd and page interactions at 2K/4K.
    if (!last || now - last >= 32) {
      const dt = last ? Math.min((now - last) / 1000, .08) : 0;
      last = now; elapsed += dt;
      if (elapsed > nextMeteor) { spawnMeteor(); nextMeteor = elapsed + rand(4, 8); }
      draw(dt);
    }
    frame = requestAnimationFrame(tick);
  }
  function restart() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; last = 0;
    if (!paused && !document.hidden) frame = requestAnimationFrame(tick);
  }
  document.addEventListener('site:motion', e => { paused = !!e.detail.paused; restart(); });
  document.addEventListener('visibilitychange', restart);
  document.addEventListener('pointermove', e => {
    pointer.x = e.clientX / innerWidth - .5;
    pointer.y = e.clientY / innerHeight - .5;
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { pointer.x = pointer.y = 0; });
  new ResizeObserver(resize).observe(canvas);
  resize(); restart();
})();
