import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    electron([
      {
        entry: 'electron/main.ts',
      },
    ]),
    renderer(),
    {
      name: 'copy-preload',
      buildStart() {
        const dir = path.resolve(__dirname, 'dist-electron')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.copyFileSync(
          path.resolve(__dirname, 'electron/preload.cjs'),
          path.resolve(dir, 'preload.cjs'),
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
