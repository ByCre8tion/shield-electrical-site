/* Photos added in edit mode live in Firestore (one document per slot) and are filled into the
   page here, with no SDK. One small index document says which slots have photos and when they
   changed; only changed photos are downloaded, and they are kept in localStorage between visits. */
import { firebaseConfig } from '../data/firebase';

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const KEY = firebaseConfig.apiKey ? `?key=${firebaseConfig.apiKey}` : '';
const CACHE = 'shield-photo:';

export function fillSlot(el, src) {
  let img = el.querySelector('img');
  if (!src) return;
  if (el.classList.contains('ph')) {
    el.classList.remove('ph');
    el.querySelector('.ph-cap')?.remove();
    el.removeAttribute('role'); el.removeAttribute('aria-label');
  }
  if (!img) {
    img = document.createElement('img');
    img.alt = el.dataset.alt || ''; img.decoding = 'async';
    el.prepend(img);
  }
  img.removeAttribute('srcset'); img.removeAttribute('sizes');
  img.src = src;
}

export async function loadPhotos() {
  if (!firebaseConfig.apiKey) return;
  const els = [...document.querySelectorAll('[data-slot]')];
  if (!els.length) return;
  const slots = [...new Set(els.map((e) => e.dataset.slot))];
  let index;
  try {
    const r = await fetch(`${BASE}/meta/index${KEY}`);
    if (!r.ok) return;
    index = Object.fromEntries(Object.entries((await r.json()).fields || {}).map(([k, v]) => [k, +(v.integerValue || 0)]));
  } catch { return; }

  const want = [], have = {};
  for (const s of slots) {
    const t = index[s]; if (!t) continue;
    try { const c = JSON.parse(localStorage.getItem(CACHE + s) || 'null'); if (c && c.t === t) { have[s] = c.data; continue; } } catch {}
    want.push(s);
  }
  if (want.length) {
    try {
      const r = await fetch(`${BASE}:batchGet${KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documents: want.map((s) => `projects/${firebaseConfig.projectId}/databases/(default)/documents/photos/${s}`) }) });
      for (const row of await r.json()) {
        if (!row.found) continue;
        const s = row.found.name.split('/').pop(), data = row.found.fields?.data?.stringValue;
        if (!data) continue;
        have[s] = data;
        try { localStorage.setItem(CACHE + s, JSON.stringify({ t: index[s], data })); } catch {}
      }
    } catch {}
  }
  for (const el of els) if (have[el.dataset.slot]) fillSlot(el, have[el.dataset.slot]);
}
