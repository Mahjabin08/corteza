import { useApiClients } from '../composables/useApiClients'
import type { App } from 'vue'

interface ApiConfig {
  baseURL?: string
}

export const SystemAPIPlugin = {
  install(app: App, config?: ApiConfig) {
    try {
      const apiClients = useApiClients(config)
      app.config.globalProperties.$SystemAPI = apiClients.SystemAPI
      app.provide('SystemAPI', apiClients.SystemAPI)
      console.log('SystemAPI configured successfully')
    } catch (error) {
      console.error('Failed to install SystemAPI plugin:', error)
      throw error
    }
  }
}

export const ComposeAPIPlugin = {
  install(app: App, config?: ApiConfig) {
    try {
      const apiClients = useApiClients(config)
      app.config.globalProperties.$ComposeAPI = apiClients.ComposeAPI
      app.provide('ComposeAPI', apiClients.ComposeAPI)
      console.log('ComposeAPI configured successfully')
    } catch (error) {
      console.error('Failed to install ComposeAPI plugin:', error)
      throw error
    }
  }
}

export const AutomationAPIPlugin = {
  install(app: App, config?: ApiConfig) {
    try {
      const apiClients = useApiClients(config)
      app.config.globalProperties.$AutomationAPI = apiClients.AutomationAPI
      app.provide('AutomationAPI', apiClients.AutomationAPI)
      console.log('AutomationAPI configured successfully')
    } catch (error) {
      console.error('Failed to install AutomationAPI plugin:', error)
      throw error
    }
  }
}

export const FederationAPIPlugin = {
  install(app: App, config?: ApiConfig) {
    try {
      const apiClients = useApiClients(config)
      app.config.globalProperties.$FederationAPI = apiClients.FederationAPI
      app.provide('FederationAPI', apiClients.FederationAPI)
      console.log('FederationAPI configured successfully')
    } catch (error) {
      console.error('Failed to install FederationAPI plugin:', error)
      throw error
    }
  }
}

// Combined API clients plugin (for convenience)
export const ApiClientsPlugin = {
  install(app: App, config?: ApiConfig) {
    try {
      // Initialize API clients with configuration
      const apiClients = useApiClients(config)

      // Provide API clients globally for easy access
      app.config.globalProperties.$api = apiClients
      app.provide('apiClients', apiClients)

      console.log('API clients configured successfully')
    } catch (error) {
      console.error('Failed to install API clients plugin:', error)
      throw error
    }
  }
}