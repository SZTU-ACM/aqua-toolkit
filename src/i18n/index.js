/* Internationalization */
import { createI18n } from 'vue-i18n'

// Languages
import en from './en.json'
import zh from './zh.json'
const langs = [
  {
    display: 'English',
    value: 'en'
  },
  {
    display: '简体中文',
    value: 'zh'
  }
]

// I18n instance
const i18n = createI18n({
  allowComposition: true,
  locale: localStorage.getItem('lang') ?? 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})

// Export
export default i18n
export { langs }
