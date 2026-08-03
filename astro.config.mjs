// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'

const mode = process.env.ASTRO_MODE || 'static'

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  output: mode === 'server' ? 'server' : 'static',
  adapter: mode === 'server' ? node({ mode: 'standalone' }) : undefined,
  integrations: [mdx(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
})
