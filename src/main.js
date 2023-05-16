/* Main entrance */
import { createApp } from 'vue'

// Plugins
import i18n from './i18n'
import pinia from './stores'
import router from './router'

// Global stylesheets
import 'normalize.css'
import 'highlight.js/styles/atom-one-dark.css'
import './style.css'
import 'vue-multiselect/dist/vue3-multiselect.css'

// Root component
import App from './App.vue'

// Create application
createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .mount('#app')
