/* Photo edit mode. Open any page with ?edit (or visit /edit/), sign in with an editor Google
   account, click a frame, Add image, then Save. Photos are resized in the browser, turned upright,
   saved to Firestore and show for every visitor right away. Loaded only in edit mode. */
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig, editors } from '../data/firebase';
import { fillSlot } from './photos.js';

const LIMIT = 950000; // characters; a Firestore document holds up to 1 MiB

export function startEditor() {
  sessionStorage.setItem('shield-edit', '1');
  document.documentElement.classList.add('editing');
  injectStyles();
  const bar = el('div', 'ed-bar');
  bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Photo edit mode');
  document.body.append(bar);
  const live = el('p', 'ed-live'); live.setAttribute('aria-live', 'polite'); document.body.append(live);
  const say = (t) => { live.textContent = t; };

  if (!firebaseConfig.apiKey) {
    bar.innerHTML = '<span class="ed-dot off"></span><span>Edit mode is not connected yet. Finish the Firebase setup, then reload.</span>';
    bar.append(btn('Exit', exit));
    return;
  }
  // Google's OAuth client trusts the default Firebase auth handler, so always sign in through it
  const app = initializeApp({ ...firebaseConfig, authDomain: `${firebaseConfig.projectId}.firebaseapp.com` });
  const auth = getAuth(app), db = getFirestore(app);
  const pending = new Map(); // slot -> { data } or { remove: true }
  const originals = new Map(); // slot -> outerHTML of each frame before edits

  const render = (user) => {
    bar.innerHTML = '';
    if (!user) {
      bar.append(dot('off'), text('Edit mode. Sign in to add photos.'), btn('Sign in with Google', () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => say(`Sign in failed: ${e.code || e.message}`)), 'primary'), btn('Exit', exit));
      clearSlots(); return;
    }
    if (!editors.includes((user.email || '').toLowerCase())) {
      bar.append(dot('off'), text(`${user.email} cannot edit this site.`), btn('Sign out', () => signOut(auth)), btn('Exit', exit));
      clearSlots(); return;
    }
    const n = pending.size;
    bar.append(dot('on'), text(n ? `${n} unsaved change${n > 1 ? 's' : ''}` : 'Click a frame to add or replace a photo'));
    if (n) { bar.append(btn('Save', save, 'primary'), btn('Discard', discard)); }
    bar.append(btn('Sign out', () => signOut(auth)), btn('Exit', exit));
    decorate();
  };

  function decorate() {
    clearSlots();
    document.querySelectorAll('[data-slot]').forEach((frame) => {
      const slot = frame.dataset.slot;
      if (!originals.has(slot + '|' + indexOf(frame))) originals.set(slot + '|' + indexOf(frame), frame.innerHTML);
      const has = !frame.classList.contains('ph') && pending.get(slot)?.remove !== true;
      const box = el('div', 'ed-slot');
      const name = el('span', 'ed-name'); name.textContent = slot + (pending.has(slot) ? ' · unsaved' : '');
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; input.hidden = true;
      input.addEventListener('change', async () => {
        const f = input.files?.[0]; if (!f) return;
        say(`Preparing ${f.name}...`);
        try {
          const data = await shrink(f);
          pending.set(slot, { data });
          document.querySelectorAll(`[data-slot="${slot}"]`).forEach((x) => fillSlot(x, data));
          say(`${slot} ready. Press Save to publish.`);
        } catch { say('That file could not be read. Use a JPG or PNG (iPhone: share or export as JPG).'); }
        render(auth.currentUser);
      });
      const add = btn(has ? 'Replace' : 'Add image', () => input.click(), 'primary');
      box.append(name, add, input);
      if (has) box.append(btn('Remove', () => {
        pending.set(slot, { remove: true });
        document.querySelectorAll(`[data-slot="${slot}"]`).forEach((x) => { x.querySelector('img')?.remove(); x.classList.add('ph'); });
        render(auth.currentUser);
      }));
      frame.append(box);
    });
  }

  async function save() {
    const user = auth.currentUser; if (!user) return;
    const entries = [...pending.entries()];
    say('Saving...');
    try {
      const idx = {};
      for (const [slot, p] of entries) {
        if (p.remove) { await deleteDoc(doc(db, 'photos', slot)); idx[slot] = deleteField(); }
        else { await setDoc(doc(db, 'photos', slot), { data: p.data, by: user.email, at: serverTimestamp() }); idx[slot] = Date.now(); }
        try { localStorage.removeItem('shield-photo:' + slot); } catch {}
      }
      await setDoc(doc(db, 'meta', 'index'), idx, { merge: true });
      pending.clear();
      say('Saved. The photos are live for every visitor.');
    } catch (e) { say(`Save failed: ${e.code || e.message}. Nothing else was changed.`); }
    render(user);
  }

  function discard() { pending.clear(); location.reload(); }

  onAuthStateChanged(auth, render);
  addEventListener('beforeunload', (e) => { if (pending.size) { e.preventDefault(); e.returnValue = ''; } });
}

