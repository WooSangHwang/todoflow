import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { AccountPage } from '@/pages/AccountPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { mockFirebaseUser, renderWithProviders } from '@/test/helpers'

it('내 정보: 이름·이메일·로그인 방식을 보여준다', () => {
  renderWithProviders(<AccountPage />, {
    user: mockFirebaseUser({
      displayName: '홍길동',
      email: 'hong@example.com',
      providerData: [{ providerId: 'password' }, { providerId: 'google.com' }] as never,
    }),
  })
  expect(screen.getByRole('heading', { name: '내 정보' })).toBeInTheDocument()
  expect(screen.getByText('홍길동')).toBeInTheDocument()
  expect(screen.getByText('hong@example.com')).toBeInTheDocument()
  expect(screen.getByText('이메일/비밀번호, Google')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '← 할 일 목록' })).toHaveAttribute('href', '/app')
})

it('404: 홈으로 가는 링크를 준다', () => {
  renderWithProviders(<NotFoundPage />)
  expect(screen.getByText('페이지를 찾을 수 없습니다.')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: '홈으로' })).toHaveAttribute('href', '/')
})

it('렌더링 오류가 나면 빈 화면 대신 안내와 새로고침 버튼을 보여준다', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  const Broken = () => {
    throw new Error('boom')
  }
  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  )
  expect(screen.getByRole('heading', { name: '문제가 발생했습니다' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: '새로고침' })).toBeInTheDocument()
})
