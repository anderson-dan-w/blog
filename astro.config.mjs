// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// Browsers auto-probe `/favicon.ico` at the site root even when a `<link
// rel="icon">` is present. Astro 6 logs an error for any public/ asset
// request that skips the base prefix, so this dev-only middleware rewrites
// the root probe to the base-prefixed path. Prod is unaffected.
const baseFaviconRedirect = {
  name: 'base-favicon-redirect',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/favicon.ico') {
        req.url = '/blog/favicon.ico';
      }
      next();
    });
  },
};

// https://astro.build/config
export default defineConfig({
  // Deployed as a project page at https://anderson-dan-w.github.io/blog/.
  // `site` is used for absolute URLs (RSS, OG tags, sitemap); `base` prefixes
  // every internal route. Templates should reference internal assets via
  // `import.meta.env.BASE_URL` so the prefix is applied consistently.
  site: 'https://anderson-dan-w.github.io',
  base: '/blog',
  integrations: [react()],
  vite: {
    plugins: [baseFaviconRedirect],
  },
});