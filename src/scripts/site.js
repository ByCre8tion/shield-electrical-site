/* Site behavior: menu, open now status, reveals, energized rules, meters, forms, reviews pause */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSite(company) {
  document.documentElement.classList.add('js');
  scrolled(); menu(); openStatus(company); reveals(); meters(); forms(); reviews(); conductor(); panelCheck(); odometers(); spotlights(); compares(); powerPath(); clock(); rings(); directory();
}

/* Path of power: scroll progress through the pinned story, written to --p.
   A passive listener is attached only while the section is on screen. */
function powerPath() {
  $$('[data-powerpath]').forEach((el) => {
    const steps = [...el.querySelectorAll('[data-step]')];
    const set = (p) => {
      el.style.setProperty('--p', p.toFixed(3));
      const s = p < .2 ? 0 : p < .45 ? 1 : p < .7 ? 2 : 3;
      if (el.dataset.s !== String(s)) { el.dataset.s = s; steps.forEach((li, i) => li.classList.toggle('on', i === s)); }
    };
    if (reduce || matchMedia('(max-width: 900px)').matches) return set(1);
    let ticking = false, active = false;
    const upd = () => { ticking = false; const r = el.getBoundingClientRect(); set(Math.min(1, Math.max(0, -r.top / (r.height - innerHeight)))); };
    const on = () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !active) { active = true; addEventListener('scroll', on, { passive: true }); upd(); }
      else if (!e.isIntersecting && active) { active = false; removeEventListener('scroll', on); }
    }).observe(el);
    set(0);
  });
}

/* Circuit directory: a spec card follows the cursor over the service rows (pointer devices only) */
function directory() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  $$('[data-dir]').forEach((dir) => {
    const cards = $$('[data-dir-card]', dir), peek = $('.dir-peek', dir);
    let raf = 0, x = 0, y = 0;
    const place = () => { raf = 0; peek.style.setProperty('--px', `${x}px`); peek.style.setProperty('--py', `${y}px`); };
    dir.addEventListener('pointermove', (e) => {
      const r = dir.getBoundingClientRect();
      x = Math.min(e.clientX - r.left + 28, r.width - 290); y = e.clientY - r.top - 90;
      if (!raf) raf = requestAnimationFrame(place);
    });
    $$('[data-dir-row]', dir).forEach((a) => a.addEventListener('pointerenter', () => {
      cards.forEach((c) => c.classList.toggle('on', c.dataset.dirCard === a.dataset.dirRow));
      dir.classList.add('peek');
    }));
    dir.addEventListener('pointerleave', () => dir.classList.remove('peek'));
  });
}

/* Valley time for HUD readouts. Arizona has no daylight saving. */
function clock() {
  const els = $$('[data-clock]');
  const f = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', hour: '2-digit', minute: '2-digit', hour12: false });
  const tick = () => els.forEach((e) => { e.textContent = f.format(new Date()); });
  const d = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', month: 'short', day: 'numeric', year: 'numeric' });
  $$('[data-today]').forEach((e) => { e.textContent = `New request · ${d.format(new Date())}`; });
  tick(); setInterval(tick, 30000);
}

/* Coverage ring draws in once when seen */
function rings() {
  $$('[data-ring]').forEach((el) => {
    if (reduce) return el.classList.add('drawn');
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { el.classList.add('drawn'); o.disconnect(); } }, { threshold: .35 }).observe(el);
  });
}

function scrolled() {
  const s = document.createElement('div'); s.style.cssText = 'position:absolute;top:0;height:24px;width:1px;pointer-events:none';
  document.body.prepend(s);
  new IntersectionObserver(([e]) => document.documentElement.classList.toggle('scrolled', !e.isIntersecting)).observe(s);
}

function menu() {
  const btn = $('[data-menu]'), sheet = $('#sheet'); if (!btn || !sheet) return;
  const main = $('#main'), foot = $('footer');
  const set = (open) => {
    btn.setAttribute('aria-expanded', open); sheet.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    document.documentElement.style.overflow = open ? 'hidden' : '';
    [main, foot].forEach((el) => el && (el.inert = open));
    if (open) $('a', sheet)?.focus();
  };
  btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { set(false); btn.focus(); } });
  matchMedia('(min-width: 1081px)').addEventListener('change', (m) => m.matches && set(false));
}

