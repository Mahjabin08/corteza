// Export auth plugin
export { default as AuthPlugin } from './src/plugins/auth'

// Export utility composables
export { useToast, setToastService } from './src/composables/useToast'
export { useI18n, createI18nInstance, installI18n } from './src/composables/useI18n'
export { useApiClients } from './src/composables/useApiClients'
export { useSettings } from './src/composables/useSettings'

// Export components
export { CTopbar } from './src/components'
