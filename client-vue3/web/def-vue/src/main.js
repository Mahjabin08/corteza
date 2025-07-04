import './config-check'

import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles.css'

import { setupAndAuthenticate } from './plugins'

const app = createApp(App)

setupAndAuthenticate(app).then(() => {
  app.mount('body')
})
