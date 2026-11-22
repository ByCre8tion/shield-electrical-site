// Build step: pull published blog posts from Firestore so every post gets a real static page
// (fast, and readable by search engines). Covers are saved as image files. If Firestore cannot be
// reached the build still runs with whatever posts.json already holds.
import fs from 'node:fs';
import path from 'node:path';
import { fromRest, byDate } from '../src/scripts/blog-render.js';

const PROJECT = 'shield-electrical-az';
const KEY = 'AIzaSyCUPsvT0uZ-b6HzGT_V3eRngf4cdTm5bpk';
const OUT = path.join('src', 'data', 'posts.json');
const MEDIA = path.join('public', 'media', 'blog');

async function main() {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents:runQuery?key=${KEY}`;
  const body = { structuredQuery: { from: [{ collectionId: 'posts' }], where: { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } } } };
  const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`Firestore ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const rows = (await r.json()).filter((x) => x.document).map((x) => fromRest(x.document)).sort(byDate);
  fs.mkdirSync(MEDIA, { recursive: true });
  for (const p of rows) {
    const m = /^data:image\/(webp|jpeg|png);base64,(.+)$/.exec(p.cover || '');
    if (m) {
      const file = `${p.slug}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`;
      fs.writeFileSync(path.join(MEDIA, file), Buffer.from(m[2], 'base64'));
      p.cover = `/media/blog/${file}?v=${p.updated}`;
    }
  }
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 2));
  console.log(`Blog: ${rows.length} published post${rows.length === 1 ? '' : 's'}`);
}

main().catch((e) => {
  if (!fs.existsSync(OUT)) fs.writeFileSync(OUT, '[]');
  console.warn(`Blog: could not fetch posts (${e.message}). Building with the saved list.`);
});
