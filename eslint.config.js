// @ts-check
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'

export default tseslint.config(
  {
    ignores: ['dist/**', 'dist-static/**', 'dist-server/**', '.astro/**', 'node_modules/**', 'src/styles/theme-tokens.generated.css'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['src/**/*.{ts,js,mjs}', 'scripts/**/*.{ts,js,mjs}', 'tests/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    files: ['scripts/**/*.mjs', 'astro.config.mjs', 'vitest.config.ts'],
    languageOptions: {
      globals: { console: 'readonly', process: 'readonly' },
    },
  },
  {
    files: ['**/*.astro'],
    rules: {
      'no-undef': 'off',
    },
  }
)
