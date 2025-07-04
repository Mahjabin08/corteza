import type { App } from 'vue'
import { reactive } from 'vue'

interface SettingsOptions {
  api?: any
}

const localAttachment = /^attachment:(\d+)/

export class Settings {
  current = reactive<Record<string, any>>({})
  api: any = undefined

  constructor() {
    return this
  }

  async init({ api }: { api: any }) {
    // Handle computed refs by getting the .value if it exists
    this.api = api?.value || api
    if (!this.api) {
      throw new Error('api.notDefined')
    }

    return this.fetch()
  }

  async fetch() {
    try {
      // Handle computed refs by getting the .value if it exists
      const apiClient = this.api?.value || this.api
      const response = await apiClient.settingsCurrent()
      this.current = reactive(response || {})

      return response
    } catch (error) {
      console.error('Failed to fetch settings:', error)
      throw error
    }
  }

  /**
   * Provides the setting for the given key
   * @param {String} k Setting key
   * @param {*} d Default value
   * @returns {*}
   */
  get(k: string, d?: any): any {
    const keys = k.split(/\./g)
    let s = this.current

    for (let i = 0; i < keys.length - 1; i++) {
      const p = keys[i]
      s = s[p] || {}
    }

    const v = s[keys[keys.length - 1]]
    return v !== undefined ? v : d
  }

  /**
   * Provides the attachment for the given resource
   * @param {String} k Setting key
   * @param {*} d Default value
   * @returns {*}
   */
  attachment(k: string, d?: any): string | undefined {
    const src = this.get(k, d)

    if (localAttachment.test(src)) {
      const match = localAttachment.exec(src)
      if (match) {
        const attachmentID = match[1]

        // Handle computed refs by getting the .value if it exists
        const apiClient = this.api?.value || this.api

        return apiClient.baseURL +
          apiClient.attachmentOriginalEndpoint({
            attachmentID,
            kind: 'settings',
            name: k,
          })
      }
    }

    if (src) {
      // Handle computed refs by getting the .value if it exists
      const apiClient = this.api?.value || this.api

      return apiClient.baseURL
        .replace(/\/system$/, '')
        .replace(/\/api$/, '') + src
    }

    return d
  }
}

export const SettingsPlugin = {
  install(app: App, options: SettingsOptions = {}) {
    try {
      // Create settings instance
      const settings = new Settings()

      app.config.globalProperties.$Settings = settings

      app.provide('settings', settings)

      console.log('Settings plugin configured successfully')
    } catch (error) {
      console.error('Failed to install Settings plugin:', error)
      throw error
    }
  }
}