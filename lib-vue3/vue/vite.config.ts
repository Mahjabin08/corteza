import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()],
    }),
    dts({
      insertTypesEntry: true,
      include: ['src/**/*.ts', 'src/**/*.vue'],
      copyDtsFiles: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CortezaVueNext',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs'],
    },
        rollupOptions: {
      external: [
        'vue',
        'axios',
        'vue-i18n',
        'primevue/config',
        'primevue/button',
        'primevue/menu',
        'primevue/badge',
        '@cortezaproject/corteza-vue-next'
      ]
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})