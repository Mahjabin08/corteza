import {
  AuthPlugin,
  AutomationAPIPlugin,
  ComposeAPIPlugin,
  SettingsPlugin,
  SystemAPIPlugin,
} from '@cortezaproject/corteza-vue-next'
import { createPinia } from 'pinia'
import router from '../router'
import { UIPlugin } from './components'

export function setupAndAuthenticate(app) {
  app.use(AuthPlugin, { app: 'one', rootApp: true })

  const $auth = app.config.globalProperties.$auth

  return $auth
    .handle()
    .then(() => {
      app.use(SystemAPIPlugin)
      app.use(ComposeAPIPlugin)
      app.use(AutomationAPIPlugin)

      app.use(SettingsPlugin, {
        api: app.config.globalProperties.$SystemAPI,
      })

      app.use(createPinia())
      app.use(router)

      // app.use(I18nPlugin, {
      //   app: 'corteza-webapp-one',
      //   ns: ['app', 'layout', 'navigation', 'notification', 'notifications'],
      //   fallbackLng: 'en'
      // })

      return app.config.globalProperties.$Settings.init().then(() => {
        const currentUserTheme = app.config.globalProperties.$auth.user.meta.theme
        const studioTheme = app.config.globalProperties.$Settings
          .get('ui.studio.themes')
          .find((theme) => theme.id === currentUserTheme)
        const variables = JSON.parse(studioTheme.values)

        app.use(UIPlugin, { variables })
      })
    })
    .catch((err) => {
      if (err instanceof Error && err.message === 'Unauthenticated') {
        $auth.startAuthenticationFlow()
        return
      }
      throw err
    })
}
