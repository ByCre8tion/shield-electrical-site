/* Concierge: one conversation. It answers questions about Shield and, when someone wants a quote,
   collects their name and number in the thread so Jason can text them back.
   Answers come from, in order: the site's AI endpoint (data-ai-endpoint, Phase 3), Claude in the artifact preview,
   or the built in answer set. Leads go to data-sms-endpoint once it is connected. */
import { brief, local, pages } from '../data/kb';
import { company } from '../data/site';
const PHONE = company.phone;

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const phoneSize = () => matchMedia('(max-width: 640px)').matches;
const store = { get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };

const RULES = `You are the assistant on the Shield Electrical website, answering for Jason, the owner. Answer the visitor using ONLY the facts below.
Be warm, plain and brief: one to three short sentences, no headings, no lists.
When a page on this site helps, link it as [Page name](/path/), using only the page paths listed below.
Never invent prices, dates, availability, warranties or anything not in the facts. If you do not know, say so and offer to have Jason text them (they can tap Get a quote) or call ${PHONE}.
If the question is not about Shield Electrical, electrical work or this website, politely steer back. If someone describes smoke, fire, sparking or a burning smell, tell them to leave and call 911 first, then call Shield.
Do not use em dashes, and do not use hyphens as punctuation.

FACTS:
${brief}`;

