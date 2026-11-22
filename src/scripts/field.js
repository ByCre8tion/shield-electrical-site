/* Charged field: a terrain of tiny yellow dots that swells slowly like current over ground.
   The cursor pushes a wave through it. Drawn behind the panel check. */
import { stage } from './stage.js';

export function initFields() {
  document.querySelectorAll('[data-field]').forEach((cv) => {
    const COLS = 120, ROWS = 46;
    let wave = 0;
    stage(cv, {
      maxDpr: 1.5,
      draw(st, still) {
        const { ctx, w, h, t } = st;
        const horizon = h * .18, cx = w / 2;
        if (st.inside) wave = Math.min(1, wave + st.dt * 2); else wave = Math.max(0, wave - st.dt);
        for (let r = 0; r < ROWS; r++) {
          const z = r / (ROWS - 1);                 // 0 far, 1 near
          const persp = .25 + z * z * 1.6;
          const rowY = horizon + (h - horizon) * Math.pow(z, 1.7);
          for (let c = 0; c < COLS; c++) {
            const u = c / (COLS - 1) - .5;
            const x = cx + u * w * persp * 1.35;
            if (x < -10 || x > w + 10) continue;
            let y0 = Math.sin(u * 7 + t * .55 + z * 4) * .55 + Math.sin(u * 13 - t * .35 + z * 9) * .3 + Math.sin(z * 6 - t * .7) * .4;
            let hgt = y0;
            if (wave > 0) {
              const dx = x - st.px, dy = rowY - st.py, d = Math.hypot(dx, dy);
              hgt += Math.exp(-d / 160) * Math.sin(d / 18 - t * 6) * 1.4 * wave;
            }
            const y = rowY - hgt * 14 * persp;
            const a = Math.max(.08, Math.min(1, (.42 + hgt * .4) * (.3 + z * .95)));
            const s = 1 + z * 1.6;
            ctx.fillStyle = `rgba(242,207,74,${a})`;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          }
        }
      },
    });
  });
}
