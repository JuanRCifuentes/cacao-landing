// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://origentolima.com';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  // Fetch linked pages as they scroll into view, so following a link feels instant.
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },

  server: { port: 4387 },
});
