/* Shared canvas stage for every drawn scene on the site.
   Handles pixel ratio, resizing, a 30fps cap, pausing offscreen and in hidden tabs,
   pointer position, and a single still frame for people who prefer reduced motion. */
export const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

export function stage(cv, scene) {
  const ctx = cv.getContext('2d'); if (!ctx) return;
  const host = scene.host || cv.parentElement;
  const st = { ctx, cv, w: 0, h: 0, t: 0, dt: 0, mx: .5, my: .5, px: -9999, py: -9999, inside: false, visible: false, dpr: 1 };
  let raf = 0, last = 0, acc = 0;

  const size = () => {
    const r = cv.getBoundingClientRect(); if (!r.width || !r.height) return false;
    st.dpr = Math.min(scene.maxDpr || 2, devicePixelRatio || 1);
    st.w = r.width; st.h = r.height;
    cv.width = Math.round(r.width * st.dpr); cv.height = Math.round(r.height * st.dpr);
    ctx.setTransform(st.dpr, 0, 0, st.dpr, 0, 0);
    scene.build && scene.build(st);
    return true;
  };
  const still = () => { if (!st.w && !size()) return; ctx.clearRect(0, 0, st.w, st.h); scene.draw(st, true); };

  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    const d = last ? now - last : 33; last = now; acc += d;
    if (acc < 33) return;
    st.dt = Math.min(acc, 100) / 1000; st.t += st.dt; acc = 0;
    ctx.clearRect(0, 0, st.w, st.h); scene.draw(st, false);
  };
  const play = () => { if (raf || reduceMotion || document.hidden || !st.visible) return; last = 0; raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  new ResizeObserver(() => { if (size()) (raf ? null : still()); }).observe(cv);
  new IntersectionObserver(([e]) => { st.visible = e.isIntersecting; st.visible ? play() : stop(); }, { rootMargin: '80px' }).observe(cv);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  if (finePointer && !reduceMotion) {
    host.addEventListener('pointermove', (e) => {
      const r = cv.getBoundingClientRect();
      st.px = e.clientX - r.left; st.py = e.clientY - r.top; st.mx = st.px / r.width; st.my = st.py / r.height; st.inside = true;
    });
    host.addEventListener('pointerleave', () => { st.inside = false; st.px = st.py = -9999; });
  }
  size(); still();
  return st;
}

/* Small seeded random so scenes look the same on every visit */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
