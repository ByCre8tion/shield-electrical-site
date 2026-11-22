/* Keeps blog pages current between builds. The list and each post are built as static HTML;
   here we read Firestore (published posts only, no SDK) and redraw only if something changed. */
import { firebaseConfig } from '../data/firebase';
import { md, card, fmtDate, readMins, fromRest, byDate, esc } from './blog-render.js';

const BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const KEY = `key=${firebaseConfig.apiKey}`;

export async function livePosts() {
  const body = { structuredQuery: { from: [{ collectionId: 'posts' }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } } } };
  const r = await fetch(`${BASE}:runQuery?${KEY}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(String(r.status));
  return (await r.json()).filter((x) => x.document).map((x) => fromRest(x.document)).sort(byDate);
}

export function drawList(list) {
  const ul = document.querySelector('[data-blog-list]');
  if (!ul) return;
  ul.innerHTML = list.map((p, i) => card(p, i)).join('');
  const empty = document.querySelector('[data-blog-empty]');
  if (empty) empty.hidden = list.length > 0;
}

export async function initBlogList() {
  const ul = document.querySelector('[data-blog-list]');
  if (!ul) return;
  try {
    const list = await livePosts();
    const shown = [...ul.querySelectorAll('[data-post]')].map((li) => li.dataset.post).join();
    const sig = list.map((p) => p.slug).join();
    // Redraw when posts were added, removed or reordered; static covers stay when nothing changed
    if (shown !== sig) drawList(list);
  } catch { /* keep the built list */ }
}

export function drawPost(p) {
  const v = document.querySelector('[data-post-view]');
  if (!v) return;
  v.dataset.postView = p.slug; v.dataset.updated = p.updated;
  v.querySelector('[data-post-title]').textContent = p.title;
  v.querySelector('[data-post-meta]').textContent = `${fmtDate(p.date)} · ${readMins(p.body)} min read`;
  const sum = v.querySelector('[data-post-summary]'); sum.textContent = p.summary; sum.hidden = !p.summary;
  const fig = v.querySelector('[data-post-cover]');
  fig.innerHTML = p.cover ? `<img src="${esc(p.cover)}" alt="" decoding="async" />` : ''; fig.hidden = !p.cover;
  v.querySelector('[data-post-body]').innerHTML = md(p.body);
  document.title = `${p.title} | Shield Electrical`;
}

function notFound(v) {
  v.querySelector('[data-post-title]').textContent = 'This post is not up yet';
  v.querySelector('[data-post-meta]').textContent = '';
  v.querySelector('[data-post-body]').innerHTML = '<p>It may still be a draft, or the address changed. <a href="/blog/">See every post</a>.</p>';
}

export async function initPost() {
  const v = document.querySelector('[data-post-view]');
  if (!v) return;
  const slug = v.dataset.postView || decodeURIComponent(location.pathname.split('/').filter(Boolean)[1] || '');
  if (!/^[a-z0-9-]+$/.test(slug) || slug === 'post') { if (!v.dataset.postView) notFound(v); return; }
  try {
    const r = await fetch(`${BASE}/posts/${slug}?${KEY}`);
    if (!r.ok) { if (!v.dataset.postView) notFound(v); return; }
    const p = fromRest(await r.json());
    if (p.status !== 'published') { if (!v.dataset.postView) notFound(v); return; }
    if (String(p.updated) !== v.dataset.updated) drawPost(p);
  } catch { if (!v.dataset.postView) notFound(v); }
}
