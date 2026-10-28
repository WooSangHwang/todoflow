import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState, type ReactNode } from 'react'
import { AuthContext, type AuthState } from '@/lib/authContext'
import { auth } from '@/lib/firebase'

// 인증 상태를 앱 전체에서 한 번만 구독해 모든 useAuth() 호출이 같은 값을 보도록 한다.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => onAuthStateChanged(auth, (user) => setState({ user, loading: false })), [])

  return <AuthContext value={state}>{children}</AuthContext>
}
