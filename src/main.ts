/* Main entracne */
import { createApp } from 'vue'

// Plugins
import i18n from './i18n'
import pinia from './stores'
import router from './router'

// Global stylesheets
import 'normalize.css'
import 'vue-multiselect/dist/vue3-multiselect.css'
import './style.css'

// Font awesome
import { library as faCore } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faArrowRotateLeft, faChartLine, faCircleStop, faCode, faDice, faDownload, faFileExport, faFileImport, faGear, faLanguage, faLeftLong, faListOl, faMedal, faRocket, faSeedling, faStar, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons'

// Root component
import App from './App.vue'

// Add icons to font awesome library
faCore.add(
  faArrowRotateLeft, faChartLine, faCircleStop, faCode, faDice, faDownload,
  faFileImport, faFileExport, faGear,
  faLanguage, faLeftLong, faListOl,
  faMedal, faSeedling, faStar, faTrash, faRocket,
  faUpload
)

// Create application
createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .component('FontAwesomeIcon', FontAwesomeIcon)
  .mount('#app')