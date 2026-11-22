/* Footer globe: grey land particles on a slowly turning earth, Arizona lit in yellow,
   with pings at Scottsdale. Data (public/data/globe.json) loads only when the globe nears view. */
import { stage } from './stage.js';

const HQ = [-111.93, 33.49];
const R2D = Math.PI / 180;

export function initGlobes() {
  document.querySelectorAll('[data-globe]').forEach((cv) => {
    let data = null, asked = false;
    const load = () => { if (asked) return; asked = true; fetch('/data/globe.json').then((r) => r.json()).then((d) => { data = d; }).catch(() => {}); };
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { load(); o.disconnect(); } }, { rootMargin: '600px' }).observe(cv);

    stage(cv, {
      draw(st, still) {
        const { ctx, w, h, t } = st;
        const R = Math.min(w, h) * .46, cx = w / 2, cy = h / 2;
        const lon0 = -104 + (still ? 0 : Math.sin(t * .09) * 38) + (st.inside ? (st.mx - .5) * 30 : 0);
        const lat0 = 24 + (st.inside ? (st.my - .5) * -14 : 0);
        const cl = Math.cos(lat0 * R2D), sl = Math.sin(lat0 * R2D);
        const P = (lon, lat) => {
          const l = (lon - lon0) * R2D, p = lat * R2D;
          const x = Math.cos(p) * Math.sin(l), y = cl * Math.sin(p) - sl * Math.cos(p) * Math.cos(l), z = sl * Math.sin(p) + cl * Math.cos(p) * Math.cos(l);
          return [cx + x * R, cy - y * R, z];
        };
        // rim and graticule
        ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.035)';
        for (let lat = -60; lat <= 60; lat += 30) { ctx.beginPath(); let on = false; for (let lon = -180; lon <= 180; lon += 4) { const p = P(lon, lat); if (p[2] > 0) { on ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); on = true; } else on = false; } ctx.stroke(); }
        for (let lon = -180; lon < 180; lon += 30) { ctx.beginPath(); let on = false; for (let lat = -80; lat <= 80; lat += 4) { const p = P(lon, lat); if (p[2] > 0) { on ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); on = true; } else on = false; } ctx.stroke(); }
        if (!data) return;
        for (const [lon, lat] of data.land) {
          const p = P(lon, lat); if (p[2] <= 0) continue;
          ctx.fillStyle = `rgba(237,237,237,${.12 + p[2] * .5})`; ctx.fillRect(p[0] - .9, p[1] - .9, 1.8, 1.8);
        }
        ctx.save(); ctx.shadowColor = 'rgba(242,207,74,.9)'; ctx.shadowBlur = 6; ctx.fillStyle = 'rgba(242,207,74,.95)';
        for (const [lon, lat] of data.az) { const p = P(lon, lat); if (p[2] <= 0) continue; ctx.fillRect(p[0] - 1, p[1] - 1, 2, 2); }
        ctx.restore();
        const hq = P(HQ[0], HQ[1]);
        if (hq[2] > 0) {
          for (let k = 0; k < 3; k++) {
            const f = (((still ? .4 : t) / 2.6) + k / 3) % 1;
            ctx.strokeStyle = `rgba(242,207,74,${(1 - f) * .7})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(hq[0], hq[1], 4 + f * 34, 0, 7); ctx.stroke();
          }
          ctx.fillStyle = '#FFE68A'; ctx.beginPath(); ctx.arc(hq[0], hq[1], 3, 0, 7); ctx.fill();
          ctx.strokeStyle = 'rgba(242,207,74,.7)'; ctx.beginPath(); ctx.moveTo(hq[0], hq[1]); ctx.lineTo(hq[0] + 46, hq[1] - 40); ctx.lineTo(hq[0] + 58, hq[1] - 40); ctx.stroke();
          ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace'; ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(242,207,74,1)'; ctx.fillText('SHIELD', hq[0] + 62, hq[1] - 43);
          ctx.fillStyle = 'rgba(237,237,237,.75)'; ctx.fillText('SCOTTSDALE, AZ', hq[0] + 62, hq[1] - 30);
        }
      },
    });
  });
}
