import { i18n } from '@/lib/i18n'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Firebase Auth의 기본 최소 비밀번호 길이
export const MIN_PASSWORD_LENGTH = 6

// 각 함수는 문제가 있으면 (현재 언어의) 에러 메시지를, 없으면 undefined를 반환한다.

export const validateEmail = (email: string) => {
  if (!email.trim()) return i18n.t('auth.validation.emailRequired')
  if (!EMAIL_PATTERN.test(email.trim())) return i18n.t('auth.validation.emailInvalid')
}

export const validatePassword = (password: string) => {
  if (!password) return i18n.t('auth.validation.passwordRequired')
  if (password.length < MIN_PASSWORD_LENGTH) {
    return i18n.t('auth.validation.passwordTooShort', { min: MIN_PASSWORD_LENGTH })
  }
}

export const validatePasswordConfirm = (password: string, confirm: string) => {
  if (!confirm) return i18n.t('auth.validation.confirmRequired')
  if (password !== confirm) return i18n.t('auth.validation.confirmMismatch')
}
