// A sunrise behind the hero: stars fade, the sun lifts over three ridgelines, clouds drift.
// Drawn on one canvas. With reduced motion it renders a single still frame.

function seeded(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RIDGES = [
  { base: 0.8, amp: 0.085, color: [52, 40, 44], warm: 0.5, seed: 3 },
  { base: 0.87, amp: 0.07, color: [30, 26, 27], warm: 0.2, seed: 11 },
  { base: 0.945, amp: 0.045, color: [15, 15, 14], warm: 0, seed: 23 },
];
const CLOUDS = [
  { top: 0.16, bottom: 0.4, count: 5, color: "196, 202, 216", alpha: 0.085, speed: 5, seed: 5 },
  { top: 0.46, bottom: 0.68, count: 5, color: "255, 198, 152", alpha: 0.11, speed: 11, seed: 9 },
];

export function initSky(canvas) {
  const ctx = canvas.getContext("2d");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let w = 0;
  let h = 0;
  let stars = [];
  let ridges = [];
  let tiles = [];
  let started = 0;
  let last = 0;
  let frame = 0;
  let onScreen = true;

  function cloudTile(layer, tileWidth) {
    const tile = document.createElement("canvas");
    const dpr = canvas.width / w;
    tile.width = tileWidth * dpr;
    tile.height = canvas.height;
    const c = tile.getContext("2d");
    c.scale(dpr, dpr);
    const rand = seeded(layer.seed);
    for (let i = 0; i < layer.count; i++) {
      const cx = ((i + rand() * 0.7) / layer.count) * tileWidth;
      const cy = (layer.top + rand() * (layer.bottom - layer.top)) * h;
      const span = 240 + rand() * 320;
      for (let p = 0; p < 12; p++) {
        const px = cx + (rand() - 0.5) * span;
        const py = cy + (rand() - 0.5) * span * 0.1;
        const r = span * (0.14 + rand() * 0.16);
        // Draw each puff three times so the tile wraps without a seam.
        for (const shift of [-tileWidth, 0, tileWidth]) {
          c.save();
          c.translate(px + shift, py);
          c.scale(1, 0.42);
          const g = c.createRadialGradient(0, 0, 0, 0, 0, r);
          g.addColorStop(0, `rgba(${layer.color}, ${layer.alpha})`);
          g.addColorStop(1, `rgba(${layer.color}, 0)`);
          c.fillStyle = g;
          c.beginPath();
          c.arc(0, 0, r, 0, Math.PI * 2);
          c.fill();
          c.restore();
        }
      }
    }
    return { tile, tileWidth, speed: layer.speed };
  }

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rand = seeded(42);
    stars = Array.from({ length: Math.round(w / 14) }, () => ({
      x: rand() * w,
      y: rand() * h * 0.58,
      r: 0.4 + rand() * 0.9,
      a: 0.25 + rand() * 0.55,
      phase: rand() * 6.28,
    }));

    ridges = RIDGES.map((ridge) => {
      const r = seeded(ridge.seed);
      const waves = [
        [0.0034 + r() * 0.0018, r() * 6.28, 0.5],
        [0.0092 + r() * 0.004, r() * 6.28, 0.32],
        [0.024 + r() * 0.008, r() * 6.28, 0.18],
      ];
      const points = [];
      for (let x = 0; x <= w + 8; x += 8) {
        let y = 0;
        for (const [f, p, k] of waves) y += Math.sin(x * f + p) * k;
        points.push([x, (ridge.base + y * ridge.amp) * h]);
      }
      return { ...ridge, points };
    });

    tiles = CLOUDS.map((layer) => cloudTile(layer, Math.max(w * 1.4, 1100)));
  }

  function draw(now) {
    const t = still ? 60 : (now - started) / 1000;
    const rise = still ? 1 : 1 - Math.pow(1 - Math.min(t / 7, 1), 3);
    const horizon = h * 0.8;
    const sunR = Math.max(26, Math.min(Math.min(w, h) * 0.06, 54));
    const sunX = w * (w < 720 ? 0.74 : 0.565);
    const sunY = horizon + sunR * 1.3 - rise * sunR * 2.9;

    ctx.fillStyle = "#0f0f0e";
    ctx.fillRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "rgba(20, 22, 32, 0)");
    sky.addColorStop(0.55, `rgba(30, 30, 46, ${0.55 + 0.25 * rise})`);
    sky.addColorStop(0.85, `rgba(78, 52, 58, ${0.4 + 0.4 * rise})`);
    sky.addColorStop(1, `rgba(150, 88, 58, ${0.25 + 0.5 * rise})`);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon);

    for (const s of stars) {
      const twinkle = still ? 1 : 0.8 + 0.2 * Math.sin(t * 1.3 + s.phase);
      ctx.fillStyle = `rgba(236, 232, 225, ${s.a * twinkle * (1 - 0.75 * rise)})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const glowR = Math.max(w * 0.42, 360);
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, glowR);
    const g = 0.3 + 0.7 * rise;
    glow.addColorStop(0, `rgba(255, 196, 132, ${0.5 * g})`);
    glow.addColorStop(0.3, `rgba(255, 158, 108, ${0.16 * g})`);
    glow.addColorStop(1, "rgba(255, 150, 100, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 1.3);
    sun.addColorStop(0, "rgba(255, 244, 222, 1)");
    sun.addColorStop(0.7, "rgba(255, 214, 150, 1)");
    sun.addColorStop(0.78, "rgba(255, 200, 130, 0.5)");
    sun.addColorStop(1, "rgba(255, 190, 120, 0)");
    ctx.fillStyle = sun;
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR * 1.3, 0, Math.PI * 2);
    ctx.fill();

    for (const { tile, tileWidth, speed } of tiles) {
      const offset = (t * speed) % tileWidth;
      ctx.drawImage(tile, -offset, 0, tileWidth, h);
      ctx.drawImage(tile, tileWidth - offset, 0, tileWidth, h);
    }

    for (const ridge of ridges) {
      const [r0, g0, b0] = ridge.color;
      const lit = ridge.warm * rise;
      ctx.fillStyle = `rgb(${Math.round(r0 + 46 * lit)}, ${Math.round(g0 + 20 * lit)}, ${Math.round(b0 + 8 * lit)})`;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (const [x, y] of ridge.points) ctx.lineTo(x, y);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
  }

  function loop(now) {
    frame = 0;
    if (!onScreen || document.hidden) return;
    if (now - last > 32) {
      last = now;
      draw(now);
    }
    frame = requestAnimationFrame(loop);
  }
  const resume = () => {
    if (!still && !frame) frame = requestAnimationFrame(loop);
  };

  build();
  started = performance.now();
  draw(started);
  resume();

  let resizeTimer;
  new ResizeObserver(() => {
    if (canvas.clientWidth === w && canvas.clientHeight === h) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      draw(performance.now());
    }, 120);
  }).observe(canvas);
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    resume();
  }).observe(canvas);
  document.addEventListener("visibilitychange", resume);
}
