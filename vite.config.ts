/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This project folder lives under a path containing ":", which trips Vite's
    // default file-serving allow list (even when the root is listed). Dev server only.
    fs: { strict: false },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
