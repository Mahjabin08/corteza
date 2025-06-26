import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config'
import { definePreset, palette } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const CortezaTheme = definePreset(Aura, {
    semantic: {
        primary: palette('#FF9661')
    },
    extend: {
        body: {
            backgroundColor: 'var(--p-surface-0)'
        },
        topbar: {
            backgroundColor: 'var(--p-surface-0)'
        },
        sidebar: {
            backgroundColor: 'var(--p-surface-0)'
        }
    },
    css: ({ dt }) => `
        /* Global CSS */
        body {
            background-color: ${dt('body.backgroundColor')};
        }
    `
})

import './assets/styles.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
    theme: {
        preset: CortezaTheme,
        options: {
            darkModeSelector: false || 'none',
            cssLayer: {
                name: 'primevue',
                order: 'theme, base, primevue'
            }
        }
    }
})

import ToastService from 'primevue/toastservice'
app.use(ToastService)

app.mount('body')

