import { ToastPlugin } from '@cortezaproject/corteza-vue-next'
import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'

import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Ripple from 'primevue/ripple'
import Select from 'primevue/select'
import ToastService from 'primevue/toastservice'

export const PrimeVuePlugin = {
  install(app, options = {}) {
    app.use(PrimeVue, {
      theme: {
        preset: getCortezaTheme(options),
        options: {
          darkModeSelector: 'none',
          cssLayer: {
            name: 'primevue',
            order: 'tailwind-base, primevue, tailwind-utilities',
          },
        },
      },
      ripple: true,
    })

    app.directive('ripple', Ripple)

    app.component('Button', Button)
    app.component('Checkbox', Checkbox)
    app.component('Select', Select)

    app.use(ToastService)
    app.use(ToastPlugin)
  },
}

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
