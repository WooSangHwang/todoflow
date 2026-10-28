import { use } from 'react'
import { ToastContext } from '@/lib/toastContext'

export const useToast = () => {
  const api = use(ToastContext)
  if (!api) throw new Error('useToast는 ToastProvider 안에서만 사용할 수 있습니다.')
  return api
}
