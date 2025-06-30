import { computed, inject } from 'vue'
import { apiClients } from '@cortezaproject/corteza-js-next'

interface ApiConfig {
  baseURL?: string
}

let apiConfig: ApiConfig = {}

export function useApiClients(config?: ApiConfig) {
  if (config) {
    apiConfig = { ...apiConfig, ...config }
  }

  const auth = inject('auth') as any
  const accessTokenFn = auth?.accessTokenFn || (() => undefined)

  const getBaseURL = (service: string) => {
    if (apiConfig.baseURL) {
      return `${apiConfig.baseURL}/${service}`
    }

    // @ts-ignore - CortezaAPI is set in config.js
    if (!window.CortezaAPI) {
      throw new Error('config.js missing or window.CortezaAPI not set')
    }

    // @ts-ignore
    return `${window.CortezaAPI}/${service}`
  }

  const SystemAPI = computed(() => {
    return new apiClients.System({
      baseURL: getBaseURL('system'),
      accessTokenFn
    })
  })

  const ComposeAPI = computed(() => {
    return new apiClients.Compose({
      baseURL: getBaseURL('compose'),
      accessTokenFn
    })
  })

  const AutomationAPI = computed(() => {
    return new apiClients.Automation({
      baseURL: getBaseURL('automation'),
      accessTokenFn
    })
  })

  const FederationAPI = computed(() => {
    return new apiClients.Federation({
      baseURL: getBaseURL('federation'),
      accessTokenFn
    })
  })

  return {
    SystemAPI,
    ComposeAPI,
    AutomationAPI,
    FederationAPI
  }
}