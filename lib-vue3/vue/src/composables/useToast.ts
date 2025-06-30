import { getCurrentInstance } from 'vue'

// Global toast service reference
let globalToastService: any = null

export function setToastService(service: any) {
  globalToastService = service
}

export function useToast() {
  const instance = getCurrentInstance()
  
  const getToastService = () => {
    // Try to get toast service from current Vue instance
    if (instance?.appContext.app.config.globalProperties.$toast) {
      return instance.appContext.app.config.globalProperties.$toast
    }
    
    // Try global reference
    if (globalToastService) {
      return globalToastService
    }
    
    return null
  }

  const addToast = (options: any) => {
    const toastService = getToastService()
    if (toastService) {
      toastService.add(options)
    } else {
      // Fallback to console
      console.log(`[${options.severity.toUpperCase()}] ${options.summary}: ${options.detail}`)
    }
  }

  const toastSuccess = (message: string, title = 'Success') => {
    addToast({
      severity: 'success',
      summary: title,
      detail: message,
      life: 7000
    })
  }

  const toastWarning = (message: string, title = 'Warning') => {
    addToast({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 7000
    })
  }

  const toastInfo = (message: string, title = 'Info') => {
    addToast({
      severity: 'info',
      summary: title,
      detail: message,
      life: 7000
    })
  }

  const toastDanger = (message: string, title = 'Error') => {
    addToast({
      severity: 'error',
      summary: title,
      detail: message,
      life: 7000
    })
  }

  const toastErrorHandler = (prefix = 'Error', title = 'Error') => {
    return (err: any = {}) => {
      const message = err.message || err.toString() || 'Unknown error'
      const msg = prefix ? `${prefix}: ${message}` : message
      toastDanger(msg, title)
      return message
    }
  }

  return {
    toastSuccess,
    toastWarning,
    toastInfo,
    toastDanger,
    toastErrorHandler
  }
} 