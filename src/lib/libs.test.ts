import { FirebaseError } from 'firebase/app'
import { describe, expect, it } from 'vitest'
import { getAuthErrorMessage } from '@/lib/authErrors'
import { formatDueDate, fromDateInputValue, isOverdue, toDateInputValue } from '@/lib/dates'
import { getFirestoreErrorMessage } from '@/lib/firestoreErrors'
import { i18n } from '@/lib/i18n'
import { parseTags, validateTags } from '@/lib/tags'
import { validateEmail, validatePassword, validatePasswordConfirm } from '@/lib/validation'

describe('dates', () => {
  const now = new Date(2026, 9, 28, 15, 30) // 2026-10-28 15:30

  it('date input 값과 로컬 자정 Date를 오간다', () => {
    expect(fromDateInputValue('2026-03-05')).toEqual(new Date(2026, 2, 5))
    expect(fromDateInputValue('')).toBeNull()
    expect(toDateInputValue(new Date(2026, 2, 5, 23, 59))).toBe('2026-03-05')
    expect(toDateInputValue(null)).toBe('')
  })

  it('기한 초과는 오늘보다 이전 날짜만이다', () => {
    expect(isOverdue(new Date(2026, 9, 27, 23, 59), now)).toBe(true)
    expect(isOverdue(new Date(2026, 9, 28, 0, 0), now)).toBe(false)
    expect(isOverdue(null, now)).toBe(false)
  })

  it('가까운 날은 상대 표현, 나머지는 언어에 맞는 날짜로 보여준다', async () => {
    expect(formatDueDate(new Date(2026, 9, 28), now)).toBe('오늘')
    expect(formatDueDate(new Date(2026, 9, 29), now)).toBe('내일')
    expect(formatDueDate(new Date(2026, 9, 27), now)).toBe('어제')
    expect(formatDueDate(new Date(2026, 11, 25), now)).toBe('12월 25일')
    expect(formatDueDate(new Date(2027, 0, 2), now)).toBe('2027년 1월 2일')

    await i18n.changeLanguage('en')
    expect(formatDueDate(new Date(2026, 9, 29), now)).toBe('Tomorrow')
    expect(formatDueDate(new Date(2026, 11, 25), now)).toBe('December 25')
    await i18n.changeLanguage('ko')
  })
})

describe('tags', () => {
  it('쉼표로 나누고 #·공백·중복·빈 값을 정리한다', () => {
    expect(parseTags(' 공부, #react ,공부,, #, ')).toEqual(['공부', 'react'])
  })

  it('개수와 길이를 검증한다', () => {
    expect(validateTags(['a'])).toBeUndefined()
    expect(validateTags(Array.from({ length: 11 }, (_, i) => `t${i}`))).toMatch('최대 10개')
    expect(validateTags(['a'.repeat(21)])).toMatch('20자')
  })
})

describe('validation', () => {
  it('이메일', () => {
    expect(validateEmail(' ')).toBe('이메일을 입력해 주세요.')
    expect(validateEmail('a@b')).toBe('올바른 이메일 형식이 아닙니다.')
    expect(validateEmail(' a@b.co ')).toBeUndefined()
  })

  it('비밀번호와 확인', () => {
    expect(validatePassword('')).toBe('비밀번호를 입력해 주세요.')
    expect(validatePassword('12345')).toBe('비밀번호는 최소 6자 이상이어야 합니다.')
    expect(validatePassword('123456')).toBeUndefined()
    expect(validatePasswordConfirm('123456', '')).toBe('비밀번호를 한 번 더 입력해 주세요.')
    expect(validatePasswordConfirm('123456', '123457')).toBe('비밀번호가 일치하지 않습니다.')
    expect(validatePasswordConfirm('123456', '123456')).toBeUndefined()
  })
})

describe('오류 메시지', () => {
  it('Firebase Auth 오류 코드를 사용자 메시지로 바꾸고, 모르는 오류는 일반 메시지를 쓴다', () => {
    expect(getAuthErrorMessage(new FirebaseError('auth/wrong-password', ''))).toBe(
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    )
    expect(getAuthErrorMessage(new FirebaseError('auth/weak-password', ''))).toBe(
      '비밀번호는 최소 6자 이상이어야 합니다.',
    )
    expect(getAuthErrorMessage(new Error('boom'))).toBe(
      '로그인 중 오류가 발생했습니다. 다시 시도해 주세요.',
    )
  })

  it('Firestore 오류 코드도 같은 방식이다', () => {
    expect(getFirestoreErrorMessage(new FirebaseError('not-found', ''))).toBe(
      '이미 삭제된 할 일입니다.',
    )
    expect(getFirestoreErrorMessage(new FirebaseError('internal', ''))).toBe(
      '저장 중 오류가 발생했습니다. 다시 시도해 주세요.',
    )
  })
})
