/* Runs in CI before the build: downloads the source photos in src/data/site.ts and writes
   optimized WebP files at 800, 1600 and 2400 wide into public/media. Skips any that fail. */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = await fs.readFile('src/data/site.ts', 'utf8');
const HF = (src.match(/const HF = '([^']+)'/) || [])[1] || '';
const entries = [...src.matchAll(/^\s{2}(\w+): \{ src: (HF \+ )?'([^']*)'/gm)].map(([, k, hf, f]) => [k, f ? (hf ? HF + f : f) : '']);
const out = 'public/media'; await fs.mkdir(out, { recursive: true });
for (const [k, url] of entries) {
  if (!url) continue;
  try {
    const r = await fetch(url); if (!r.ok) throw new Error(r.status);
    const buf = Buffer.from(await r.arrayBuffer());
    for (const w of [800, 1600, 2400]) await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(path.join(out, `${k}-${w}.webp`));
    if (k === 'hero') await sharp(buf).resize(1200, 630, { fit: 'cover' }).modulate({ brightness: .7 }).jpeg({ quality: 82 }).toFile('public/brand/og.jpg');
    console.log('ok', k);
  } catch (e) { console.warn('skip', k, e.message); }
}
