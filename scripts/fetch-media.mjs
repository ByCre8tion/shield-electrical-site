/* Runs in CI before the build. For every photo slot in src/data/site.ts it looks for a file
   in photos/ named after the slot (field1.jpg, project3.png, jason.webp ...). If there is none it
   falls back to the slot's src URL. Each photo is turned upright, then written as WebP at
   800, 1600 and 2400 wide into public/media. Slots with no photo keep their placeholder. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = await fs.readFile('src/data/site.ts', 'utf8');
const slots = [...src.matchAll(/^\s{2}(\w+): \{ src: '([^']*)'/gm)].map(([, k, url]) => [k, url]);
const out = 'public/media'; await fs.mkdir(out, { recursive: true });
const files = await fs.readdir('photos').catch(() => []);
const local = new Map();
for (const f of files) {
  const m = f.match(/^(.+)\.(jpe?g|png|webp|avif|tiff?)$/i);
  if (m) local.set(m[1].toLowerCase(), path.join('photos', f));
}

let done = 0;
for (const [k, url] of slots) {
  const file = local.get(k.toLowerCase());
  if (!file && !url) continue;
  try {
    let buf;
    if (file) buf = await fs.readFile(file);
    else { const r = await fetch(url); if (!r.ok) throw new Error(r.status); buf = Buffer.from(await r.arrayBuffer()); }
    for (const w of [800, 1600, 2400]) await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, `${k}-${w}.webp`));
    console.log('ok', k, file ? `(${file})` : '(url)'); done++;
  } catch (e) { console.warn('skip', k, e.message); }
}
const unknown = [...local.keys()].filter((k) => !slots.some(([s]) => s.toLowerCase() === k));
if (unknown.length) console.warn('These files in photos/ do not match a slot name and were ignored:', unknown.join(', '));
console.log(`${done} photo(s) ready`);
