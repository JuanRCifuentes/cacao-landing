// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

const site = process.env.SITE_URL ?? process.env.CF_PAGES_URL;

// https://astro.build/config
export default defineConfig({
  site,

  server: { port: 4387 },

  vite: {
    plugins: [tailwindcss()],
  },
});
