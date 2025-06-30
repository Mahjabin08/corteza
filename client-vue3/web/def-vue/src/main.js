import './config-check'

import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'

import router from './router'
import { createPinia } from 'pinia'
import { AuthPlugin } from '@cortezaproject/corteza-vue-next'
import { setupI18n } from './plugins/i18n'
import { setupPrimeVue, setupToastService } from './plugins/components'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Register auth plugin
app.use(AuthPlugin, { app: 'one', rootApp: true })

// Handle authentication after all plugins are registered
const $auth = app.config.globalProperties.$auth

$auth.handle().then(() => {
  // Set up PrimeVue with theme, components, and services after successful auth
  setupPrimeVue(app)

  // Set up toast service after PrimeVue is initialized
  setupToastService(app)

  // Set up i18n
  setupI18n(app)

  app.mount('body')
}).catch((err) => {
  if (err instanceof Error && err.message === 'Unauthenticated') {
    $auth.startAuthenticationFlow()
    return
  }

  throw err
})
