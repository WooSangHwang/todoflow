import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FirebaseError } from 'firebase/app'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as auth from '@/lib/auth'
import { SignInPage } from '@/pages/SignInPage'
import { mockFirebaseUser, renderWithProviders } from '@/test/helpers'

vi.mock('@/lib/auth')

const renderSignIn = (options: Parameters<typeof renderWithProviders>[1] = {}) =>
  renderWithProviders(
    <Routes>
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/app" element={<h1>할 일 화면</h1>} />
      <Route path="/account" element={<h1>내 정보 화면</h1>} />
    </Routes>,
    { route: '/signin', user: null, ...options },
  )

// 화면에는 '로그인' 탭과 '로그인' 제출 버튼이 있다. 제출 버튼이 마지막이다.
const submit = () => userEvent.click(screen.getAllByRole('button', { name: '로그인' }).at(-1)!)

beforeEach(() => vi.resetAllMocks())

describe('이메일 로그인', () => {
  it('빈 값으로 제출하면 오류를 보여주고 첫 오류 칸에 포커스하며 요청하지 않는다', async () => {
    renderSignIn()
    await submit()

    expect(screen.getByText('이메일을 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByText('비밀번호를 입력해 주세요.')).toBeInTheDocument()
    expect(screen.getByLabelText('이메일')).toHaveFocus()
    expect(auth.signInWithEmail).not.toHaveBeenCalled()
  })

  it('올바른 값이면 앞뒤 공백을 제거한 이메일로 로그인한다', async () => {
    vi.mocked(auth.signInWithEmail).mockResolvedValue(mockFirebaseUser())
    renderSignIn()
    await userEvent.type(screen.getByLabelText('이메일'), '  me@example.com ')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'secret1')
    await submit()

    expect(auth.signInWithEmail).toHaveBeenCalledWith('me@example.com', 'secret1')
  })

  it('실패하면 Firebase 오류 코드를 사용자 메시지로 보여준다', async () => {
    vi.mocked(auth.signInWithEmail).mockRejectedValue(
      new FirebaseError('auth/invalid-credential', 'raw'),
    )
    renderSignIn()
    await userEvent.type(screen.getByLabelText('이메일'), 'me@example.com')
    await userEvent.type(screen.getByLabelText('비밀번호'), 'wrong12')
    await submit()

    expect(await screen.findByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toHaveAttribute(
      'role',
      'alert',
    )
  })
})

it('Google 버튼은 Google 로그인을 호출한다', async () => {
  vi.mocked(auth.signInWithGoogle).mockResolvedValue(mockFirebaseUser())
  renderSignIn()
  await userEvent.click(screen.getByRole('button', { name: 'Google로 계속하기' }))
  expect(auth.signInWithGoogle).toHaveBeenCalledOnce()
})

it('회원가입은 비밀번호 확인이 다르면 요청하지 않는다', async () => {
  renderSignIn()
  await userEvent.click(screen.getByRole('button', { name: '회원가입' }))
  await userEvent.type(screen.getByLabelText('이메일'), 'new@example.com')
  await userEvent.type(screen.getByLabelText('비밀번호'), 'secret1')
  await userEvent.type(screen.getByLabelText('비밀번호 확인'), 'secret2')
  await userEvent.click(screen.getAllByRole('button', { name: '회원가입' }).at(-1)!)

  expect(screen.getByText('비밀번호가 일치하지 않습니다.')).toBeInTheDocument()
  expect(auth.signUpWithEmail).not.toHaveBeenCalled()
})

it('비밀번호 재설정은 가입 여부를 단정하지 않는 안내를 보여준다', async () => {
  vi.mocked(auth.resetPassword).mockResolvedValue()
  renderSignIn()
  await userEvent.click(screen.getByRole('button', { name: '비밀번호를 잊으셨나요?' }))
  await userEvent.type(screen.getByLabelText('이메일'), 'me@example.com')
  await userEvent.click(screen.getByRole('button', { name: '재설정 메일 보내기' }))

  expect(auth.resetPassword).toHaveBeenCalledWith('me@example.com')
  expect(await screen.findByText(/가입된 이메일이라면/)).toHaveAttribute('role', 'status')
})

describe('이미 로그인한 경우', () => {
  it('원래 가려던 페이지로 보낸다', () => {
    renderWithProviders(
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/account" element={<h1>내 정보 화면</h1>} />
      </Routes>,
      { route: { pathname: '/signin', state: { from: { pathname: '/account' } } } },
    )
    expect(screen.getByRole('heading', { name: '내 정보 화면' })).toBeInTheDocument()
  })

  it('가려던 페이지가 없으면 /app으로 보낸다', () => {
    renderSignIn({ user: mockFirebaseUser() })
    expect(screen.getByRole('heading', { name: '할 일 화면' })).toBeInTheDocument()
  })
})
