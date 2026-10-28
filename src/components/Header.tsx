import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'
import { LanguageToggle } from '@/components/LanguageToggle'
import { Spinner } from '@/components/Spinner'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useAuth } from '@/hooks/useAuth'
import { logOut } from '@/lib/auth'

export const Header = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogOut = async () => {
    setLoggingOut(true)
    try {
      // signOut 완료 후 이동해야 /signin이 아직 로그인 상태로 보고 되돌려 보내지 않는다.
      await logOut()
      navigate('/signin', { replace: true })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/app" className="font-bold text-slate-900 dark:text-white">
          TodoFlow
        </Link>
        <nav
          aria-label={t('nav.userMenu')}
          className="flex min-w-0 items-center gap-2 text-sm sm:gap-3"
        >
          <LanguageToggle />
          <ThemeToggle />
          <Link
            to="/account"
            className="truncate text-slate-600 hover:underline dark:text-slate-300"
          >
            {user?.displayName ?? user?.email}
          </Link>
          <button
            type="button"
            onClick={() => void handleLogOut()}
            disabled={loggingOut}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {loggingOut && <Spinner className="size-3.5" />}
            {t('nav.logout')}
          </button>
        </nav>
      </div>
    </header>
  )
}
