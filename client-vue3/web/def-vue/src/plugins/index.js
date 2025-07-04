import { createPinia } from 'pinia'
import { AuthPlugin, SystemAPIPlugin, ComposeAPIPlugin, AutomationAPIPlugin, I18nPlugin, SettingsPlugin } from '@cortezaproject/corteza-vue-next'
import { PrimeVuePlugin } from './components'
import router from '../router'

export function setupAndAuthenticate(app) {
  app.use(SystemAPIPlugin)
  app.use(ComposeAPIPlugin)
  app.use(AutomationAPIPlugin)

  app.use(AuthPlugin, { app: 'one', rootApp: true })

  const $auth = app.config.globalProperties.$auth

  return $auth.handle().then(async () => {
    app.use(createPinia())
    app.use(router)

    app.use(PrimeVuePlugin)

    app.use(SettingsPlugin)

    app.use(I18nPlugin, {
      app: 'corteza-webapp-one',
      ns: ['app', 'layout', 'navigation', 'notification', 'notifications'],
      fallbackLng: 'en'
    })

    await app.config.globalProperties.$Settings.init({ api: app.config.globalProperties.$SystemAPI })

    return app
  }).catch((err) => {
    if (err instanceof Error && err.message === 'Unauthenticated') {
      $auth.startAuthenticationFlow()
      return
    }
    throw err
  })
}
