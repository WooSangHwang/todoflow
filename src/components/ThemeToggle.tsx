import { useTranslation } from 'react-i18next'
import { useTheme } from '@/hooks/useTheme'
import type { Theme } from '@/lib/theme'

const order: Theme[] = ['system', 'light', 'dark']
const icons: Record<Theme, string> = { system: '🖥️', light: '☀️', dark: '🌙' }

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation()
  const next = order[(order.indexOf(theme) + 1) % order.length]

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t('theme.label', { current: t(`theme.${theme}`), next: t(`theme.${next}`) })}
      title={t('theme.title', { current: t(`theme.${theme}`) })}
      className="rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
    >
      <span aria-hidden="true">{icons[theme]}</span>
    </button>
  )
}
