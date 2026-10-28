import { screen } from '@testing-library/react'
import { Route, Routes, useLocation } from 'react-router'
import { expect, it } from 'vitest'
import { PrivateRoute } from '@/components/PrivateRoute'
import { mockFirebaseUser, renderWithProviders } from '@/test/helpers'

const SignInProbe = () => {
  const from = (useLocation().state as { from?: { pathname: string } } | null)?.from?.pathname
  return <h1>로그인 화면 (from: {from})</h1>
}

const renderAt = (options: Parameters<typeof renderWithProviders>[1]) =>
  renderWithProviders(
    <Routes>
      <Route path="/signin" element={<SignInProbe />} />
      <Route element={<PrivateRoute />}>
        <Route path="/account" element={<h1>내 정보 화면</h1>} />
      </Route>
    </Routes>,
    { route: '/account', ...options },
  )

it('로그인 확인 중에는 로딩 표시만 보여준다', () => {
  renderAt({ user: null, authLoading: true })
  expect(screen.getByRole('status', { name: '로딩 중' })).toBeInTheDocument()
  expect(screen.queryByRole('heading')).not.toBeInTheDocument()
})

it('로그아웃 상태면 원래 주소를 기억한 채 /signin으로 보낸다', () => {
  renderAt({ user: null })
  expect(screen.getByRole('heading', { name: '로그인 화면 (from: /account)' })).toBeInTheDocument()
})

it('로그인 상태면 요청한 페이지를 보여준다', () => {
  renderAt({ user: mockFirebaseUser() })
  expect(screen.getByRole('heading', { name: '내 정보 화면' })).toBeInTheDocument()
})
