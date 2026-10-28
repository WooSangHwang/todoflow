import { FirebaseError } from 'firebase/app'
import type { ParseKeys } from 'i18next'
import { i18n } from '@/lib/i18n'

const messageKeys: Record<string, ParseKeys> = {
  'permission-denied': 'firestoreErrors.permissionDenied',
  unavailable: 'firestoreErrors.unavailable',
  'deadline-exceeded': 'firestoreErrors.deadlineExceeded',
  'resource-exhausted': 'firestoreErrors.resourceExhausted',
  'not-found': 'firestoreErrors.notFound',
  unauthenticated: 'firestoreErrors.unauthenticated',
}

export const getFirestoreErrorMessage = (error: unknown) => {
  const key = error instanceof FirebaseError ? messageKeys[error.code] : undefined
  return i18n.t(key ?? 'firestoreErrors.unknown')
}
