/* The live circuit: orthogonal brass traces, pulses of current, cursor energizing, rare short arcs.
   30fps cap, pauses offscreen and in background tabs, static for reduced motion. */
export function initCircuits() {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  document.querySelectorAll('[data-circuit]').forEach((cv) => field(cv, reduce, coarse));
}

function field(cv, reduce, coarse) {
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const host = cv.parentElement;
  const G = 44, density = +cv.dataset.density || 1;
  let W = 0, H = 0, traces = [], pulses = [], arcs = [], mouse = { x: -999, y: -999 };
  const rnd = (a, b) => a + Math.random() * (b - a), ri = (a, b) => Math.floor(rnd(a, b + 1));

  function build() {
    const r = cv.getBoundingClientRect(); W = r.width; H = r.height; if (!W || !H) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cols = Math.ceil(W / G), rows = Math.ceil(H / G), n = Math.max(6, Math.round((cols * rows / 9) * density));
    traces = [];
    for (let i = 0; i < n; i++) {
      let x = ri(0, cols) * G, y = ri(0, rows) * G, dir = ri(0, 3); const pts = [[x, y]];
      for (let s = 0, segs = ri(2, 6); s < segs; s++) {
        if (s) dir = (dir + (Math.random() < .5 ? 1 : 3)) % 4;
        const len = ri(1, 5) * G; x += [len, 0, -len, 0][dir]; y += [0, len, 0, -len][dir]; pts.push([x, y]);
      }
      const seg = []; let L = 0;
      for (let k = 1; k < pts.length; k++) { const l = Math.abs(pts[k][0] - pts[k - 1][0]) + Math.abs(pts[k][1] - pts[k - 1][1]); seg.push(l); L += l; }
      traces.push({ pts, seg, L });
    }
    pulses = []; arcs = [];
  }
  const at = (t, d) => { let k = 0; while (k < t.seg.length - 1 && d > t.seg[k]) { d -= t.seg[k]; k++; } const a = t.pts[k], b = t.pts[k + 1], f = Math.min(1, d / t.seg[k]); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };

  function drawTraces() {
    ctx.lineWidth = 1;
    for (const t of traces) {
      for (let k = 1; k < t.pts.length; k++) {
        const [x1, y1] = t.pts[k - 1], [x2, y2] = t.pts[k];
        const d = Math.hypot((x1 + x2) / 2 - mouse.x, (y1 + y2) / 2 - mouse.y), near = Math.max(0, 1 - d / 160);
        ctx.strokeStyle = `rgba(207,170,102,${0.085 + near * 0.32})`;
        ctx.beginPath(); ctx.moveTo(x1 + .5, y1 + .5); ctx.lineTo(x2 + .5, y2 + .5); ctx.stroke();
      }
      const e = t.pts[t.pts.length - 1]; ctx.fillStyle = 'rgba(207,170,102,.26)'; ctx.fillRect(e[0] - 1.5, e[1] - 1.5, 3, 3);
    }
  }
  function drawPulses(dt) {
    if (traces.length && pulses.length < Math.max(3, traces.length / 10) && Math.random() < .08) pulses.push({ t: traces[ri(0, traces.length - 1)], d: 0, v: rnd(160, 320) });
    pulses = pulses.filter((p) => p.d < p.t.L + 120);
    for (const p of pulses) {
      p.d += p.v * dt;
      for (let s = 0; s < 30; s++) {
        const dd = p.d - s * 4; if (dd < 0 || dd > p.t.L) continue;
        const [x, y] = at(p.t, dd), a = (1 - s / 30) * .9, z = s < 2 ? 2.5 : 1.5;
        ctx.fillStyle = s < 2 ? `rgba(255,246,216,${a})` : `rgba(251,219,155,${a * .7})`;
        ctx.fillRect(x - z / 2, y - z / 2, z, z);
      }
    }
  }
  let nextArc = performance.now() + 2500;
  const bolt = (x1, y1, x2, y2) => { const p = [[x1, y1]], n = ri(3, 5); for (let i = 1; i < n; i++) { const f = i / n; p.push([x1 + (x2 - x1) * f + rnd(-14, 14), y1 + (y2 - y1) * f + rnd(-14, 14)]); } p.push([x2, y2]); return p; };
  function drawArcs(now) {
    if (now > nextArc && traces.length) {
      const a = traces[ri(0, traces.length - 1)].pts.at(-1), b = [a[0] + ri(-3, 3) * G, a[1] + ri(-2, 2) * G];
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 50) arcs.push({ start: now, a, b, pts: bolt(a[0], a[1], b[0], b[1]) });
      nextArc = now + rnd(6000, 9000);
    }
    arcs = arcs.filter((r) => now - r.start < 220);
    for (const r of arcs) {
      const t = now - r.start; if (t > 90 && t < 130) continue; if (t > 130 && Math.random() < .5) r.pts = bolt(r.a[0], r.a[1], r.b[0], r.b[1]);
      ctx.save(); ctx.shadowColor = 'rgba(251,219,155,.9)'; ctx.shadowBlur = 14; ctx.strokeStyle = 'rgba(255,246,216,.95)'; ctx.lineWidth = 1.25;
      ctx.beginPath(); r.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.restore();
    }
  }

  let last = 0, raf = 0, running = false, visible = false;
  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return; const dt = Math.min(.05, (now - last) / 1000); last = now;
    ctx.clearRect(0, 0, W, H); drawTraces(); drawPulses(dt); drawArcs(now);
  };
  const start = () => { if (running || reduce || !visible || document.hidden) return; running = true; last = performance.now(); raf = requestAnimationFrame(frame); };
  const stop = () => { running = false; cancelAnimationFrame(raf); };
  const still = () => { ctx.clearRect(0, 0, W, H); drawTraces(); };

  build(); still();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (!running) still(); }, 150); });
  if (!coarse) {
    host.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
    host.addEventListener('pointerleave', () => { mouse = { x: -999, y: -999 }; });
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(cv);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
