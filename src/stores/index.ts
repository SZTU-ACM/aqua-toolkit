/* Pinia */
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

// Pinia instance
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Export
export default pinia