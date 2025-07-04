import { installI18n } from '../composables/useI18n'
import type { App } from 'vue'

interface I18nConfig {
  app: string
  ns: string[]
  fallbackLng: string
}

export const I18nPlugin = {
  install(app: App, config: I18nConfig) {
    try {
      // Install i18n with provided configuration
      installI18n(app, config)
      console.log('i18n configured successfully')
    } catch (error) {
      console.error('Failed to install i18n plugin:', error)
      throw error
    }
  }
}