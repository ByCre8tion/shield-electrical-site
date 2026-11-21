import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://shield-electrical-az.web.app',
  trailingSlash: 'always',
  build: { inlineStylesheets: 'always', format: 'directory', assets: 'assets' },
  compressHTML: true,
  devToolbar: { enabled: false },
});
