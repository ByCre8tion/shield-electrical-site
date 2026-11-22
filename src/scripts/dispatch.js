/* Shield dispatch widget behavior: open and close, routes, the text request, quick answers and the
   emergency path. Requests post to data-sms-endpoint when connected (Phase 3); until then the send is
   simulated. Answers use data-ai-endpoint when connected, otherwise the site's knowledge base. */
import { local, pages } from '../data/kb';
import { company } from '../data/site';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const STOP = new Set('the and for you your are can how what does with that this have from about our any get much will who when where why which into just like need want'.split(' '));
const words = (s) => (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/(ing|es|s)$/, ''));
function localAnswer(q) {
  const qw = new Set(words(q));
  let best = null, score = 0;
  local.forEach((e) => { const k = new Set(words(e.k + ' ' + e.q)); let n = 0; qw.forEach((w) => { if (k.has(w)) n++; }); if (n > score) { score = n; best = e; } });
  if (best && score > 0) return best.a;
  const page = pages.find((p) => qw.has(p.label.toLowerCase().replace(/s$/, '')));
  if (page) return `That is on the [${page.label}](${page.href}) page.`;
  return `We do not have that answer here yet. Text it to us and Jason will reply, or call ${company.phone}.`;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const okHref = (h) => /^\/[a-z0-9\/-]*(#[\w-]+)?$/i.test(h) || /^tel:\+?\d+$/.test(h);
const render = (t) => esc(t).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, l, h) => (okHref(h) ? `<a href="${h}">${l}</a>` : l));
const fmtPhone = (v) => { const d = v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10); return d.length > 6 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}` : d.length > 3 ? `(${d.slice(0, 3)}) ${d.slice(3)}` : d; };
const TOPIC = { book: 'Book a service visit', price: 'Get a price on a project' };

export function initDispatch() {
  const root = $('#dp'); if (!root) return;
  const launch = $('#dpLaunch'), panel = $('#dpPanel'), body = $('#dpBody');
  const views = $$('[data-view]', root);
  let topic = 'book', lastFocus = null;

  const show = (name, focus = true) => {
    views.forEach((v) => { v.hidden = v.dataset.view !== name; });
    body.scrollTop = 0;
    if (!focus) return;
    const v = $(`[data-view="${name}"]`, root);
    const target = name === 'sent' ? v : $('textarea, input, [data-route], .dp-call', v);
    setTimeout(() => target && target.focus({ preventScroll: true }), reduce ? 0 : 80);
  };
  const isOpen = () => root.classList.contains('open');
  const open = () => {
    lastFocus = document.activeElement;
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
    show('start');
  };
  const close = () => {
    root.classList.remove('open'); launch.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!isOpen()) panel.hidden = true; }, reduce ? 0 : 420);
    (lastFocus && lastFocus !== document.body ? lastFocus : launch).focus({ preventScroll: true });
  };
  launch.addEventListener('click', open);
  $('#dpClose').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(); });
  document.addEventListener('pointerdown', (e) => { if (isOpen() && !root.contains(e.target)) close(); });

  $$('[data-route]', root).forEach((b) => b.addEventListener('click', () => {
    const r = b.dataset.route;
    if (r === 'ask') return show('ask');
    if (r === 'sos') return show('sos');
    topic = r; $('[data-topic]', root).textContent = TOPIC[r]; show('form');
  }));
  $$('[data-back]', root).forEach((b) => b.addEventListener('click', () => show('start')));
  $$('[data-home]', root).forEach((b) => b.addEventListener('click', () => show('start')));

  /* Text request */
  const form = $('form[data-view="form"]', root), err = $('#dpErr'), msg = $('#dpMsg'), name = $('#dpName'), phone = $('#dpPhone');
  phone.addEventListener('input', () => { phone.value = fmtPhone(phone.value); });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    const bad = [[msg, !msg.value.trim(), 'Add a sentence about the job.'], [name, !name.value.trim(), 'Add your name.'], [phone, digits.length !== 10, 'Add a 10 digit mobile number.']].filter(([, b]) => b);
    [msg, name, phone].forEach((f) => f.setAttribute('aria-invalid', String(bad.some(([g]) => g === f))));
    if (bad.length) { err.textContent = bad[0][2]; bad[0][0].focus(); return; }
    err.textContent = '';
    const btn = $('button[type=submit]', form), lab = $('[data-send-label]', btn);
    btn.disabled = true; lab.textContent = 'Sending…';
    try {
      const ep = root.dataset.smsEndpoint, data = { topic: TOPIC[topic], message: msg.value.trim(), name: name.value.trim(), phone: digits, page: location.pathname };
      if (ep) { const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!r.ok) throw new Error('send'); }
      else await new Promise((r) => setTimeout(r, 700)); /* Not connected yet */
      $('#dpSentD').textContent = `Jason will text you at ${fmtPhone(digits)} within one business day. If it is urgent, call ${company.phone}.`;
      form.reset(); show('sent');
    } catch { err.textContent = `That did not send. Please call ${company.phone}.`; }
    btn.disabled = false; lab.textContent = 'Send text';
  });

  /* Quick answers */
  const ask = $('#dpAsk'), q = $('#dpAskQ'), log = $('#dpLog');
  ask.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = q.value.trim(); if (!text) return;
    q.value = '';
    const item = document.createElement('div'); item.className = 'dp-qa';
    item.innerHTML = `<p class="q">${esc(text)}</p><p class="a">…</p>`;
    log.append(item); item.scrollIntoView({ block: 'nearest' });
    let a;
    try {
      const ep = root.dataset.aiEndpoint;
      if (ep) { const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [{ role: 'user', content: text }] }) }); if (!r.ok) throw 0; a = (await r.json()).text; }
      else { await new Promise((r) => setTimeout(r, reduce ? 0 : 350)); a = localAnswer(text); }
    } catch { a = localAnswer(text); }
    $('.a', item).innerHTML = render(a);
    const more = document.createElement('button'); more.type = 'button'; more.className = 'more'; more.textContent = 'Text Jason about this';
    more.addEventListener('click', () => { topic = 'book'; $('[data-topic]', root).textContent = TOPIC.book; msg.value = text; show('form'); });
    item.append(more);
  });
}
