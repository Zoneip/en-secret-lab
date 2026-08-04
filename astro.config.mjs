// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'

const mode = process.env.ASTRO_MODE || 'static'

export default defineConfig({
  site: process.env.SITE_URL || 'https://example.com',
  output: mode === 'server' ? 'server' : 'static',
  adapter: mode === 'server' ? node({ mode: 'standalone' }) : undefined,
  integrations: [mdx(), sitemap(), react()],
  vite: {
    plugins: [tailwindcss()],
  },
  // 内置 origin 检查在本地直连时因端口丢失误判跨域(见 middleware 自实现校验)
  security: { checkOrigin: false },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
    },
  },
})
