/* Blog edit mode. On /blog/ with edit mode on and an editor signed in: New post, Edit on every
   post (drafts included), and a writing sheet with title, summary, cover photo and body.
   Posts live in Firestore (posts/{slug}). Published posts show for everyone right away; the
   nightly rebuild turns them into static pages for search engines. */
import { getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { editors } from '../data/firebase';
import { md, slugify, byDate, readMins } from './blog-render.js';
import { drawList, drawPost } from './blog.js';
import { shrink } from './editor.js';

const COVER_LIMIT = 700000;
let db, all = [], sheet, current = null, isOn = false;

export function startBlogEditor() {
  const app = getApps()[0];
  if (!app) return;
  db = getFirestore(app);
  injectStyles();
  onAuthStateChanged(getAuth(app), async (u) => {
    isOn = !!u && editors.includes((u.email || '').toLowerCase());
    document.querySelectorAll('.bed-tools,.bed-edit').forEach((n) => n.remove());
    if (!isOn) return;
    await refresh();
    mountTools();
  });
}

async function refresh() {
  const snap = await getDocs(collection(db, 'posts'));
  all = snap.docs.map((d) => ({ slug: d.id, ...d.data() })).sort(byDate);
  if (document.querySelector('[data-blog-list]')) { drawList(all); decorateList(); }
}

function mountTools() {
  const list = document.querySelector('[data-blog-list]');
  const view = document.querySelector('[data-post-view]');
  if (list) {
    const bar = el('div', 'bed-tools');
    bar.append(el('span', 'bed-tools-t', 'Blog edit mode'), button('New post', () => open(null), 'primary'));
    list.before(bar);
  }
  if (view) {
    const slug = view.dataset.postView || location.pathname.split('/').filter(Boolean)[1];
    const p = all.find((x) => x.slug === slug);
    if (p) {
      const t = el('div', 'bed-tools');
      t.append(el('span', 'bed-tools-t', p.status === 'draft' ? 'Draft, only editors can see it' : 'Published'), button('Edit this post', () => open(p), 'primary'));
      view.querySelector('.post-in')?.prepend(t);
      if (p.status === 'draft' || !view.dataset.postView) drawPost(p);
    }
  }
}

function decorateList() {
  document.querySelectorAll('[data-blog-list] [data-post]').forEach((li) => {
    const p = all.find((x) => x.slug === li.dataset.post);
    if (!p || li.querySelector('.bed-edit')) return;
    li.append(button('Edit', () => open(p), 'bed-edit'));
  });
}

/* Writing sheet */
function open(p) {
  current = p ? { ...p } : { slug: '', title: '', summary: '', body: '', cover: '', date: today(), status: 'draft', isNew: true };
  sheet?.remove();
  sheet = el('div', 'bed');
  sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-label', p ? 'Edit post' : 'New post');
  sheet.innerHTML = `
  <div class="bed-in">
    <header class="bed-head">
      <span class="bed-state">${p ? (p.status === 'published' ? 'Published' : 'Draft') : 'New post'}</span>
      <div class="bed-tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-tab="write">Write</button><button type="button" role="tab" aria-selected="false" data-tab="preview">Preview</button></div>
      <button type="button" class="bed-x" aria-label="Close">×</button>
    </header>
    <div class="bed-body">
      <div class="bed-write">
        <label class="bed-f"><span>Title</span><input name="title" maxlength="120" required placeholder="How long does a panel upgrade take?" /></label>
        <label class="bed-f"><span>Address <small>shieldelectrical.com/blog/<b data-slug-preview></b></small></span><input name="slug" maxlength="70" pattern="[a-z0-9-]+" ${p?.status === 'published' ? 'readonly' : ''} /></label>
        <label class="bed-f"><span>Summary <small>one or two sentences for the list and Google</small></span><textarea name="summary" rows="2" maxlength="300"></textarea></label>
        <div class="bed-f"><span>Cover photo <small>optional, wide photos work best</small></span>
          <div class="bed-cover"><div class="bed-cover-img"></div><div class="bed-cover-btns"></div></div>
        </div>
        <label class="bed-f bed-f-body"><span>Post</span><textarea name="body" rows="16" placeholder="Write the post here."></textarea></label>
        <p class="bed-help">Formatting: <code>## Heading</code> <code>### Subheading</code> <code>- list item</code> <code>1. step</code> <code>**bold**</code> <code>[link text](https://...)</code> <code>&gt; quote</code>. Leave a blank line between paragraphs.</p>
        <label class="bed-f bed-f-date"><span>Publish date</span><input name="date" type="date" /></label>
      </div>
      <div class="bed-preview" hidden><article><p class="bed-pv-meta"></p><h1 class="bed-pv-t"></h1><p class="bed-pv-s"></p><div class="prose bed-pv-b"></div></article></div>
    </div>
    <footer class="bed-foot">
      <p class="bed-msg" aria-live="polite"></p>
      <div class="bed-actions"></div>
    </footer>
  </div>`;
  document.body.append(sheet);
  document.documentElement.classList.add('bed-open');
  const f = (n) => sheet.querySelector(`[name="${n}"]`);
  f('title').value = current.title; f('slug').value = current.slug; f('summary').value = current.summary; f('body').value = current.body; f('date').value = current.date || today();
  let slugTouched = !!current.slug;
  const syncSlug = () => { sheet.querySelector('[data-slug-preview]').textContent = (f('slug').value || 'your-post') + '/'; };
  f('title').addEventListener('input', () => { if (!slugTouched && current.isNew) f('slug').value = slugify(f('title').value); syncSlug(); dirty(); });
  f('slug').addEventListener('input', () => { slugTouched = true; f('slug').value = f('slug').value.toLowerCase().replace(/[^a-z0-9-]/g, '-'); syncSlug(); dirty(); });
  ['summary', 'body', 'date'].forEach((n) => f(n).addEventListener('input', dirty));
  syncSlug(); drawCover(); drawActions();
  sheet.querySelector('.bed-x').addEventListener('click', close);
  sheet.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  sheet.querySelectorAll('[data-tab]').forEach((t) => t.addEventListener('click', () => tab(t.dataset.tab)));
  setTimeout(() => f(current.title ? 'body' : 'title').focus(), 50);
  sheet.dataset.dirty = '';
}

function dirty() { sheet.dataset.dirty = '1'; }
function msg(t, bad) { const m = sheet.querySelector('.bed-msg'); m.textContent = t; m.classList.toggle('bad', !!bad); }

function read() {
  const f = (n) => sheet.querySelector(`[name="${n}"]`).value.trim();
  return { ...current, title: f('title'), slug: slugify(f('slug') || f('title')), summary: f('summary'), body: sheet.querySelector('[name="body"]').value.replace(/\s+$/, ''), date: f('date') || today() };
}

function tab(which) {
  sheet.querySelectorAll('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === which)));
  sheet.querySelector('.bed-write').hidden = which !== 'write';
  const pv = sheet.querySelector('.bed-preview'); pv.hidden = which !== 'preview';
  if (which === 'preview') {
    const p = read();
    pv.querySelector('.bed-pv-meta').textContent = `${p.date} · ${readMins(p.body)} min read`;
    pv.querySelector('.bed-pv-t').textContent = p.title || 'Untitled';
    pv.querySelector('.bed-pv-s').textContent = p.summary;
    pv.querySelector('.bed-pv-b').innerHTML = md(p.body);
  }
}

function drawCover() {
  const img = sheet.querySelector('.bed-cover-img'), btns = sheet.querySelector('.bed-cover-btns');
  img.innerHTML = current.cover ? `<img src="${current.cover}" alt="" />` : '<span>No cover photo</span>';
  btns.innerHTML = '';
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true;
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;
    msg('Preparing the photo…');
    try { current.cover = await shrink(file, COVER_LIMIT, 1600); dirty(); drawCover(); msg('Cover ready. Save to keep it.'); }
    catch { msg('That photo could not be used. Try a JPG or PNG.', true); }
  });
  btns.append(input, button(current.cover ? 'Replace' : 'Add cover', () => input.click()));
  if (current.cover) btns.append(button('Remove', () => { current.cover = ''; dirty(); drawCover(); }));
}

