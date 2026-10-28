import type { User } from 'firebase/auth'
import { createContext } from 'react'

export type AuthState = {
  user: User | null
  loading: boolean
}

export const AuthContext = createContext<AuthState | null>(null)