function exit() { sessionStorage.removeItem('shield-edit'); location.href = location.pathname; }
function indexOf(n) { return [...document.querySelectorAll(`[data-slot="${n.dataset.slot}"]`)].indexOf(n); }
function clearSlots() { document.querySelectorAll('.ed-slot').forEach((n) => n.remove()); }
function el(tag, cls) { const n = document.createElement(tag); n.className = cls; return n; }
function text(t) { const s = el('span', 'ed-text'); s.textContent = t; return s; }
function dot(state) { return el('span', `ed-dot ${state}`); }
function btn(label, fn, kind = '') { const b = el('button', `ed-btn ${kind}`); b.type = 'button'; b.textContent = label; b.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); fn(); }); return b; }

/* Turn the photo upright, cap it at 2000px wide and compress until it fits one document */
async function shrink(file) {
  let src;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); }
  catch { const url = URL.createObjectURL(file); src = new Image(); src.src = url; await src.decode(); }
  let w = src.width, h = src.height, scale = Math.min(1, 2000 / w);
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  for (let tries = 0; tries < 8; tries++) {
    cv.width = Math.round(w * scale); cv.height = Math.round(h * scale);
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    for (const q of [.82, .72, .62]) {
      let data = cv.toDataURL('image/webp', q);
      if (!data.startsWith('data:image/webp')) data = cv.toDataURL('image/jpeg', q);
      if (data.length < LIMIT) return data;
    }
    scale *= .8;
  }
  throw new Error('too large');
}

function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
  .editing .cg,.editing .call-bar{display:none!important}
  .ed-bar{position:fixed;left:50%;bottom:20px;translate:-50% 0;z-index:200;display:flex;flex-wrap:wrap;align-items:center;gap:10px;max-width:calc(100vw - 24px);padding:10px 10px 10px 16px;border-radius:999px;background:rgba(18,19,20,.92);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(242,207,74,.45);box-shadow:0 20px 50px -20px rgba(0,0,0,.9);font-size:.875rem;color:#EDEDED}
  .ed-dot{width:8px;height:8px;border-radius:50%;background:#858585}.ed-dot.on{background:#8FE388;box-shadow:0 0 8px rgba(143,227,136,.8)}
  .ed-text{padding-right:6px}
  .ed-btn{min-height:40px;padding:0 16px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;color:#EDEDED;font:500 .875rem/1 inherit;cursor:pointer}
  .ed-btn.primary{background:#EDEDED;color:#0A0A0B;border-color:#EDEDED}
  .ed-btn:focus-visible{outline:2px solid #FFE68A;outline-offset:2px}
  .ed-slot{position:absolute;inset:0;z-index:30;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;background:rgba(10,10,11,.35);border:2px dashed rgba(242,207,74,.7);border-radius:inherit;opacity:1}
  .ed-slot .ed-btn{background:rgba(18,19,20,.9)}.ed-slot .ed-btn.primary{background:#F2CF4A;border-color:#F2CF4A;color:#141208}
  .ed-name{font:500 .6875rem/1 "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#FFE68A;background:rgba(10,10,11,.8);padding:5px 9px;border-radius:999px}
  .editing .photo{position:relative}
  .ed-live{position:fixed;left:50%;bottom:84px;translate:-50% 0;z-index:200;margin:0;padding:8px 14px;border-radius:999px;background:rgba(10,10,11,.9);color:#EDEDED;font-size:.8125rem}
  .ed-live:empty{display:none}`;
  document.head.append(s);
}
