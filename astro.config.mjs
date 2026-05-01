// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  // Deployed as a project page at https://anderson-dan-w.github.io/blog/.
  // `site` is used for absolute URLs (RSS, OG tags, sitemap); `base` prefixes
  // every internal route. Templates should reference internal assets via
  // `import.meta.env.BASE_URL` so the prefix is applied consistently.
  site: 'https://anderson-dan-w.github.io',
  base: '/blog',
  integrations: [react()],
});