/* Open now, from real hours in Arizona time (no daylight saving) */
function openStatus(c) {
  const els = $$('[data-open-status]'); if (!els.length || !c) return;
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Phoenix', weekday: 'short', hour: 'numeric', hour12: false }).formatToParts(new Date());
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.find((p) => p.type === 'weekday').value);
  const hour = +parts.find((p) => p.type === 'hour').value % 24;
  const open = c.open.days.includes(day) && hour >= c.open.from && hour < c.open.to;
  let text;
  if (open) text = `Open now · until ${c.open.to - 12}pm`;
  else {
    const today = c.open.days.includes(day) && hour < c.open.from;
    let n = 1; while (!c.open.days.includes((day + n) % 7)) n++;
    const when = today ? 'today' : n === 1 ? 'tomorrow' : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(day + n) % 7];
    text = `Closed · opens ${when} ${c.open.from}am`;
  }
  els.forEach((el) => { $('.led', el)?.classList.toggle('on', open); const t = $('[data-open-text]', el); if (t) t.textContent = text; });
}

function reveals() {
  const items = $$('[data-on]');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach((e) => e.classList.add('lit')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, sib = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-on')) : [];
    el.style.animationDelay = Math.min(Math.max(sib.indexOf(el), 0), 5) * 90 + 'ms';
    el.classList.add('lit'); io.unobserve(el);
  }), { rootMargin: '0px 0px -6% 0px' });
  items.forEach((e) => io.observe(e));
}

/* Process conductor: current fills the line as the section crosses the viewport, nodes light as it reaches them */
function conductor() {
  const c = $('[data-conductor]'); if (!c) return;
  const steps = $$('.cond-step', c);
  const set = (p) => { c.style.setProperty('--p', p); steps.forEach((s, i) => s.classList.toggle('on', p >= i / Math.max(1, steps.length - 1) - .001)); };
  if (reduce) { set(1); return; }
  /* Fine grained thresholds stand in for a scroll listener; progress only ever moves forward */
  let best = 0;
  const io = new IntersectionObserver(([e]) => {
    const r = c.getBoundingClientRect(), vh = innerHeight;
    const p = Math.min(1, Math.max(0, (vh * .85 - r.top) / (vh * .5)));
    if (p > best) { best = p; set(p); }
    if (best >= 1) io.disconnect();
  }, { threshold: Array.from({ length: 41 }, (_, i) => i / 40) });
  io.observe(c.closest('section') || c);
}

/* Panel check: a rough, honest guide to whether a panel has room for what someone wants to add */
function panelCheck() {
  const root = $('[data-panel-check]'); if (!root) return;
  const form = $('form', root), verdict = $('[data-pc-verdict]', root), why = $('[data-pc-why]', root);
  const est = $('[data-pc-est]', root), cap = $('[data-pc-cap]', root);
  const load = { ev: 40, spa: 50, casita: 50, kitchen: 40 };
  const run = () => {
    const amps = +form.amps.value, ac = form.ac.value === '1';
    const adds = $$('input[name=add]:checked', form).map((i) => i.value);
    const want = adds.reduce((t, a) => t + load[a], 0);
    const base = (ac ? 45 : 15) + 40;
    let state, v, w, frac;
    if (!amps) {
      state = 'unknown'; v = 'Send us a photo of your panel'; w = 'The label on the main breaker tells us the size. We check it before quoting.'; frac = .5;
      est.textContent = `${base + want}A`; cap.textContent = 'unknown';
    } else {
      const usable = amps * .8, room = usable - base;
      frac = Math.min(1.25, (base + want) / usable) / 1.25;
      est.textContent = `${base + want}A`; cap.textContent = `${Math.round(usable)}A`;
      if (!adds.length) { state = 'ok'; v = 'Your panel is likely fine as is'; w = 'Add what you are planning to see if there is room.'; }
      else if (want <= room * .6) { state = 'ok'; v = 'Likely room to add this'; w = `A ${amps}A panel usually carries this, with a load check first.`; }
      else if (want <= room) { state = 'ok'; v = 'Possible with load management'; w = 'It may fit with a load management device instead of a full upgrade.'; }
      else { state = 'warn'; v = 'Plan on a panel upgrade'; w = `A ${amps}A panel${ac ? ' with central AC' : ''} rarely has room for ${adds.length > 1 ? 'all of this' : 'this'}.`; }
    }
    root.dataset.state = state; root.style.setProperty('--ang', `${-90 + frac * 180}deg`);
    verdict.textContent = v; why.textContent = w;
  };
  form.addEventListener('change', run); run();
}

/* Odometer: digits printed on drums behind a window; they roll into place once when seen.
   Mechanical Odometer pattern (21st.dev), rebuilt without a framework. */
