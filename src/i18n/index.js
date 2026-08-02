import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import zhTW from './locales/zh-TW.json'

export const LANG_STORAGE_KEY = 'ansible101:lang'

function detectInitialLanguage() {
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'en' || stored === 'zh-TW') return stored
  } catch {
    // localStorage unavailable (private mode, etc) — fall through to default
  }
  return 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    'zh-TW': { translation: zhTW },
  },
  lng: detectInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export function setLanguage(lang) {
  i18n.changeLanguage(lang)
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  } catch {
    // ignore persistence failure
  }
}

export default i18n
