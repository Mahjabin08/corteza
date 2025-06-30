import { ref, computed } from 'vue'
import { useApiClients } from './useApiClients'

interface SettingsValue {
  name: string
  value: any
}

const settings = ref<Record<string, any>>({})
const isLoaded = ref(false)

export function useSettings() {
  const { SystemAPI } = useApiClients()

  const init = async () => {
    try {
      const response = await SystemAPI.value.settingsList({})
      const settingsList = (response as any).set || []
      settings.value = settingsList.reduce((acc: Record<string, any>, setting: SettingsValue) => {
        acc[setting.name] = setting.value
        return acc
      }, {})
      isLoaded.value = true
    } catch (err) {
      console.error('Failed to load settings:', err)
      throw err
    }
  }

  const get = (key: string, defaultValue?: any) => {
    return settings.value[key] !== undefined ? settings.value[key] : defaultValue
  }

  const set = async (key: string, value: any) => {
    try {
      await SystemAPI.value.settingsUpdate({ values: [{ name: key, value }] })
      settings.value[key] = value
    } catch (err) {
      console.error(`Failed to update setting ${key}:`, err)
      throw err
    }
  }

  const attachment = (key: string) => {
    const attachmentID = get(key)
    if (!attachmentID) return null
    
    // @ts-ignore - CortezaAPI is set in config.js
    const baseURL = window.CortezaAPI || ''
    return `${baseURL}/system/attachment/${attachmentID}/original/${key}`
  }

  const isTrue = (key: string) => {
    const value = get(key)
    return value === true || value === 'true' || value === '1'
  }

  return {
    settings: computed(() => settings.value),
    isLoaded: computed(() => isLoaded.value),
    init,
    get,
    set,
    attachment,
    isTrue
  }
} 