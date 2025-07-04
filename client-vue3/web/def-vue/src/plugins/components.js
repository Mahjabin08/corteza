import PrimeVue from 'primevue/config'
import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { setToastService } from '@cortezaproject/corteza-vue-next'

import Menu from 'primevue/menu'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const CortezaTheme = definePreset(Aura, {
  semantic: {
    primary: palette('#FF9661'),
  },
  extend: {
    body: {
      backgroundColor: 'var(--p-surface-0)',
    },
    topbar: {
      backgroundColor: 'var(--p-surface-0)',
    },
    sidebar: {
      backgroundColor: 'var(--p-surface-0)',
    },
  },
  css: ({ dt }) => `
    body {
      background-color: ${dt('body.backgroundColor')};
    }
  `,
})

export const PrimeVuePlugin = {
  install(app, options = {}) {
    // Configure PrimeVue with theme
    app.use(PrimeVue, {
      theme: {
        preset: CortezaTheme,
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primevue',
            order: 'theme, base, primevue',
          },
        },
      },
    })

    // Add Services
    app.use(ToastService)

    // Register components
    app.component('Button', Button)
    app.component('Toast', Toast)
    app.component('Menu', Menu)

    // Set up toast service integration with Corteza
    const toastService = app.config.globalProperties.$toast
    if (toastService) {
      setToastService(toastService)
    }
  }
}