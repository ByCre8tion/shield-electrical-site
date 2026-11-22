/* Guided booking form: one step at a time. Validation comes from forms() in site.js (form._check). */
export function initSteps() {
  document.querySelectorAll('[data-steps]').forEach((box) => {
    const form = box.querySelector('form'); if (!form) return;
    const steps = [...form.querySelectorAll('[data-step]')];
    const back = form.querySelector('[data-back]'), next = form.querySelector('[data-next]'), send = form.querySelector('button[type=submit]');
    const note = form.querySelector('[data-step-note]');
    const notes = ['Step 1 of 3. About a minute.', 'Step 2 of 3. Plain words are fine.', 'Step 3 of 3. We reply within one business day.'];
    let at = 1;
    const fieldsIn = (s) => [...s.querySelectorAll('input, textarea, select')].filter((f) => f.dataset.msg);
    const valid = (s) => { const bad = fieldsIn(s).filter((f) => !(form._check ? form._check(f) : true)); if (bad.length) { bad[0].focus(); return false; } return true; };
    const go = (n, user = true) => {
      at = Math.max(1, Math.min(steps.length, n));
      steps.forEach((s) => (s.hidden = +s.dataset.step !== at));
      box.dataset.stepAt = at;
      box.querySelectorAll('[data-rail]').forEach((r) => { r.classList.toggle('on', +r.dataset.rail === at); r.classList.toggle('done', +r.dataset.rail < at); });
      back.hidden = at === 1; next.hidden = at === steps.length; send.hidden = at !== steps.length;
      if (note) note.textContent = notes[at - 1] || '';
      if (!user) return;
      const top = box.getBoundingClientRect().top;
      if (top < 0 || top > innerHeight * .6) box.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      const first = steps[at - 1].querySelector('input:checked, input:not([type=file]):not([type=radio]), textarea, input[type=radio]');
      setTimeout(() => first?.focus({ preventScroll: true }), 60);
    };
    next.addEventListener('click', () => { if (valid(steps[at - 1])) go(at + 1); });
    back.addEventListener('click', () => go(at - 1));
    // Picking a service moves on by itself
    steps[0].querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('click', () => { if (at === 1) setTimeout(() => go(2), 220); }));
    // Enter in a field means Continue, except in the message box
    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA' || at === steps.length) return;
      e.preventDefault(); next.click();
    });
    form.addEventListener('form:bad', (e) => { const s = e.detail?.closest('[data-step]'); if (s) go(+s.dataset.step, false); });
    go(1, false);
  });
}
