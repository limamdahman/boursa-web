import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';

export default defineConfig({
  site: 'https://boursa.mr',
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/connexion") && !page.includes("/inscription") && !page.includes("/mon-compte"),
    }),react()],
  vite: {
    plugins: [tailwindcss()],
  },
  server: {
    port: 4321,
    host: true,
  },
  output: 'static',
  adapter: node({
    mode: 'standalone',
  }),
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'ar'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
