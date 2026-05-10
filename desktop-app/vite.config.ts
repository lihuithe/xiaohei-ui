import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

const isDev = process.env.NODE_ENV !== 'production'
const isElectronBuild = process.argv.includes('build:electron') || 
                        process.argv.includes('build:win') || 
                        process.argv.includes('build:mac') ||
                        process.argv.includes('build:linux')

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    ...(isElectronBuild ? [
      (await import('vite-plugin-electron')).default([
        {
          entry: 'electron/main.ts',
          vite: {
            build: {
              minify: 'terser',
              terserOptions: {
                compress: {
                  drop_console: true,
                  drop_debugger: true,
                },
              },
            },
          },
        },
      ]),
      (await import('vite-plugin-electron-renderer')).default(),
    ] : []),
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
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    cssMinify: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia')) {
              return 'vue-vendor'
            }
            if (id.includes('lucide-vue-next') || id.includes('shadcn-vue') || id.includes('reka-ui')) {
              return 'ui-vendor'
            }
            if (id.includes('echarts') || id.includes('vue-echarts')) {
              return 'chart-vendor'
            }
            if (id.includes('dayjs') || id.includes('xlsx') || id.includes('zod') || id.includes('vee-validate')) {
              return 'utils-vendor'
            }
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: true,
  },
  server: {
    hmr: {
      overlay: true,
    },
  },
})
