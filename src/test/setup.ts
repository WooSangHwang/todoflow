import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'
import { i18n } from '@/lib/i18n'

// jsdom에 없는 브라우저 API. 시스템 테마는 항상 라이트로 본다.
window.matchMedia ??= (query: string) =>
  ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as MediaQueryList

// jsdom은 <dialog>의 모달 API를 구현하지 않는다. 열림 상태(open 속성)와 close 이벤트만 흉내 낸다.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.open = true
}
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.open = false
  this.dispatchEvent(new Event('close'))
}

// jsdom의 브라우저 언어는 en-US라서, 테스트는 기준 언어인 한국어로 고정한다.
beforeAll(async () => {
  await i18n.changeLanguage('ko')
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})