function odometers() {
  $$('[data-odo]').forEach((el) => {
    const txt = String(el.dataset.odo);
    el.setAttribute('aria-label', txt); el.textContent = '';
    const drums = [...txt].map((ch, i) => {
      const w = document.createElement('span'); w.className = 'odo-w'; w.setAttribute('aria-hidden', 'true');
      if (!/\d/.test(ch)) { w.textContent = ch; w.classList.add('odo-sep'); el.append(w); return null; }
      const d = document.createElement('span'); d.className = 'odo-d';
      d.innerHTML = '0123456789'.split('').map((n) => `<span>${n}</span>`).join('');
      d.style.transitionDelay = `${i * 60}ms`; w.append(d); el.append(w);
      return [d, +ch];
    }).filter(Boolean);
    const set = () => drums.forEach(([d, n]) => { d.style.translate = `0 ${-n * 10}%`; });
    if (reduce) return set();
    new IntersectionObserver(([e], o) => { if (!e.isIntersecting) return; o.disconnect(); requestAnimationFrame(set); }, { threshold: .6 }).observe(el);
  });
}

/* Spotlight: a soft gold radial follows the pointer inside a tile */
function spotlights() {
  if (!matchMedia('(hover:hover)').matches) return;
  $$('[data-spot]').forEach((el) => el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }));
}

/* Before and after: a range input drives the divider, so keyboard and touch work for free */
function compares() {
  $$('[data-compare]').forEach((el) => {
    const r = el.querySelector('input[type=range]');
    const upd = () => el.style.setProperty('--pos', `${r.value}%`);
    r.addEventListener('input', upd); upd();
  });
}

function meters() {
  $$('[data-meter]').forEach((el) => {
    const to = +el.dataset.meter, from = +(el.dataset.from || 0); el.textContent = to;
    if (reduce) return;
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const tick = (n) => { const k = Math.min(1, (n - t0) / 1400); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      el.textContent = from; requestAnimationFrame(tick);
    }, { threshold: .6 }).observe(el);
  });
}

export const fmtPhone = (v) => { const d = v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10); return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };

/* Forms: validate in words, format phones, preview attachments, then show the sent state.
   data-endpoint on the form is filled in when the backend is connected. */
function forms() {
  $$('form[data-form]').forEach((form) => {
    const fields = $$('input, select, textarea', form).filter((f) => f.dataset.msg);
    const check = (f) => {
      let ok = f.type === 'file' ? true : f.type === 'radio' ? !!form.querySelector(`input[name="${f.name}"]:checked`) : f.value.trim().length > 0;
      if (f.type === 'tel' && ok) ok = f.value.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').length === 10;
      if (f.type === 'email' && f.value.trim()) ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (f.type === 'email' && !f.required && !f.value.trim()) ok = true;
      const err = $('#' + f.id + '-err', form);
      f.setAttribute('aria-invalid', String(!ok));
      if (err) err.textContent = ok ? '' : f.dataset.msg;
      return ok;
    };
    fields.forEach((f) => {
      f.addEventListener('input', () => { if (f.getAttribute('aria-invalid') === 'true') check(f); });
      if (f.type === 'radio') $$(`input[name="${f.name}"]`, form).forEach((r) => r.addEventListener('change', () => check(f)));
      f.addEventListener('blur', () => { if (f.value) check(f); });
    });
    $$('input[type=tel]', form).forEach((t) => t.addEventListener('input', () => { t.value = fmtPhone(t.value); }));
    $$('input[type=file]', form).forEach((inp) => {
      const out = $('#' + inp.id + '-list', form);
      inp.addEventListener('change', () => {
        const files = [...inp.files], big = files.find((f) => f.size > 10 * 1024 * 1024);
        if (out) out.textContent = big ? `${big.name} is over 10 MB. Choose a smaller file.` : files.map((f) => f.name).join(', ');
        if (big) inp.value = '';
      });
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const bad = fields.filter((f) => !check(f));
      if (bad.length) { bad[0].focus(); return; }
      const btn = $('button[type=submit]', form), lab = $('[data-btn-label]', btn) || btn, label = lab.textContent;
      btn.disabled = true; lab.textContent = 'Sending';
      try {
        const ep = form.dataset.endpoint;
        if (ep) { const r = await fetch(ep, { method: 'POST', body: new FormData(form) }); if (!r.ok) throw new Error('send'); }
        else await new Promise((r) => setTimeout(r, 700)); /* Not connected yet */
        const done = $('[data-done]', form.parentElement);
        form.hidden = true; if (done) { done.hidden = false; done.focus(); }
      } catch (err) {
        const fe = $('[data-form-err]', form); if (fe) fe.textContent = 'That did not send. Please try again or call us.';
      }
      btn.disabled = false; lab.textContent = label;
    });
  });
}

function reviews() {
  const rows = $('[data-rv-rows]'), btn = $('[data-rv-toggle]'); if (!rows || !btn) return;
  btn.addEventListener('click', () => { const p = rows.classList.toggle('paused'); btn.setAttribute('aria-pressed', p); btn.textContent = p ? 'Play' : 'Pause'; });
}
