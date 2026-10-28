import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { expect, it, vi } from 'vitest'
import { Header } from '@/components/Header'
import * as auth from '@/lib/auth'
import { mockFirebaseUser, renderWithProviders } from '@/test/helpers'

vi.mock('@/lib/auth')

it('로그아웃하면 로그인 화면으로 이동한다', async () => {
  vi.mocked(auth.logOut).mockResolvedValue()
  renderWithProviders(
    <Routes>
      <Route path="/app" element={<Header />} />
      <Route path="/signin" element={<h1>로그인 화면</h1>} />
    </Routes>,
    { route: '/app', user: mockFirebaseUser({ email: 'me@example.com' }) },
  )

  expect(screen.getByRole('link', { name: 'me@example.com' })).toHaveAttribute('href', '/account')
  await userEvent.click(screen.getByRole('button', { name: '로그아웃' }))

  expect(auth.logOut).toHaveBeenCalledOnce()
  expect(await screen.findByRole('heading', { name: '로그인 화면' })).toBeInTheDocument()
})
