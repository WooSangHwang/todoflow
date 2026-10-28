import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, storeTheme, type Theme } from '@/lib/theme'

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    storeTheme(theme)
    if (theme !== 'system') return

    // 시스템 설정을 따를 때는 OS 테마 변경을 실시간 반영한다.
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return { theme, setTheme }
}
