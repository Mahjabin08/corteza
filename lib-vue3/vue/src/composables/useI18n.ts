import { ref, computed } from 'vue'
import { createI18n, useI18n as useVueI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'

interface I18nConfig {
  app: string
  lng?: string
  fallbackLng?: string | false
  ns?: string | Array<string>
  fallbackNS?: string | false
  defaultNS?: string
  baseURL?: string
  pseudo?: boolean
}

// Global i18n instance and state
let i18nInstance: I18n | null = null
const isLoaded = ref(false)

async function loadTranslations(locale: string, app: string, baseURL: string): Promise<Record<string, any>> {
  try {
    const response = await fetch(`${baseURL}/locale/${locale}/${app}`)
    if (!response.ok) {
      return {}
    }
    return await response.json()
  } catch (error) {
    console.warn(`Error loading translations for ${locale}:`, error)
    return {}
  }
}

export function createI18nInstance(config: I18nConfig): I18n {
  const devMode = process.env.NODE_ENV !== 'production'
  const defNS = 'translation'

  const {
    lng,
    fallbackLng = 'en',
    fallbackNS = false,
    pseudo = false,
  } = config

  let ns: Array<string> = []
  if (!Array.isArray(config.ns)) {
    ns = [config.ns || defNS]
  } else {
    ns = config.ns
  }

  const defaultNS = config.defaultNS || ns[0]

  if (!config.baseURL) {
    if (!(window as any).CortezaAPI) {
      throw new Error('config.js missing or window.CortezaAPI not set')
    }
    config.baseURL = `${(window as any).CortezaAPI}/system`
  }

  const isPseudo = devMode && (
    !!pseudo ||
    !!(window as any).i18nPseudoModeEnabled ||
    window.location.search.indexOf('i18nPseudoModeEnabled') > -1
  )

  // Detect language using the same order as the old system
  let detectedLng = lng
  if (!detectedLng) {
    // Check querystring, localStorage, cookie, navigator
    const urlParams = new URLSearchParams(window.location.search)
    detectedLng = urlParams.get('lng') || 
                  localStorage.getItem('i18nextLng') || 
                  document.cookie.split(';').find(c => c.trim().startsWith('i18nextLng='))?.split('=')[1] ||
                  navigator.language.split('-')[0] ||
                  'en'
  }

  const options: I18nOptions = {
    locale: detectedLng,
    fallbackLocale: fallbackLng,
    legacy: false,
    messages: {},
    silentTranslationWarn: !devMode,
    silentFallbackWarn: !devMode,
  }

  // Add pseudo transformation if enabled
  if (isPseudo) {
    options.postTranslation = (translated) => {
      if (typeof translated === 'string') {
        return `[${translated}]`
      }
      return translated
    }
  }

  i18nInstance = createI18n(options)

  // Load initial translations and set loading state
  loadTranslations(detectedLng, config.app, config.baseURL).then(messages => {
    if (Object.keys(messages).length > 0) {
      i18nInstance!.global.mergeLocaleMessage(detectedLng, messages)
    }
    isLoaded.value = true
  })

  // Set moment locale if available
  if ((window as any).moment) {
    (window as any).moment.locale(detectedLng)
  }

  // Cache language preference (same as old system)
  if (!devMode) {
    localStorage.setItem('i18nextLng', detectedLng)
    document.cookie = `i18nextLng=${detectedLng}; path=/`
  }

  return i18nInstance
}

export function useI18n() {
  if (!i18nInstance) {
    throw new Error('i18n instance not created. Call createI18nInstance first.')
  }

  const { t } = useVueI18n()

  // Provide i18next-like API for compatibility
  const i18next = {
    language: computed(() => (i18nInstance!.global.locale as any).value || i18nInstance!.global.locale),
    changeLanguage: async (lng: string) => {
      if (typeof i18nInstance!.global.locale === 'object' && 'value' in i18nInstance!.global.locale) {
        (i18nInstance!.global.locale as any).value = lng
      } else {
        i18nInstance!.global.locale = lng as any
      }
      if ((window as any).moment) {
        (window as any).moment.locale(lng)
      }
      localStorage.setItem('i18nextLng', lng)
      document.cookie = `i18nextLng=${lng}; path=/`
    },
    on: (event: string, callback: () => void) => {
      if (event === 'initialized' && isLoaded.value) {
        callback()
      } else if (event === 'initialized') {
        // Simple watch mechanism
        const checkLoaded = () => {
          if (isLoaded.value) {
            callback()
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
      }
    }
  }

  return {
    t,
    i18next,
    isLoaded: computed(() => isLoaded.value),
  }
}

// Vue plugin installation (matches old pattern)
export function installI18n(app: any, config: I18nConfig) {
  const i18n = createI18nInstance(config)
  app.use(i18n)
  return i18n
} 