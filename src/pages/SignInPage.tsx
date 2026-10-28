import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, useLocation, type Location } from 'react-router'
import { LanguageToggle } from '@/components/LanguageToggle'
import { PageShell } from '@/components/PageShell'
import { Spinner } from '@/components/Spinner'
import { TextField } from '@/components/TextField'
import { useAuth } from '@/hooks/useAuth'
import { resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/auth'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { showErrorsAndFocusFirst } from '@/lib/focus'
import { validateEmail, validatePassword, validatePasswordConfirm } from '@/lib/validation'

type Mode = 'signin' | 'signup' | 'reset'

const titleKeys = {
  signin: 'auth.signin',
  signup: 'auth.signup',
  reset: 'auth.reset',
} as const satisfies Record<Mode, string>

export const SignInPage = () => {
  const { user, loading: authLoading } = useAuth()
  const { t } = useTranslation()

  // 로그인 직후 기다리지 않도록, 브라우저가 한가할 때 할 일 화면 코드(Firestore 포함)를 미리 받아 둔다.
  useEffect(() => {
    const prefetch = () => void import('@/pages/TodoAppPage')
    // requestIdleCallback이 없는 브라우저(구형 Safari)는 잠시 뒤 받는다.
    if (!('requestIdleCallback' in window)) {
      const timer = setTimeout(prefetch, 1500)
      return () => clearTimeout(timer)
    }
    const id = requestIdleCallback(prefetch)
    return () => cancelIdleCallback(id)
  }, [])
  const location = useLocation()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [notice, setNotice] = useState<string>()

  // 로그인되면(방금 로그인했거나 이미 로그인 상태로 /signin 접근) 원래 가려던 페이지로 이동
  if (user) {
    const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/app'
    return <Navigate to={from} replace />
  }

  // 첫 제출 전에는 에러를 숨기고, 이후에는 입력할 때마다 다시 검증한다.
  const errors = {
    email: validateEmail(email),
    password: mode === 'reset' ? undefined : validatePassword(password),
    passwordConfirm:
      mode === 'signup' ? validatePasswordConfirm(password, passwordConfirm) : undefined,
  }
  const visibleErrors: Partial<typeof errors> = submitted ? errors : {}

  const switchMode = (next: Mode) => {
    setMode(next)
    setSubmitted(false)
    setFormError(undefined)
    setNotice(undefined)
    setPassword('')
    setPasswordConfirm('')
  }

  const run = async (action: () => Promise<unknown>) => {
    setSubmitting(true)
    setFormError(undefined)
    setNotice(undefined)
    try {
      await action()
    } catch (error) {
      setFormError(getAuthErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (Object.values(errors).some(Boolean)) {
      showErrorsAndFocusFirst(event.currentTarget, () => setSubmitted(true))
      return
    }
    setSubmitted(true)

    const trimmedEmail = email.trim()
    if (mode === 'signin') void run(() => signInWithEmail(trimmedEmail, password))
    if (mode === 'signup') void run(() => signUpWithEmail(trimmedEmail, password))
    if (mode === 'reset') {
      void run(async () => {
        await resetPassword(trimmedEmail)
        // 이메일 열거 보호로 미가입 이메일도 성공 응답이 오므로 가입 여부를 단정하지 않는다.
        setNotice(t('auth.resetNotice'))
      })
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-600">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <PageShell title={t(titleKeys[mode])} actions={<LanguageToggle />}>
      {mode !== 'reset' && (
        <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm dark:bg-slate-900">
          {(['signin', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => switchMode(tab)}
              aria-pressed={mode === tab}
              className={`rounded-md py-1.5 font-medium ${
                mode === tab
                  ? 'bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {t(titleKeys[tab])}
            </button>
          ))}
        </div>
      )}

      {formError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {formError}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-300"
        >
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <TextField
          label={t('auth.email')}
          error={visibleErrors.email}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode !== 'reset' && (
          <TextField
            label={t('auth.password')}
            error={visibleErrors.password}
            type="password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}

        {mode === 'signup' && (
          <TextField
            label={t('auth.passwordConfirm')}
            error={visibleErrors.passwordConfirm}
            type="password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
          />
        )}

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-700 py-2 font-medium text-white hover:bg-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Spinner />}
          {mode === 'reset' ? t('auth.sendResetEmail') : t(titleKeys[mode])}
        </button>
      </form>

      {mode === 'signin' && (
        <button
          type="button"
          onClick={() => switchMode('reset')}
          className="text-sm text-indigo-700 hover:underline dark:text-indigo-300"
        >
          {t('auth.forgotPassword')}
        </button>
      )}
      {mode === 'reset' && (
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className="text-sm text-indigo-700 hover:underline dark:text-indigo-300"
        >
          {t('auth.backToSignin')}
        </button>
      )}

      {mode !== 'reset' && (
        <>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void run(signInWithGoogle)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <GoogleIcon />
            {t('auth.continueWithGoogle')}
          </button>
        </>
      )}
    </PageShell>
  )
}

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="size-5" aria-hidden="true">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
    />
  </svg>
)
