import type { App } from 'vue'
import { ref, computed, type ComputedRef } from 'vue'
import axios, { type AxiosInstance } from 'axios'
import { system } from '@cortezaproject/corteza-js-next'

// Constants from original plugin
const oauth2FlowURL = '/oauth2/default-client'
const oauth2InfoURL = '/oauth2/info'
const oauth2Scope = 'profile api'
const storeKeyFlowStarted = 'auth.flow-started'
const storeKeyFinalState = 'auth.state.final'
const storeKeyRefreshToken = 'auth.refresh-token'
const maxStartAttempts = 5

interface AuthInfo {
  accessTokenFn: () => string | undefined
  user: system.User
}

interface OAuth2TokenResponse {
  aud: string
  sub: string
  scope: string
  access_token: string
  refresh_token: string
  expires_in: number
  roles?: string[]
  name?: string
  handle?: string
  email?: string
  preferred_language?: string
  avatarID?: string
  theme?: string
}

interface AuthConfig {
  app: string
  verbose?: boolean
  cortezaAuthURL: string
  callbackURL: string
  entrypointURL?: string
  refreshFactor?: number
}

interface AuthPluginOptions {
  app?: string
  rootApp?: boolean
  cortezaAuthURL?: string
  callbackURL?: string
  verbose?: boolean
  refreshFactor?: number
  entrypointURL?: string
}

interface Logger {
  debug(...data: unknown[]): void
  info(...data: unknown[]): void
  error(...data: unknown[]): void
}

function makeUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

class AuthManager {
  private accessToken = ref<string | undefined>(undefined)
  private user = ref<system.User | undefined>(undefined)
  private refreshTimeout: number | undefined
  private expiresIn = 0
  private config: AuthConfig
  private $emit: ((event: string, ...args: unknown[]) => void) | undefined

  constructor(config: AuthConfig, emitFn?: (event: string, ...args: unknown[]) => void) {
    this.config = config
    this.$emit = emitFn

    const log = this.getLogger()
    log.debug('initialized auth manager', {
      app: config.app,
      cortezaAuthURL: config.cortezaAuthURL,
      callbackURL: config.callbackURL,
      entrypointURL: config.entrypointURL,
    })
  }

  private getAxios(): AxiosInstance {
    return axios.create({ baseURL: this.config.cortezaAuthURL })
  }

  private getLogger(): Logger {
    if (this.config.verbose) {
      return console
    }
    const noop = (): void => {}
    return { debug: noop, info: noop, error: noop }
  }

  private handleStateManagement(): boolean {
    const dup = window.sessionStorage.getItem(storeKeyFinalState) !== null
    window.sessionStorage.setItem(storeKeyFinalState, Date.now().toString())
    return dup
  }

  private bindListeners(): void {
    const cleanFlags = () => {
      window.sessionStorage.removeItem(storeKeyFinalState)
    }

    window.addEventListener('pagehide', cleanFlags)
    window.addEventListener('unload', cleanFlags)
    window.addEventListener('beforeunload', cleanFlags)
  }

  private cleanFlags(): void {
    window.sessionStorage.removeItem(storeKeyFinalState)
  }

