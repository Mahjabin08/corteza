import PrimeVue from 'primevue/config'
import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import ToastService from 'primevue/toastservice'
import { setToastService } from '@cortezaproject/corteza-vue-next'

import Menu from 'primevue/menu'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import Ripple from 'primevue/ripple'

function getCortezaTheme({ variables = {} } = {}) {
  const theme = definePreset(Aura, {
    semantic: {
      primary: palette(variables['primary']),
    },
    extend: {
      body: {
        backgroundColor: variables['body-bg'],
      },
      topbar: {
        backgroundColor: variables['topbar-bg'],
      },
      sidebar: {
        backgroundColor: variables['sidebar-bg'],
      },
    },
    css: ({ dt }) => `
      :root {
        --topbar-height: 64px;
        --topbar-bg: ${dt('topbar.backgroundColor')};
        --sidebar-width: 320px;
        --sidebar-bg: ${dt('sidebar.backgroundColor')};
      }

      body {
        background-color: ${dt('body.backgroundColor')};
      }
    `,
  })

  return theme
}

export const PrimeVuePlugin = {
  install(app, options = {}) {
    // Configure PrimeVue with theme
    app.use(PrimeVue, {
      theme: {
        preset: getCortezaTheme(options),
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities'
          },
        }
      },
      ripple: true,
    })

    // Add Services
    app.use(ToastService)
    app.use(Ripple)

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