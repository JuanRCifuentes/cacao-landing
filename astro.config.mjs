// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Preview deployments also point canonical URLs at production.
const site = process.env.SITE_URL ?? 'https://origentolima.com';

// https://astro.build/config
export default defineConfig({
  site,

  server: { port: 4387 },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [sitemap()],
});