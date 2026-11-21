/* Site behavior: menu, open now status, reveals, energized rules, meters, forms, reviews pause */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initSite(company) {
  document.documentElement.classList.add('js');
  menu(); openStatus(company); reveals(); meters(); forms(); reviews();
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
  els.forEach((el) => { $('.led', el)?.classList.toggle('off', !open); const t = $('[data-open-text]', el); if (t) t.textContent = text; });
}

function reveals() {
  const items = $$('[data-reveal]'), rules = $$('.rule-live');
  if (reduce || !('IntersectionObserver' in window)) { items.forEach((e) => e.classList.add('in')); rules.forEach((r) => r.classList.add('on')); return; }
  const io = new IntersectionObserver((ents) => ents.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target, sib = el.parentElement ? [...el.parentElement.children].filter((c) => c.hasAttribute('data-reveal')) : [];
    el.style.transitionDelay = Math.min(sib.indexOf(el), 5) * 80 + 'ms';
    el.classList.add('in', 'on'); io.unobserve(el);
  }), { rootMargin: '0px 0px -8% 0px' });
  items.forEach((e) => io.observe(e)); rules.forEach((r) => io.observe(r));
  /* Anything already on screen at load shows immediately */
  requestAnimationFrame(() => items.forEach((e) => { const r = e.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) e.classList.add('in'); }));
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
      let ok = f.type === 'file' ? true : f.value.trim().length > 0;
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
      const btn = $('button[type=submit]', form), label = btn.textContent;
      btn.disabled = true; btn.textContent = 'Sending';
      try {
        const ep = form.dataset.endpoint;
        if (ep) { const r = await fetch(ep, { method: 'POST', body: new FormData(form) }); if (!r.ok) throw new Error('send'); }
        else await new Promise((r) => setTimeout(r, 700)); /* Not connected yet */
        const done = $('[data-done]', form.parentElement);
        form.hidden = true; if (done) { done.hidden = false; done.focus(); }
      } catch (err) {
        const fe = $('[data-form-err]', form); if (fe) fe.textContent = 'That did not send. Please try again or call us.';
      }
      btn.disabled = false; btn.textContent = label;
    });
  });
}

function reviews() {
  const rows = $('[data-rv-rows]'), btn = $('[data-rv-toggle]'); if (!rows || !btn) return;
  btn.addEventListener('click', () => { const p = rows.classList.toggle('paused'); btn.setAttribute('aria-pressed', p); btn.textContent = p ? 'Play' : 'Pause'; });
}