  private completeFinalState(): void {
    window.sessionStorage.removeItem(storeKeyFlowStarted)
    const stateKey = /^auth\.state\.\w+\.location$/
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)
      if (key !== null && stateKey.test(key)) {
        window.sessionStorage.removeItem(key)
      }
    }
  }

  private isCallback(url: string): boolean {
    return /\/auth\/callback$/.test(url)
  }

  private getRedirect(url: string): string {
    const u = new URL(url)
    if (this.isCallback(u.pathname)) {
      u.pathname = ''
      u.search = ''
      u.hash = ''
    }
    return u.toString()
  }

  private incFlowCounter(): void {
    const aux = window.sessionStorage.getItem(storeKeyFlowStarted)
    if (aux === null) {
      window.sessionStorage.setItem(storeKeyFlowStarted, '1')
      return
    }

    const count = parseInt(window.sessionStorage.getItem(storeKeyFlowStarted) as string)
    if (count >= maxStartAttempts) {
      window.sessionStorage.removeItem(storeKeyFlowStarted)
      throw new Error('could not start authentication flow, too many attempts')
    }

    window.sessionStorage.setItem(storeKeyFlowStarted, (count + 1).toString())
  }

  private async oauth2token(payload: Record<string, string>): Promise<OAuth2TokenResponse> {
    const data = new URLSearchParams()
    const log = this.getLogger()

    log.debug('exchanging for token', payload)

    Object.entries(payload).forEach(([key, value]) => {
      data.set(key, value)
    })

    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
    const { data: responseData } = await this.getAxios().post(oauth2FlowURL, data, { headers })
    return responseData
  }

  private procTokenResponse(oa2tkn: OAuth2TokenResponse): AuthInfo {
    const log = this.getLogger()
    log.debug('new token', oa2tkn)

    if (this.refreshTimeout) {
      window.clearTimeout(this.refreshTimeout)
    }

    this.expiresIn = oa2tkn.expires_in
    const timeout = this.expiresIn * (this.config.refreshFactor || 0.75)

    log.debug('setting up refresh timeout callback', {
      expires_in: this.expiresIn,
      timeout,
    })

    this.refreshTimeout = window.setTimeout(async () => {
      const tkn = window.sessionStorage.getItem(storeKeyRefreshToken) || ''
      try {
        await this.exchangeRefresh(tkn)
      } catch (err) {
        log.error('refresh token exchange failed', err)
        this.startAuthenticationFlow()
      }
    }, 1000 * timeout)

    window.sessionStorage.setItem(storeKeyRefreshToken, oa2tkn.refresh_token)

    const u = new system.User({
      userID: oa2tkn.sub,
      meta: {
        preferredLanguage: oa2tkn.preferred_language || 'en',
        avatarID: oa2tkn.avatarID,
        theme: oa2tkn.theme,
      },
      ...oa2tkn,
    })

    this.accessToken.value = oa2tkn.access_token
    this.user.value = u

    if (this.$emit) {
      this.$emit('auth-token-processed', {
        user: u,
        accessToken: this.accessToken.value,
      })
    }

    return {
      accessTokenFn: () => this.accessToken.value,
      user: u,
    }
  }

  private async exchangeCode(code = ''): Promise<AuthInfo> {
    const oa2tr = await this.oauth2token({
      code,
      scope: oauth2Scope,
      redirect_uri: this.config.callbackURL,
    })
    return this.procTokenResponse(oa2tr)
  }

  private async exchangeRefresh(refreshToken: string): Promise<AuthInfo | null> {
    this.completeFinalState()

    try {
      const oa2tr = await this.oauth2token({
        refresh_token: refreshToken || '',
      })
      return this.procTokenResponse(oa2tr)
    } catch (err: any) {
      const { response: { data: { error = undefined } = {} } = {} } = err
      if (error === 'invalid_grant') {
        this.pruneStore()
        throw new Error('Unauthenticated')
      }
      throw err
    }
  }

  private pruneStore(): void {
    this.accessToken.value = undefined
    this.user.value = undefined
    window.sessionStorage.clear()
  }

  public startAuthenticationFlow(): void {
    const log = this.getLogger()
    log.debug('starting new authentication flow')

    this.cleanFlags()
    this.incFlowCounter()

    const state = Math.random().toString(36).substring(2)
    window.sessionStorage.setItem(`auth.state.${state}.location`, this.getRedirect(window.location.toString()))

    const url = new URL(this.config.cortezaAuthURL + oauth2FlowURL)
    url.searchParams.set('redirect_uri', this.config.callbackURL)
    url.searchParams.set('scope', oauth2Scope)
    url.searchParams.set('state', state)

    window.location.assign(url.toString())
  }

  private async handleCallbackRoute(state: string | null, code: string): Promise<AuthInfo | null> {
    const log = this.getLogger()
    let finalLocation = this.config.entrypointURL || window.location.toString()

    if (state) {
      const storeKeyStateLocation = `auth.state.${state}.location`
      const tmp = window.sessionStorage.getItem(storeKeyStateLocation)
      if (tmp === null) {
        console.warn('state does not match, restarting authentication flow')
        this.startAuthenticationFlow()
        return null
      }

      if (!this.isCallback(tmp)) {
        finalLocation = tmp
      }

      window.sessionStorage.removeItem(storeKeyStateLocation)
    }

    log.info('authorization code received', code)
    const rsp = await this.exchangeCode(code)

    log.info('redirecting back to final destination', finalLocation)
    this.cleanFlags()
    window.location.assign(finalLocation)
    return rsp
  }

  private async handleState(): Promise<AuthInfo | null> {
    const log = this.getLogger()
    log.info('checking authentication')

    if (this.accessToken.value) {
      log.info('access token found')
      const headers = { Authorization: `Bearer ${this.accessToken.value}` }
      log.info('fetching authentication info from ' + oauth2InfoURL)

      try {
        const { data } = await this.getAxios().get(oauth2InfoURL, { headers })
        log.info('data fetch from info endpoint', { oauth2InfoURL, headers, data })

        const authUser = new system.User({
          userID: data.sub,
          meta: {
            preferredLanguage: data.preferred_language || 'en',
            avatarID: data.avatarID,
            theme: data.theme,
          },
          ...data,
        })

        this.user.value = authUser
        this.bindListeners()
        return { accessTokenFn: () => this.accessToken.value, user: authUser }
      } catch (error) {
        log.error('data fetch from info endpoint failed', { oauth2InfoURL, headers, error })
        this.accessToken.value = undefined
        throw new Error('Unauthenticated')
      }
    }

    const refreshToken = window.sessionStorage.getItem(storeKeyRefreshToken)
    if (refreshToken) {
      log.debug('refresh token found', { refreshToken })
      log.info('refreshing token', refreshToken)

      const result = await this.exchangeRefresh(refreshToken)
      if (result) {
        this.bindListeners()
      }
      return result
    }

    throw new Error('Unauthenticated')
  }

  public async handle(req?: URL): Promise<AuthInfo | null> {
    const log = this.getLogger()
    log.info('handling authenticationn')

    const requestUrl = req || new URL(this.config.entrypointURL || window.location.toString())

    // State management
    const dup = this.handleStateManagement()
    if (dup) {
      log.debug('duplicate tab: unauthorized')
      throw new Error('Unauthenticated')
    }

    // Handle auth callback requests
    const params = new URLSearchParams(requestUrl.search)
    if (this.isCallback(requestUrl.pathname) && (params.has('error') || params.has('code'))) {
      if (params.has('error')) {
        throw new Error(params.get('error') || 'authentication flow failed with error')
      }

      log.info('handling authentication callback')
      this.handleCallbackRoute(params.get('state'), params.get('code') as string || '')

      throw new Error('Callback')
    }

    // Handle auth from the current system state
    log.info('handling authentication from state')
    return this.handleState()
  }

  public logout(): void {
    this.pruneStore()
    const url = new URL(`${this.config.cortezaAuthURL}/logout`)
    url.searchParams.set('back', window.location.toString())
    window.location.assign(url.toString())
  }

  public startAutoLogout(): Promise<number> {
    const tkn = window.sessionStorage.getItem(storeKeyRefreshToken) || ''
    return this.exchangeRefresh(tkn).then(() => {
      if (this.refreshTimeout) {
        window.clearTimeout(this.refreshTimeout)
      }
      return this.expiresIn
    }).catch((err) => {
      this.getLogger().error('refresh token exchange failed', err)
      throw err
    })
  }

  public stopAutoLogout(): Promise<AuthInfo | null> {
    const tkn = window.sessionStorage.getItem(storeKeyRefreshToken) || ''
    return this.exchangeRefresh(tkn).catch((err) => {
      this.getLogger().error('refresh token exchange failed', err)
      throw err
    })
  }

  // Getters for reactive values
  public get userRef() {
    return computed(() => this.user.value)
  }

  public get accessTokenRef() {
    return computed(() => this.accessToken.value)
  }

  public get accessTokenFn() {
    return () => this.accessToken.value
  }
}

