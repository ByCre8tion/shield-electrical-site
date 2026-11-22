/* Blog rendering shared by the build (Astro pages) and the browser (live posts and edit mode).
   Pure functions, no DOM, so the static page and the live page come out identical.
   Posts are written in a small, safe subset of Markdown: everything is escaped first. */

export const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const safeHref = (u) => (/^(https?:\/\/|mailto:|tel:|\/)/i.test(u) ? u : '#');

function inline(t) {
  let s = esc(t);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, url) => {
    const href = safeHref(url.replace(/&amp;/g, '&'));
    const ext = /^https?:/i.test(href) && !/shield/i.test(href);
    return `<a href="${esc(href)}"${ext ? ' rel="noopener" target="_blank"' : ''}>${txt}</a>`;
  });
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s;
}

/* ## Heading, ### Subheading, - list, 1. list, > quote, blank line between paragraphs */
export function md(src = '') {
  const lines = String(src).replace(/\r/g, '').split('\n');
  const out = [];
  let para = [], list = null;
  const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushL = () => { if (list) { out.push(`<${list.t}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.t}>`); list = null; } };
  for (const raw of lines) {
    const l = raw.trim();
    let m;
    if (!l) { flushP(); flushL(); continue; }
    if ((m = l.match(/^(#{2,3})\s+(.+)/))) { flushP(); flushL(); const h = m[1].length; out.push(`<h${h}>${inline(m[2])}</h${h}>`); continue; }
    if ((m = l.match(/^[-*]\s+(.+)/)) || (m = l.match(/^\d+[.)]\s+(.+)/))) {
      flushP(); const t = /^\d/.test(l) ? 'ol' : 'ul';
      if (list && list.t !== t) flushL();
      list = list || { t, items: [] }; list.items.push(m[1]); continue;
    }
    if ((m = l.match(/^>\s?(.*)/))) { flushP(); flushL(); out.push(`<blockquote><p>${inline(m[1])}</p></blockquote>`); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL();
  return out.join('\n');
}

export function readMins(body = '') { return Math.max(1, Math.round(String(body).split(/\s+/).filter(Boolean).length / 220)); }

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T12:00:00');
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function slugify(s = '') { return String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, '') || 'post'; }

/* One row in the blog list. Same markup at build time and live. */
export function card(p, i = 0) {
  const cover = p.cover ? `<img src="${esc(p.cover)}" alt="" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" />` : '';
  return `<li class="bl-row${i === 0 ? ' bl-lead' : ''}" data-post="${esc(p.slug)}">
  <a href="/blog/${esc(p.slug)}/">
    <span class="bl-meta val">${esc(fmtDate(p.date))}<span aria-hidden="true"> · </span>${readMins(p.body)} min read${p.status === 'draft' ? ' <b class="bl-draft">Draft</b>' : ''}</span>
    <span class="bl-t">${esc(p.title)}</span>
    ${p.summary ? `<span class="bl-d">${esc(p.summary)}</span>` : ''}
    <span class="bl-go" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor"><path d="M221.66 133.66l-72 72a8 8 0 0 1-11.32-11.32L196.69 136H40a8 8 0 0 1 0-16h156.69l-58.35-58.34a8 8 0 0 1 11.32-11.32l72 72a8 8 0 0 1 0 11.32Z"/></svg></span>
    <span class="bl-cover photo${cover ? '' : ' ph'}" aria-hidden="true">${cover || '<span class="ph-cap"><b>Shield</b></span>'}</span>
  </a>
</li>`;
}

/* Firestore REST document to a plain post */
export function fromRest(d) {
  const f = d?.fields || {};
  const v = (k) => f[k]?.stringValue ?? (f[k]?.integerValue != null ? +f[k].integerValue : undefined);
  return { slug: d.name.split('/').pop(), title: v('title') || '', summary: v('summary') || '', body: v('body') || '', cover: v('cover') || '', date: v('date') || '', updated: v('updated') || 0, status: v('status') || 'draft' };
}

export const byDate = (a, b) => (b.date || '').localeCompare(a.date || '') || (b.updated || 0) - (a.updated || 0);
