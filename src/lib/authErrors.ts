import { FirebaseError } from 'firebase/app'
import type { ParseKeys } from 'i18next'
import { i18n } from '@/lib/i18n'
import { MIN_PASSWORD_LENGTH } from '@/lib/validation'

// 이메일 열거 보호(2023-09 이후 프로젝트 기본값)가 켜져 있으면 user-not-found / wrong-password 대신
// invalid-credential이 반환되므로 "계정 없음"과 "비밀번호 틀림"을 구분하지 않는다.
const messageKeys: Record<string, ParseKeys> = {
  'auth/invalid-credential': 'auth.errors.invalidCredential',
  'auth/user-not-found': 'auth.errors.invalidCredential',
  'auth/wrong-password': 'auth.errors.invalidCredential',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/network-request-failed': 'auth.errors.network',
  'auth/popup-closed-by-user': 'auth.errors.popupClosed',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  'auth/cancelled-popup-request': 'auth.errors.popupClosed',
}

export const getAuthErrorMessage = (error: unknown) => {
  const key = error instanceof FirebaseError ? messageKeys[error.code] : undefined
  return i18n.t(key ?? 'auth.errors.unknown', { min: MIN_PASSWORD_LENGTH })
}
