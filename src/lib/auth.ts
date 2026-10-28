import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

// 실패 시 FirebaseError를 그대로 던진다. 사용자용 메시지 변환은 authErrors.ts의 getAuthErrorMessage가 담당.

export const signInWithGoogle = async () => {
  const { user } = await signInWithPopup(auth, new GoogleAuthProvider())
  return user
}

export const signInWithEmail = async (email: string, password: string) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return user
}

export const signUpWithEmail = async (email: string, password: string) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  return user
}

export const resetPassword = (email: string) => sendPasswordResetEmail(auth, email)

export const logOut = () => signOut(auth)
