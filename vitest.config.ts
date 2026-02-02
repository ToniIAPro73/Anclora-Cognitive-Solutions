import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/app/actions/**/*.ts', 'src/lib/validations/**/*.ts', 'src/lib/utils.ts', 'src/lib/verifactu/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/types/**',
      ],
      thresholds: {
        // Start with achievable thresholds, increase over time
        'src/app/actions/**/*.ts': {
          statements: 35,
          branches: 40,
          functions: 55,
          lines: 35,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
