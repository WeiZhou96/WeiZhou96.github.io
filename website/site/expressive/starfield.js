(() => {
  'use strict';
  const canvas = document.querySelector('#star-canvas');
  const ctx = canvas && canvas.getContext('2d');
  if (!ctx) return;
  const TAU = Math.PI * 2;
  const rand = (a, b) => a + Math.random() * (b - a);
  const colors = ['170,220,255', '139,163,255', '216,150,255', '255,225,190', '100,231,235'];
  const armColors = ['78,164,255', '186,94,244', '62,203,221', '219,108,188'];
  const sprites = colors.map(color => {
    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 48;
    cloud(sprite.getContext('2d'), 24, 24, 24, color, .8);
    return sprite;
  });
  let width = 0, height = 0, ratio = 1, stars = [], meteors = [];
  let galaxy, haze, knots = [], frame = null, last = 0, elapsed = 0, nextMeteor = 1.2;
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
          armColors[arm], .19 * (1 - u * .65));
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
    cloud(h, 740, 190, 420, '87,81,225', .34);
    cloud(h, 330, 440, 340, '147,54,190', .27);
    cloud(h, 860, 520, 310, '35,165,190', .29);
    // Small emissive clusters drift independently inside the spiral arms.
    knots = Array.from({length: width < 700 ? 48 : 96}, (_, i) => ({
      u: rand(.15, .9), arm: i % 4, phase: rand(0, TAU),
      size: rand(2.5, 6), tint: i % sprites.length
    }));
  }

  function resize() {
    const box = canvas.getBoundingClientRect();
    if (!box.width || !box.height) return;
    const nextRatio = Math.min(devicePixelRatio || 1, 1.6, Math.sqrt(4000000 / (box.width * box.height)));
    if (width === box.width && height === box.height && ratio === nextRatio) return;
    width = box.width; height = box.height; ratio = nextRatio;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    stars = Array.from({length: Math.min(900, Math.round(width * height / 2200))}, () => ({
      x: rand(0, width), y: rand(0, height), depth: Math.random(),
      r: rand(.4, 1.65), phase: rand(0, TAU), speed: rand(1, 2.5), tint: Math.floor(rand(0, colors.length))
    }));
    meteors = [];
    buildGalaxy(); draw(0);
  }

  function spawnMeteor() {
    const angle = rand(.3, .58), speed = Math.min(width, 1600) * rand(.32, .46);
    meteors.push({x: rand(.08, .7) * width, y: rand(.04, .5) * height,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 0, ttl: 1.8,
      length: Math.min(width * .3, rand(160, 290)), tint: Math.random() < .5 ? 0 : 2});
  }

  function draw(dt) {
    if (!galaxy) return;
    ctx.clearRect(0, 0, width, height);
    if (dt > 0) {
      pointer.sx += (pointer.x - pointer.sx) * .045;
      pointer.sy += (pointer.y - pointer.sy) * .045;
    }
    const driftX = Math.sin(elapsed * .09) * 38, driftY = Math.cos(elapsed * .07) * 28;
    ctx.globalAlpha = .86 + Math.sin(elapsed * .35) * .14;
    ctx.drawImage(haze, -70 + driftX - pointer.sx * 24, -70 + driftY - pointer.sy * 20, width + 140, height + 140);
    ctx.globalAlpha = 1;
    const diameter = Math.max(width * 1.13, height * 1.55) * (1 + Math.sin(elapsed * .22) * .018);
    ctx.save();
    ctx.translate(width * (width < 700 ? .6 : .5) - pointer.sx * 20, height * .47 - pointer.sy * 14);
    ctx.rotate(-.34 + Math.sin(elapsed * .07) * .055);
    ctx.scale(1, .57 + Math.sin(elapsed * .11) * .025);
    ctx.rotate(elapsed * .055);
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = .96;
    ctx.drawImage(galaxy, -diameter / 2, -diameter / 2, diameter, diameter);
    for (const k of knots) {
      const angle = k.arm * TAU / 4 + k.u * 5.1 + Math.sin(elapsed * .24 + k.phase) * .075;
      const radius = k.u * diameter * .47;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
      const glow = .5 + .5 * Math.sin(elapsed * .9 + k.phase);
      const size = k.size * (1 + glow * .65);
      ctx.globalAlpha = .25 + glow * .48;
      ctx.drawImage(sprites[k.tint], x - size * 3, y - size * 3, size * 6, size * 6);
      ctx.fillStyle = `rgba(${colors[k.tint]},.9)`;
      ctx.beginPath(); ctx.arc(x, y, .8 + glow * .65, 0, TAU); ctx.fill();
    }
    ctx.restore();
    for (const s of stars) {
      s.x += (3 + s.depth * 12) * dt;
      s.y -= (2 + s.depth * 10) * dt;
      if (s.x > width + 8) s.x = -8;
      if (s.y < -8) s.y = height + 8;
      const x = s.x - pointer.sx * (8 + s.depth * 42);
      const y = s.y - pointer.sy * (8 + s.depth * 42);
      const glow = .5 + .5 * Math.sin(elapsed * s.speed + s.phase);
      const alpha = .25 + glow * .65;
      ctx.fillStyle = `rgba(${colors[s.tint]},${alpha})`;
      ctx.beginPath(); ctx.arc(x, y, s.r, 0, TAU); ctx.fill();
      if (s.depth > .9) {
        const halo = s.r * (7 + glow * 4);
        ctx.globalAlpha = alpha * .6;
        ctx.drawImage(sprites[s.tint], x - halo, y - halo, halo * 2, halo * 2);
        ctx.globalAlpha = 1;
        const len = s.r * (3 + glow * 4);
        ctx.strokeStyle = `rgba(${colors[s.tint]},${alpha * .65})`;
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
      g.addColorStop(.3, `rgba(${colors[m.tint]},${a * .6})`);
      g.addColorStop(1, `rgba(${colors[m.tint]},0)`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke();
      ctx.globalAlpha = a * .8;
      ctx.drawImage(sprites[m.tint], m.x - 10, m.y - 10, 20, 20);
      ctx.globalAlpha = 1;
    }
  }

  function tick(now) {
    frame = null;
    if (paused || document.hidden) return;
    // 30fps leaves headroom for Clawd and page interactions at 2K/4K.
    if (!last || now - last >= 32) {
      const dt = last ? Math.min((now - last) / 1000, .08) : 0;
      last = now; elapsed += dt;
      if (elapsed > nextMeteor) { spawnMeteor(); nextMeteor = elapsed + rand(1.8, 3.8); }
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
