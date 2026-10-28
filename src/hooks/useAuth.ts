import { use } from 'react'
import { AuthContext } from '@/lib/authContext'

export const useAuth = () => {
  const state = use(AuthContext)
  if (!state) throw new Error('useAuth는 AuthProvider 안에서만 사용할 수 있습니다.')
  return state
}
