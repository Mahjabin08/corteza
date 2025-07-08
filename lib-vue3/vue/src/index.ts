// No CSS imports - client's Tailwind handles all styling

// Export Vue plugins
export { default as AuthPlugin } from './plugins/auth'
export { SystemAPIPlugin, ComposeAPIPlugin, AutomationAPIPlugin, FederationAPIPlugin } from './plugins/corteza-api'
export { SettingsPlugin } from './plugins/settings'
export { I18nPlugin } from './plugins/i18n'

// Export utility composables
export { useToast, setToastService } from './composables/useToast'
export { useI18n, createI18nInstance, installI18n } from './composables/useI18n'

// Export components
export * as components from './components'

