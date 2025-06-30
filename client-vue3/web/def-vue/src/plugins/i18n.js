import { installI18n } from '@cortezaproject/corteza-vue-next'

export function setupI18n(app) {
  // Set up i18n
  installI18n(app, {
    app: 'corteza-webapp-one',
    ns: ['app', 'layout', 'navigation', 'notification', 'notifications'],
    fallbackLng: 'en'
  })
}