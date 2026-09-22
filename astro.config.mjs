import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ricky0601.github.io',
  output: 'static',
  integrations: [sitemap({
    filter: (page) => !new URL(page).pathname.startsWith('/tags/'),
  })],
});
