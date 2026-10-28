// 입력 필드 공통 스타일. 너비·패딩은 fieldBaseClass에 넣지 않는다:
// Tailwind는 같은 속성의 클래스가 겹치면 class 문자열 순서가 아니라 CSS 생성 순서로 결정되므로
// (예: w-full + w-auto) 덮어쓰기가 보장되지 않는다. 크기가 다른 곳은 fieldBaseClass에 직접 붙인다.
// 포커스 표시는 index.css의 전역 :focus-visible 테두리를 쓴다(outline-none 금지).
export const fieldBaseClass = (hasError = false) =>
  `rounded-lg border bg-white text-slate-900 dark:bg-slate-900 dark:text-white ${
    hasError ? 'border-red-700 dark:border-red-400' : 'border-slate-500 dark:border-slate-400'
  }`

export const fieldClass = (hasError = false) => `w-full px-3 py-2 ${fieldBaseClass(hasError)}`

export const labelClass = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200'
