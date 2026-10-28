import { flushSync } from 'react-dom'

// 제출 시 오류 표시(aria-invalid)를 즉시 렌더한 뒤 첫 번째 오류 칸으로 포커스를 옮긴다.
// 스크린리더는 포커스된 칸의 aria-describedby(오류 문구)를 함께 읽어 준다.
export const showErrorsAndFocusFirst = (form: HTMLFormElement, showErrors: () => void) => {
  flushSync(showErrors)
  form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
