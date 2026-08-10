// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  {
    ignores: [
      'dist/**',
      'dist-static/**',
      'dist-server/**',
      '.astro/**',
      '.vitest-tmp/**',
      'node_modules/**',
      'src/styles/theme-tokens.generated.css',
      'public/vendor/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: [
      'src/**/*.{ts,js,mjs}',
      'scripts/**/*.{ts,js,mjs}',
      'tests/**/*.{ts,js}',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'astro.config.mjs', 'vitest.config.ts'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        // Node 18+ 全局对象(no-undef 需显式声明)
        URL: 'readonly',
        URLSearchParams: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
        fetch: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'no-undef': 'off',
    },
  },
)
