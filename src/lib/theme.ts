export type Theme = 'system' | 'light' | 'dark'

// index.html의 인라인 스크립트와 같은 키를 사용한다(첫 렌더 전 깜빡임 방지).
const STORAGE_KEY = 'theme'

const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export const getStoredTheme = (): Theme => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

export const applyTheme = (theme: Theme) => {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', dark)
}

export const storeTheme = (theme: Theme) => {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // 저장소를 쓸 수 없어도(시크릿 모드 등) 현재 세션에는 적용된다.
  }
}