/* What the assistant says first depends on the page */
const PAGE = location.pathname.split('/').filter(Boolean)[0] || 'index';
const SUB = location.pathname.split('/').filter(Boolean)[1] || '';
const GREET = {
  projects: ['Planning a project like these? Ask me anything, or get a quote and we will text you back.', 'Planning a project like these?'],
  careers: ['Questions about a role? Ask here, or leave your number and Jason will text you.', 'Questions about working at Shield?'],
  services: ['Not sure which service you need? Describe the problem, or get a quote and we will text you back.', 'Not sure which service you need?'],
  ev: ['Thinking about an EV charger? Ask me about your panel, or get a quote and we will text you back.', 'Ready to charge at home?'],
  emergency: ['If anything is smoking or sparking, leave and call 911 first. For everything else, call us now or tell me what is happening.', 'Electrical problem right now? Call us.'],
  default: ['Hi, I am Jason\'s assistant. Ask anything about Shield Electrical, or get a quote and we will text you back.', 'Need an electrician? Ask here and we will text you back.'],
};
const greet = (SUB === 'ev-charging' && GREET.ev) || (SUB === 'emergency-repairs' && GREET.emergency) || GREET[PAGE] || GREET.default;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const okHref = (h) => /^\/[a-z0-9\/-]*(#[\w-]+)?$/i.test(h) || /^tel:\+?\d+$/.test(h) || /^mailto:[^\s"]+$/.test(h);
function render(text) {
  return esc(text.trim()).split(/\n{2,}/).map((para) => '<p>' + para
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => okHref(href) ? `<a href="${href}">${label}</a>` : label)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>') + '</p>').join('');
}
const clock = () => new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const tick = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.5 3 3 6-6.5" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/* Built in answers: keyword overlap, good enough until the AI endpoint is live */
const STOP = new Set('the and for you your are can how what does with that this have from about our any get much will who when where why which into just like need want'.split(' '));
const words = (s) => (s.toLowerCase().match(/[a-z0-9]+/g) || []).filter((w) => w.length > 2 && !STOP.has(w)).map((w) => w.replace(/(ing|es|s)$/, ''));
function localAnswer(q) {
  const qw = new Set(words(q));
  let best = null, score = 0;
  local.forEach((e) => { const k = new Set(words(e.k + ' ' + e.q)); let n = 0; qw.forEach((w) => { if (k.has(w)) n++; }); if (n > score) { score = n; best = e; } });
  const page = pages.find((p) => qw.has(p.label.toLowerCase().replace(/s$/, '')));
  if (best && score > 0) return best.a;
  if (page) return `That is on the [${page.label}](${page.href}) page.`;
  return `I do not have that answer yet. Tap Get a quote and Jason will text you, or call ${PHONE}.`;
}
const WANTS_LEAD = /\b(quote|estimate|bid|call me|text me|contact me|reach me|get started|start (a|my) project|consult|set up a (call|meeting)|site walk)\b/i;

export function initChat() {
  const root = $('#cg'); if (!root) return;
  const panel = $('#cgPanel'), launch = $('#cgLaunch'), hello = $('#cgHello'), badge = $('#cgBadge');
  const thread = $('#cgThread'), log = $('#cgLog'), actions = $('#cgActions');
  const form = $('#cgForm'), q = $('#cgQ'), sendBtn = $('#cgSend'), legal = $('#cgLegal'), qLabel = $('#cgQLabel');
  const history = [];
  const lead = {};
  let mode = 'ask', busy = false, sample = null;

  if (window.claude && window.claude.use) window.claude.use('sample').then((s) => { sample = s; }).catch(() => {});

  /* Messages */
  const scrollDown = () => { thread.scrollTop = thread.scrollHeight; };
  function say(who, html, meta) {
    const m = document.createElement('div'); m.className = 'cg-msg ' + who;
    m.innerHTML = `<div class="cg-bub">${html}</div>` + (meta ? `<div class="cg-meta">${meta}</div>` : '');
    log.appendChild(m); scrollDown(); return m;
  }
  function mine(text) {
    $$('.cg-msg.me .cg-meta', log).forEach((n) => n.remove());
    return say('me', render(text), `${tick}<span>Delivered ${clock()}</span>`);
  }
  const typing = () => say('bot', '<span class="cg-dots" aria-label="Typing"><i></i><i></i><i></i></span>');
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  async function botSays(text, chips) {
    const t = typing(); await wait(550);
    $('.cg-bub', t).innerHTML = render(text);
    if (chips) {
      const c = document.createElement('div'); c.className = 'cg-chips';
      chips.forEach(([label, fn]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { c.remove(); fn(); }); c.appendChild(b); });
      t.appendChild(c);
    }
    scrollDown(); return t;
  }
  say('bot', render(greet[0]), `Assistant · ${clock()}`);

  /* Input modes */
  function setMode(m) {
    mode = m;
    const cfg = {
      ask: ['Ask a question', 'Message', 'off', 'text'],
      name: ['Your name', 'Your name', 'name', 'text'],
      phone: ['Mobile number', 'Mobile number', 'tel', 'tel'],
      details: ['A few words about the project', 'Project details', 'off', 'text'],
    }[m];
    q.placeholder = cfg[0]; qLabel.textContent = cfg[1]; q.setAttribute('autocomplete', cfg[2]); q.setAttribute('inputmode', cfg[3]);
    legal.hidden = m !== 'phone';
    q.removeAttribute('aria-invalid');
    if (!phoneSize() || m !== 'ask') q.focus({ preventScroll: true });
  }

  async function startLead() {
    actions.hidden = true;
    await botSays('Happy to help. Jason handles every quote himself. What is your name?');
    setMode('name');
  }

  async function ask(text) {
    history.push({ role: 'user', content: text });
    let reply;
    try {
      const ep = root.dataset.aiEndpoint;
      if (ep) {
        const t = typing();
        const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }) });
        if (!r.ok) throw new Error('endpoint');
        reply = (await r.json()).text; $('.cg-bub', t).innerHTML = render(reply);
      } else if (sample) {
        const turns = history.slice(-8).map((m) => ({ ...m }));
        if (turns[0].role !== 'user') turns.shift();
        turns[0] = { role: 'user', content: RULES + '\n\nVisitor: ' + turns[0].content };
        const t = typing(), bub = $('.cg-bub', t);
        try {
          const res = await sample(turns, { modelTier: 'quick', cache: false, onText: ({ text: tx }) => { bub.innerHTML = render(tx); scrollDown(); } });
          reply = res.text; bub.innerHTML = render(reply);
        } catch (err) { t.remove(); if (err && err.code === 'not_granted') sample = null; throw err; }
      } else {
        reply = localAnswer(text); await botSays(reply);
      }
    } catch (err) {
      reply = localAnswer(text); await botSays(reply);
    }
    history.push({ role: 'assistant', content: reply });
    scrollDown();
  }

  const fmtPhone = (d) => `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  async function submitLead() {
    const t = typing();
    try {
      const ep = root.dataset.smsEndpoint;
      const data = { ...lead, page: PAGE, transcript: history.slice(-10) };
      if (ep) { const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!r.ok) throw new Error('sms'); }
      else await wait(700); /* Not connected yet: Phase 3 sends this to Jason's phone */
      $('.cg-bub', t).innerHTML = render(`Sent. Jason will text you at ${fmtPhone(lead.phone)} soon. Anything else I can help with while you wait?`);
    } catch (e) {
      $('.cg-bub', t).innerHTML = render(`That did not go through. Please call Jason at ${root.dataset.phone}.`);
    }
    setMode('ask'); scrollDown();
  }

  async function handle(text) {
    if (mode === 'name') {
      lead.name = text.slice(0, 60);
      await botSays(`Thanks, ${esc(lead.name.split(/\s+/)[0])}. What is the best mobile number to text you?`);
      setMode('phone'); return;
    }
    if (mode === 'phone') {
      const d = text.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      if (d.length !== 10) { q.setAttribute('aria-invalid', 'true'); await botSays('That number looks incomplete. Could you send all 10 digits?'); q.focus(); return; }
      lead.phone = d;
      legal.hidden = true;
      await botSays('Got it. What are you thinking of building or remodeling?', [['Skip', () => { lead.details = ''; mine('Skip'); submitLead(); }]]);
      setMode('details'); return;
    }
    if (mode === 'details') { lead.details = text; $$('.cg-chips', log).forEach((c) => c.remove()); return submitLead(); }
    if (WANTS_LEAD.test(text) && !lead.phone) { history.push({ role: 'user', content: text }); return startLead(); }
    actions.hidden = true;
    return ask(text);
  }

  /* Compose */
  const grow = () => { q.style.height = 'auto'; q.style.height = Math.min(q.scrollHeight, 120) + 'px'; };
  q.addEventListener('input', () => { grow(); sendBtn.disabled = busy || !q.value.trim(); if (mode === 'phone') q.removeAttribute('aria-invalid'); });
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = q.value.trim(); if (!text || busy) return;
    busy = true; sendBtn.disabled = true; q.value = ''; grow();
    mine(mode === 'phone' ? text.replace(/\D/g, '').length === 10 ? fmtPhone(text.replace(/\D/g, '')) : text : text);
    await handle(text);
    busy = false; sendBtn.disabled = !q.value.trim();
  });
  $('[data-act="quote"]', actions).addEventListener('click', () => { mine('I would like a quote'); history.push({ role: 'user', content: 'I would like a quote' }); startLead(); });

  /* Open and close */
  const isOpen = () => !panel.hidden;
  const scrim = $('#cgScrim');
  function open() {
    hideHello();
    if (isOpen()) return;
    panel.hidden = false; panel.style.transform = ''; panel.classList.remove('leaving', 'settle'); panel.classList.add('in');
    root.classList.add('open'); launch.setAttribute('aria-expanded', 'true');
    if (phoneSize()) document.documentElement.style.overflow = 'hidden';
    setTimeout(() => { if (phoneSize()) $('#cgClose').focus({ preventScroll: true }); else q.focus({ preventScroll: true }); scrollDown(); }, reduce ? 0 : 150);
  }
  function close() {
    if (!isOpen()) return;
    root.classList.remove('open'); launch.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    const end = () => { panel.hidden = true; panel.classList.remove('leaving', 'in', 'settle'); panel.style.transform = ''; };
    if (reduce) end(); else { panel.classList.remove('in'); panel.classList.add('leaving'); setTimeout(end, phoneSize() ? 250 : 180); }
    launch.focus({ preventScroll: true });
  }
  launch.addEventListener('click', () => (isOpen() ? close() : open()));
  $('#cgClose').addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) close(); });

  /* Drag the sheet down to close it on phones */
  let y0 = null, dy = 0, t0 = 0;
  const startDrag = (e) => { if (!phoneSize() || e.target.closest('button, a')) return; y0 = e.clientY; dy = 0; t0 = performance.now(); panel.classList.remove('in', 'settle'); panel.classList.add('dragging'); e.currentTarget.setPointerCapture?.(e.pointerId); };
  const moveDrag = (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); panel.style.transform = `translateY(${dy}px)`; };
  const endDrag = () => {
    if (y0 === null) return; y0 = null; panel.classList.remove('dragging');
    const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    panel.classList.add('settle');
    if (dy > 120 || (fast && dy > 30)) {
      panel.style.transform = 'translateY(100%)';
      root.classList.remove('open'); launch.setAttribute('aria-expanded', 'false'); document.documentElement.style.overflow = '';
      setTimeout(() => { panel.hidden = true; panel.classList.remove('settle'); panel.style.transform = ''; launch.focus({ preventScroll: true }); }, 300);
    } else panel.style.transform = '';
  };
  [$('#cgGrab'), $('.cg-head', panel)].forEach((h) => { h.addEventListener('pointerdown', startDrag); h.addEventListener('pointermove', moveDrag); h.addEventListener('pointerup', endDrag); h.addEventListener('pointercancel', endDrag); });

  /* Greeting bubble with a badge, once per visit */
  function hideHello() { hello.hidden = true; badge.hidden = true; store.set('cg-hello', '1'); }
  $('#cgHelloText').textContent = greet[1];
  if (!store.get('cg-hello')) setTimeout(() => { if (isOpen()) return; badge.hidden = false; if (!phoneSize()) hello.hidden = false; }, 6000);
  $('#cgHelloX').addEventListener('click', hideHello);
  $('#cgHelloOpen').addEventListener('click', open);
}
