import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContext, type ToastApi, type ToastOptions } from '@/lib/toastContext'

type Toast = ToastOptions & { id: number }

const DEFAULT_DURATION = 4000

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const { t } = useTranslation()
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++
      setToasts((prev) => [...prev, { ...options, id }])
      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), options.duration ?? DEFAULT_DURATION),
      )
      return id
    },
    [dismissToast],
  )

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const api = useMemo<ToastApi>(() => ({ showToast, dismissToast }), [showToast, dismissToast])

  const renderToast = (toast: Toast) => (
    <div
      key={toast.id}
      className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
        toast.variant === 'error'
          ? 'bg-red-800'
          : 'bg-slate-800 dark:bg-slate-950 dark:ring-1 dark:ring-slate-600'
      }`}
    >
      <span>{toast.message}</span>
      <div className="flex shrink-0 items-center gap-2">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick()
              dismissToast(toast.id)
            }}
            className="font-semibold text-indigo-300 hover:text-indigo-200"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => dismissToast(toast.id)}
          aria-label={t('toast.close')}
          className="text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  )

  // 알림 영역(live region)은 처음부터 DOM에 두고 내용만 바꿔야 스크린리더가 안정적으로 읽는다.
  // 일반 알림은 polite, 오류는 assertive 영역에 넣는다.
  return (
    <ToastContext value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        <div role="status" className="flex w-full flex-col items-center gap-2">
          {toasts.filter((t) => t.variant !== 'error').map(renderToast)}
        </div>
        <div role="alert" className="flex w-full flex-col items-center gap-2">
          {toasts.filter((t) => t.variant === 'error').map(renderToast)}
        </div>
      </div>
    </ToastContext>
  )
}