function drawActions() {
  const a = sheet.querySelector('.bed-actions'); a.innerHTML = '';
  const pub = current.status === 'published';
  if (!current.isNew) {
    let armed = false;
    const del = button('Delete', async () => {
      if (!armed) { armed = true; del.textContent = 'Click again to delete'; del.classList.add('warn'); setTimeout(() => { armed = false; del.textContent = 'Delete'; del.classList.remove('warn'); }, 4000); return; }
      await remove();
    }, 'bed-del');
    a.append(del);
  }
  if (pub) a.append(button('Unpublish', () => save('draft')));
  else a.append(button('Save draft', () => save('draft')));
  a.append(button(pub ? 'Update post' : 'Publish', () => save('published'), 'primary'));
}

async function save(status) {
  const p = read();
  if (!p.title) { msg('Add a title first.', true); return; }
  if (status === 'published' && p.body.length < 40) { msg('Write a little more before publishing.', true); return; }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug) || p.slug === 'post') { msg('Use letters, numbers and dashes for the address.', true); return; }
  const renamed = !current.isNew && p.slug !== current.slug;
  if (current.isNew || renamed) {
    const exists = await getDoc(doc(db, 'posts', p.slug)).then((d) => d.exists()).catch(() => false);
    if (exists) { msg('Another post already uses that address. Change it slightly.', true); return; }
  }
  const data = { title: p.title, summary: p.summary, body: p.body, cover: p.cover || '', date: p.date, status, updated: Date.now() };
  msg(status === 'published' ? 'Publishing…' : 'Saving…');
  sheet.querySelectorAll('.bed-actions button').forEach((b) => (b.disabled = true));
  try {
    await setDoc(doc(db, 'posts', p.slug), data);
    if (renamed) await deleteDoc(doc(db, 'posts', current.slug));
    current = { ...data, slug: p.slug };
    sheet.dataset.dirty = '';
    sheet.querySelector('.bed-state').textContent = status === 'published' ? 'Published' : 'Draft';
    sheet.querySelector('[name="slug"]').readOnly = status === 'published';
    msg(status === 'published' ? 'Published. It is live for everyone now.' : 'Saved as a draft. Only editors can see it.');
    await refresh();
  } catch (e) {
    msg(`That did not save (${e.code || e.message}). Check that you are signed in, then try again.`, true);
  }
  drawActions();
  if (document.querySelector('[data-post-view]') && current.slug) {
    const here = location.pathname.split('/').filter(Boolean)[1];
    if (here !== current.slug) { sheet.dataset.dirty = ''; location.href = `/blog/${current.slug}/`; }
    else drawPost(current);
  }
}

