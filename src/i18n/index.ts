/* I18n */
import { createI18n } from 'vue-i18n'

// Languages
import en from './en.json'
import zh from './zh.json'

const langs = [
  {
    display: 'English',
    locale: 'en'
  },
  {
    display: '中文',
    locale: 'zh'
  }
]

// I18n instance
const i18n = createI18n({
  allowComposition: true,
  fallbackLocale: 'en',
  locale: localStorage.getItem('lang') ?? 'en',
  messages: {
    en: en,
    zh: zh
  }
})

// Export
export default i18n
export { langs }