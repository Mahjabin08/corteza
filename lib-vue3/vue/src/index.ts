// No CSS imports - client's Tailwind handles all styling

// Export Vue plugins
export { default as AuthPlugin } from './plugins/auth'
export { SystemAPIPlugin, ComposeAPIPlugin, AutomationAPIPlugin, FederationAPIPlugin } from './plugins/corteza-api'
export { SettingsPlugin } from './plugins/settings'
export { I18nPlugin } from './plugins/i18n'
export { ToastPlugin } from './plugins/toast'

// Export utility composables
export { useI18n, createI18nInstance, installI18n } from './composables/useI18n'

// Export components
export * as components from './components'
