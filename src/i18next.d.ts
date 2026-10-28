import 'i18next'
import type ko from '@/locales/ko.json'

// ko.json을 기준으로 번역 키를 타입 검사한다. 없는 키를 쓰면 컴파일 에러가 난다.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof ko }
  }
}
