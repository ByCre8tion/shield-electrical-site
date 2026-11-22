/* Hero scene: a wireframe city at night. A line of current leaves the utility feed, runs the streets
   and powers one building: its edges and windows light and a radar ring pulses from its base.
   Then it moves to the next building. The word SHIELD sits behind the towers. */
import { stage, seeded, reduceMotion } from './stage.js';

const C = 10, G = 3.4, B = C - G, N = 5;
const VOLT = '242,207,74';

export function initCity() {
  document.querySelectorAll('[data-city]').forEach((cv) => {
    const rnd = seeded(7);
    const blds = [];
    for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
      if (rnd() < .16 || Math.hypot(i, j) > N + .6) continue; // a few empty lots and plazas
      const x0 = i * C, z0 = j * C, d = Math.hypot(i + 1, j + 1);
      const tall = Math.max(0, 1 - d / 4.6);
      const parts = rnd() < .45 ? 2 : 1, alongX = rnd() < .5;
      for (let p = 0; p < parts; p++) {
        const w = parts === 2 && alongX ? B / 2 - .3 : B, l = parts === 2 && !alongX ? B / 2 - .3 : B;
        const ox = parts === 2 && alongX ? p * (B / 2 + .3) : 0, oz = parts === 2 && !alongX ? p * (B / 2 + .3) : 0;
        const h = 1.2 + rnd() * 2.4 + (rnd() < .5 ? tall * tall * (12 + rnd() * 30) : tall * 6);
        blds.push({ x: x0 + ox, z: z0 + oz, w, l, h, i, j });
      }
    }
    const sx = (i) => i * C - G / 2;
    const targets = [[0, 0], [3, 2], [-2, 2], [2, -3]].map(([i, j]) => {
      const b = blds.filter((q) => q.i === i && q.j === j).sort((a, c) => c.h - a.h)[0];
      return b && { b, route: [[sx(i + 1), sx(-N) - C * 1.8], [sx(i + 1), sx(j) + C * .5], [b.x + b.w, sx(j) + C * .5]] };
    }).filter(Boolean);
    targets.forEach((t) => { t.len = t.route.slice(1).reduce((s, p, k) => s + Math.hypot(p[0] - t.route[k][0], p[1] - t.route[k][1]), 0); });

    let yaw = .62, pitch = .92, F = 1, ox = 0, oy = 0, D = 300, fontPx = 200, mobile = false;
    let tgt = 0, phase = 0;
    const TRAVEL = 2.4, HOLD = 4.2, FADE = .8;

    const scene = {
      build(st) {
        mobile = st.w < 760;
        const span = (2 * N + 1) * C;
        F = (mobile ? st.w * 1.05 : Math.min(st.w * .7, st.h * 1.2)) / span;
        ox = mobile ? st.w * .5 : st.w * .68; oy = mobile ? st.h * .62 : st.h * .6;
        fontPx = mobile ? st.w * .34 : Math.min(st.w * .2, 300);
      },
      draw(st, isStill) {
        const { ctx, w, h } = st;
        const ty = .62 + (st.inside ? (st.mx - .5) * .14 : 0);
        yaw += (ty - yaw) * .06;
        const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
        const P = (x, y, z) => {
          const X = x * cy - z * sy, Z = x * sy + z * cy;
          const depth = D - Z * cp - y * sp, s = F * D / depth;
          return [ox + X * s, oy + (Z * sp - y * cp) * s, depth];
        };

        // The word behind the skyline
        ctx.save();
        ctx.font = `600 ${fontPx}px "Sora Variable", Sora, system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        const wy = mobile ? h * .46 : h * .44;
        const grad = ctx.createLinearGradient(0, wy - fontPx * .8, 0, wy);
        grad.addColorStop(0, 'rgba(255,255,255,.16)'); grad.addColorStop(1, 'rgba(255,255,255,.03)');
        ctx.fillStyle = grad; ctx.letterSpacing = '-0.04em';
        ctx.fillText('SHIELD', ox, wy);
        ctx.restore();

        // Streets: faint ground lines
        ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.beginPath();
        for (let k = -N; k <= N + 1; k++) {
          const a = P(sx(k), 0, sx(-N) - C), b = P(sx(k), 0, sx(N + 1) + C); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
          const c = P(sx(-N) - C, 0, sx(k)), d = P(sx(N + 1) + C, 0, sx(k)); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]);
        }
        ctx.stroke();

        // Timeline
        const T = targets[tgt];
        if (!isStill) phase += st.dt; else phase = TRAVEL + 1;
        if (phase > TRAVEL + HOLD + FADE) { phase = 0; tgt = (tgt + 1) % targets.length; }
        const travel = Math.min(1, phase / TRAVEL), eased = travel < .5 ? 2 * travel * travel : 1 - Math.pow(-2 * travel + 2, 2) / 2;
        const fade = phase > TRAVEL + HOLD ? 1 - (phase - TRAVEL - HOLD) / FADE : 1;
        const lit = travel >= 1 ? fade : 0;

        // Buildings, far to near
        const list = blds.map((b) => ({ b, d: P(b.x + b.w / 2, b.h / 2, b.z + b.l / 2)[2] })).sort((a, c) => c.d - a.d);
        for (const { b } of list) drawBuilding(ctx, P, b, b === T.b ? lit : 0, sy, cy);

        // Route: whole path faint, travelled part bright
        const pts = T.route.map(([x, z]) => P(x, 0, z));
        ctx.setLineDash([3, 5]); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.beginPath();
        pts.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.setLineDash([]);
        let remain = eased * T.len, head = null;
        ctx.save(); ctx.strokeStyle = `rgba(${VOLT},${.95 * fade})`; ctx.lineWidth = 2; ctx.shadowColor = `rgba(${VOLT},.8)`; ctx.shadowBlur = 12; ctx.beginPath();
        for (let k = 1; k < T.route.length && remain > 0; k++) {
          const [ax, az] = T.route[k - 1], [bx, bz] = T.route[k], L = Math.hypot(bx - ax, bz - az), f = Math.min(1, remain / L);
          const a = P(ax, 0, az), b = P(ax + (bx - ax) * f, 0, az + (bz - az) * f);
          if (k === 1) ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); head = b; remain -= L;
        }
        ctx.stroke(); ctx.restore();

        // Utility feed marker
        const f0 = pts[0];
        ctx.fillStyle = `rgba(${VOLT},.9)`; ctx.fillRect(f0[0] - 3, f0[1] - 3, 6, 6);
        label(ctx, f0[0] - 10, f0[1] + 4, 'UTILITY FEED', 'rgba(255,255,255,.5)', 'right');

        // Current head
        if (head && travel < 1) {
          ctx.save(); ctx.fillStyle = 'rgba(255,240,190,1)'; ctx.shadowColor = `rgba(${VOLT},1)`; ctx.shadowBlur = 18;
          ctx.beginPath(); ctx.arc(head[0], head[1], 3.2, 0, 7); ctx.fill(); ctx.restore();
        }

        // Radar rings and label on the powered building
        if (lit > 0) {
          const bx = T.b.x + T.b.w / 2, bz = T.b.z + T.b.l / 2;
          const since = isStill ? 1.2 : phase - TRAVEL;
          for (let r = 0; r < 3; r++) {
            const k = ((since / 2.8) + r / 3) % 1, R = 3 + k * 26;
            ctx.strokeStyle = `rgba(${VOLT},${(1 - k) * .55 * lit})`; ctx.lineWidth = 1.2; ctx.beginPath();
            for (let a = 0; a <= 40; a++) { const t = a / 40 * Math.PI * 2, p = P(bx + Math.cos(t) * R, 0, bz + Math.sin(t) * R); a ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
            ctx.stroke();
          }
          const top = P(bx, T.b.h, bz), tag = [top[0] + 34, top[1] - 46];
          ctx.strokeStyle = `rgba(${VOLT},${.8 * lit})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(tag[0], tag[1] + 6); ctx.lineTo(tag[0] + 10, tag[1] + 6); ctx.stroke();
          ctx.globalAlpha = lit;
          label(ctx, tag[0] + 14, tag[1] + 2, `CIRCUIT 0${tgt + 1}`, `rgba(${VOLT},1)`, 'left');
          label(ctx, tag[0] + 14, tag[1] + 16, 'ENERGIZED  200A', 'rgba(237,237,237,.9)', 'left');
          ctx.globalAlpha = 1;
        }
      },
    };
    stage(cv, scene);
  });
}

