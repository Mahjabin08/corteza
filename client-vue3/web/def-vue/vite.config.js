import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // Exclude linked packages from pre-bundling
    exclude: [
      '@cortezaproject/corteza-vue-next',
      '@cortezaproject/corteza-js-next'
    ]
  },
  server: {
    // Watch for changes in linked dependencies
    watch: {
      // Include linked package source files
      ignored: ['!**/node_modules/@cortezaproject/**']
    },
    fs: {
      // Allow serving files from linked packages
      allow: ['..']
    }
  }
})
