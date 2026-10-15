// @ts-check
import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL ?? 'https://origentolima.com';

// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',

  server: { port: 4387 },
});
