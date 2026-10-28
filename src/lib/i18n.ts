import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import ko from '@/locales/ko.json'

export const LANGUAGES = ['ko', 'en'] as const
export type Language = (typeof LANGUAGES)[number]

const STORAGE_KEY = 'lang'

const isLanguage = (value: unknown): value is Language => LANGUAGES.includes(value as Language)

// 저장된 선택 → 브라우저 언어(ko로 시작하면 한국어) → 영어 순으로 정한다.
const detectLanguage = (): Language => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (isLanguage(stored)) return stored
  } catch {
    // 저장소를 쓸 수 없으면(시크릿 모드 등) 브라우저 언어로 정한다.
  }
  return navigator.languages.some((lang) => lang.toLowerCase().startsWith('ko')) ? 'ko' : 'en'
}

// 번역 파일은 몇 KB라 함께 번들한다. 덕분에 초기화가 동기로 끝나 첫 렌더부터 번역된 글자가 나온다.
void i18n.use(initReactI18next).init({
  resources: { ko: { translation: ko }, en: { translation: en } },
  lng: detectLanguage(),
  fallbackLng: 'ko',
  initAsync: false,
  // React가 이미 이스케이프하므로 중복 이스케이프(&#39; 등)를 끈다.
  interpolation: { escapeValue: false },
})

// 스크린리더가 올바른 발음 규칙을 쓰도록 <html lang>도 함께 바꾼다.
const syncDocumentLanguage = (lang: string) => {
  document.documentElement.lang = lang
}
syncDocumentLanguage(i18n.language)
i18n.on('languageChanged', syncDocumentLanguage)

export const currentLanguage = (): Language => (isLanguage(i18n.language) ? i18n.language : 'ko')

export const changeLanguage = (lang: Language) => {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // 저장하지 못해도 현재 세션에는 적용된다.
  }
  void i18n.changeLanguage(lang)
}

export { i18n }
