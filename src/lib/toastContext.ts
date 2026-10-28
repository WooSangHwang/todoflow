import { createContext } from 'react'

export type ToastOptions = {
  message: string
  variant?: 'info' | 'error'
  action?: { label: string; onClick: () => void }
  // 자동으로 사라지기까지의 시간(ms)
  duration?: number
}

export type ToastApi = {
  showToast: (options: ToastOptions) => number
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastApi | null>(null)
