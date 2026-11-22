/* Particle wordmark above the footer: SHIELD drawn in fine grey particles that drift home
   and scatter away from the cursor, like dust in a beam of light. */
import { stage } from './stage.js';

export function initWordmarks() {
  document.querySelectorAll('[data-wordmark]').forEach((cv) => {
    let parts = [];
    stage(cv, {
      maxDpr: 1.5,
      build(st) {
        const { w, h } = st, off = document.createElement('canvas'), o = off.getContext('2d');
        off.width = Math.round(w); off.height = Math.round(h);
        const fs = Math.min(h * 1.05, w * .22);
        o.font = `600 ${fs}px "Sora Variable", Sora, system-ui, sans-serif`; o.textAlign = 'center'; o.textBaseline = 'middle';
        o.fillStyle = '#fff'; o.fillText('SHIELD', w / 2, h * .55);
        const img = o.getImageData(0, 0, off.width, off.height).data, gap = w < 700 ? 3 : 4;
        parts = [];
        for (let y = 0; y < off.height; y += gap) for (let x = 0; x < off.width; x += gap) {
          if (img[(y * off.width + x) * 4 + 3] > 128) parts.push({ hx: x, hy: y, x: x + (Math.random() - .5) * 40, y: y + (Math.random() - .5) * 40, vx: 0, vy: 0, a: .25 + Math.random() * .6, gold: Math.random() < .035 });
        }
      },
      draw(st, still) {
        const { ctx, t } = st;
        for (const p of parts) {
          if (!still) {
            const dx = p.x - st.px, dy = p.y - st.py, d2 = dx * dx + dy * dy;
            if (d2 < 9000) { const f = (1 - d2 / 9000) * 2.2; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
            p.vx += (p.hx - p.x) * .035 + Math.sin(t * .8 + p.hy * .05) * .04; p.vy += (p.hy - p.y) * .035;
            p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
          } else { p.x = p.hx; p.y = p.hy; }
          ctx.fillStyle = p.gold ? `rgba(242,207,74,${p.a})` : `rgba(237,237,237,${p.a * .55})`;
          ctx.fillRect(p.x, p.y, 1.4, 1.4);
        }
      },
    });
  });
}