function label(ctx, x, y, text, color, align) {
  ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace'; ctx.letterSpacing = '1.2px';
  ctx.textAlign = align; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.letterSpacing = '0px';
}

function drawBuilding(ctx, P, b, lit, sy, cy) {
  const { x, z, w, l, h } = b;
  const c = [[x, z], [x + w, z], [x + w, z + l], [x, z + l]];
  const top = c.map(([a, d]) => P(a, h, d)), bot = c.map(([a, d]) => P(a, 0, d));
  const faces = [];
  if (sy > 0) faces.push([1, 2]); else faces.push([3, 0]);   // +x or -x side
  if (cy > 0) faces.push([2, 3]); else faces.push([0, 1]);   // +z or -z side
  const edge = lit ? `rgba(${VOLT},${.35 + .6 * lit})` : 'rgba(255,255,255,.17)';
  for (const [m, n] of faces) {
    ctx.beginPath(); ctx.moveTo(bot[m][0], bot[m][1]); ctx.lineTo(bot[n][0], bot[n][1]); ctx.lineTo(top[n][0], top[n][1]); ctx.lineTo(top[m][0], top[m][1]); ctx.closePath();
    ctx.fillStyle = '#0c0c0d'; ctx.fill();
    // floor lines give the skeleton look
    ctx.strokeStyle = lit ? `rgba(${VOLT},${.18 * lit})` : 'rgba(255,255,255,.05)'; ctx.lineWidth = .7; ctx.beginPath();
    for (let y = 2.4; y < h - .5; y += 2.4) { const a = P(c[m][0], y, c[m][1]), d = P(c[n][0], y, c[n][1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(d[0], d[1]); }
    ctx.stroke();
    if (lit) { // windows
      ctx.fillStyle = `rgba(255,230,138,${.85 * lit})`;
      for (let y = 1.2; y < h - .8; y += 2.4) for (let f = .18; f < .9; f += .22) {
        const p = P(c[m][0] + (c[n][0] - c[m][0]) * f, y, c[m][1] + (c[n][1] - c[m][1]) * f); ctx.fillRect(p[0] - .9, p[1] - .9, 1.8, 1.8);
      }
    }
    ctx.strokeStyle = edge; ctx.lineWidth = lit ? 1.1 : .8;
    ctx.beginPath(); ctx.moveTo(bot[m][0], bot[m][1]); ctx.lineTo(top[m][0], top[m][1]); ctx.moveTo(bot[n][0], bot[n][1]); ctx.lineTo(top[n][0], top[n][1]); ctx.stroke();
  }
  ctx.beginPath(); top.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
  ctx.fillStyle = lit ? `rgba(242,207,74,${.08 * lit})` : '#111213'; ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = lit ? 1.1 : .8; ctx.stroke();
}