async function remove() {
  msg('Deleting…');
  try {
    await deleteDoc(doc(db, 'posts', current.slug));
    sheet.dataset.dirty = '';
    if (document.querySelector('[data-post-view]')) { location.href = '/blog/'; return; }
    close(); await refresh();
  } catch (e) { msg(`That did not delete (${e.code || e.message}).`, true); }
}

function close() {
  if (sheet?.dataset.dirty && !sheet.querySelector('.bed-x').dataset.armed) {
    const x = sheet.querySelector('.bed-x'); x.dataset.armed = '1';
    msg('You have unsaved changes. Close again to throw them away.', true);
    setTimeout(() => { delete x.dataset.armed; }, 4000);
    return;
  }
  sheet?.remove(); sheet = null; current = null;
  document.documentElement.classList.remove('bed-open');
}

addEventListener('beforeunload', (e) => { if (sheet?.dataset.dirty) { e.preventDefault(); e.returnValue = ''; } });

function today() { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); }
function el(tag, cls, txt) { const n = document.createElement(tag); n.className = cls; if (txt) n.textContent = txt; return n; }
function button(label, fn, cls = '') { const b = el('button', `bed-btn ${cls}`.trim(), label); b.type = 'button'; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; }

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
  .bed-open{overflow:hidden}
  .bed-tools{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:20px;padding:12px 12px 12px 18px;border:1px dashed rgba(242,207,74,.55);border-radius:14px;font-size:.875rem;color:#A3A3A3}
  .bed-btn{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#EDEDED;font:500 .875rem/1 inherit;cursor:pointer;transition:border-color .15s ease-out,background-color .15s ease-out}
  .bed-btn:hover{border-color:rgba(255,255,255,.45)}
  .bed-btn.primary{background:#F2CF4A;border-color:#F2CF4A;color:#141208}
  .bed-btn:disabled{opacity:.5;cursor:default}
  .bed-btn:focus-visible{outline:2px solid #FFE68A;outline-offset:2px}
  .bed-btn.warn{border-color:#FF5A4E;color:#FF5A4E}
  .bed-del{margin-right:auto}
  .bl-row{position:relative}
  .bed-edit{position:absolute;top:16px;right:56px;z-index:2;background:rgba(18,19,20,.92)}
  .bed{position:fixed;inset:0;z-index:300;display:grid;place-items:center;padding:16px;background:rgba(5,5,6,.72);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
  .bed-in{display:flex;flex-direction:column;width:min(880px,100%);max-height:calc(100dvh - 32px);border:1px solid rgba(255,255,255,.12);border-radius:20px;background:#121314;box-shadow:0 40px 80px -30px rgba(0,0,0,.95);overflow:hidden}
  .bed-head{display:flex;align-items:center;gap:16px;padding:14px 16px 14px 22px;border-bottom:1px solid rgba(255,255,255,.08)}
  .bed-state{font:500 .75rem/1 "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:#F2CF4A}
  .bed-tabs{display:flex;gap:4px;margin-left:auto;padding:3px;border-radius:999px;border:1px solid rgba(255,255,255,.1)}
  .bed-tabs button{min-height:32px;padding:0 14px;border:0;border-radius:999px;background:transparent;color:#A3A3A3;font:500 .8125rem/1 inherit;cursor:pointer}
  .bed-tabs [aria-selected=true]{background:#EDEDED;color:#0A0A0B}
  .bed-x{width:40px;height:40px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:none;color:#EDEDED;font-size:1.25rem;cursor:pointer}
  .bed-body{overflow:auto;padding:22px}
  .bed-write{display:flex;flex-direction:column;gap:18px}
  .bed-f{display:flex;flex-direction:column;gap:8px;font-size:.8125rem;font-weight:500;color:#A3A3A3}
  .bed-f small{font-weight:400;color:#858585;margin-left:6px}
  .bed-f input,.bed-f textarea{width:100%;padding:10px 0;border:0;border-bottom:1px solid rgba(255,255,255,.22);background:transparent;color:#EDEDED;font:400 1rem/1.5 inherit}
  .bed-f input[name=title]{font-size:1.5rem;font-weight:300;letter-spacing:-.02em}
  .bed-f input:focus,.bed-f textarea:focus{outline:none;border-bottom-color:#F2CF4A}
  .bed-f input[readonly]{color:#858585}
  .bed-f-body textarea{min-height:320px;padding:14px;border:1px solid rgba(255,255,255,.16);border-radius:12px;resize:vertical}
  .bed-f-body textarea:focus{border-color:#F2CF4A}
  .bed-f-date input{max-width:220px;color-scheme:dark}
  .bed-help{margin-top:-8px;font-size:.8125rem;line-height:1.8;color:#858585}
  .bed-help code{padding:2px 6px;border-radius:6px;background:#1A1B1D;color:#A3A3A3;font:500 .75rem "JetBrains Mono",monospace}
  .bed-cover{display:flex;align-items:center;gap:16px;flex-wrap:wrap}
  .bed-cover-img{display:grid;place-items:center;width:200px;aspect-ratio:16/9;border-radius:10px;border:1px dashed rgba(255,255,255,.2);overflow:hidden;color:#858585;font-weight:400}
  .bed-cover-img img{width:100%;height:100%;object-fit:cover}
  .bed-cover-btns{display:flex;gap:8px}
  .bed-preview article{max-width:68ch}
  .bed-pv-meta{font:500 .8125rem "JetBrains Mono",monospace;color:#858585}
  .bed-pv-t{margin:10px 0;font-size:2rem;font-weight:300;line-height:1.15;letter-spacing:-.03em}
  .bed-pv-s{color:#A3A3A3;margin-bottom:24px}
  .bed-foot{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px;padding:14px 16px 14px 22px;border-top:1px solid rgba(255,255,255,.08)}
  .bed-msg{flex:1 1 220px;font-size:.8125rem;color:#A3A3A3}.bed-msg.bad{color:#FF8A80}
  .bed-actions{display:flex;flex-wrap:wrap;gap:8px;flex:1 1 auto;justify-content:flex-end}
  @media (max-width:640px){.bed{padding:0}.bed-in{max-height:100dvh;height:100dvh;border-radius:0}.bed-body{padding:18px}.bed-edit{top:12px;right:12px}}`;
  document.head.append(s);
}