export default {
  install(app: App, options: AuthPluginOptions = {}) {
    let {
      app: appName = '',
      rootApp = false,
      cortezaAuthURL = '',
      callbackURL = '',
      verbose = undefined,
      refreshFactor = 0.75,
      entrypointURL = window.location.toString(),
    } = options

    // Auto-configure cortezaAuthURL from window variables
    if (!cortezaAuthURL) {
      // @ts-ignore
      const { CortezaAPI = undefined, CortezaAuth = undefined } = window

      if (CortezaAuth) {
        cortezaAuthURL = CortezaAuth
      } else if (CortezaAPI && /\/api$/.test(CortezaAPI)) {
        cortezaAuthURL = CortezaAPI.replace('/api', '/auth')
      } else if (CortezaAPI) {
        cortezaAuthURL = CortezaAPI + '/auth'
      } else {
        throw new Error('failed to configure auth cortezaAuthURL')
      }
    }

    // Auto-configure callbackURL
    if (!callbackURL) {
      if (!appName) {
        throw new Error('can not construct callbackURL; specify \'callbackURL\' or \'app\' property')
      }

      // @ts-ignore
      const { CortezaWebapp = undefined } = window
      const callbackPath = 'auth/callback'

      if (CortezaWebapp) {
        callbackURL = makeUrl(CortezaWebapp)
      } else {
        // Try to get callbackURL from <base> tag's href value
        const baseTags = document.getElementsByTagName('base')
        if (baseTags.length === 1) {
          callbackURL = baseTags[0].href
        }

        if (!callbackURL) {
          // construct redirect URL fallback from current location
          const { protocol, host } = window.location
          callbackURL = `${protocol}//${host}`
        }
      }

      if (!rootApp) {
        callbackURL = makeUrl(callbackURL) + `/${appName}`
      }

      callbackURL = makeUrl(callbackURL) + `/${callbackPath}`
    }

    // Auto-configure verbose mode
    if (verbose === undefined) {
      verbose = window.location.hostname === 'localhost' ||
        window.location.search.includes('verboseAuth') ||
        !!window.localStorage.getItem('auth.verbose') ||
        !!window.sessionStorage.getItem('auth.verbose')
    }

    if (verbose) {
      console.debug('Auth plugin configuration:', {
        app: appName,
        verbose,
        cortezaAuthURL,
        callbackURL,
        entrypointURL,
        refreshFactor,
      })
    }

    // Create auth configuration
    const authConfig = {
      app: appName,
      verbose,
      cortezaAuthURL,
      callbackURL,
      entrypointURL,
      refreshFactor,
    }

    // Create the auth manager instance
    const authManager = new AuthManager(authConfig, (event: string, ...args: unknown[]) => {
      // Emit events on the app instance
      app.config.globalProperties.$emit?.(event, ...args)
    })

    // Create auth object with the same interface as the old composable
    const auth = {
      user: authManager.userRef,
      accessToken: authManager.accessTokenRef,
      accessTokenFn: authManager.accessTokenFn,
      handle: authManager.handle.bind(authManager),
      startAuthenticationFlow: authManager.startAuthenticationFlow.bind(authManager),
      logout: authManager.logout.bind(authManager),
      startAutoLogout: authManager.startAutoLogout.bind(authManager),
      stopAutoLogout: authManager.stopAutoLogout.bind(authManager),
    }

    // Add to global properties for backward compatibility
    app.config.globalProperties.$auth = {
      ...auth,
      // Add backward compatibility properties
      get cortezaAuthURL() { return cortezaAuthURL },
      get callbackURL() { return callbackURL },
      get entrypointURL() { return entrypointURL },
      get app() { return appName },
      get verbose() { return verbose },
    }

    // Provide auth for composition API
    app.provide('auth', auth)
  }
}