import { render, screen, waitFor, type RenderOptions } from '@testing-library/react'
import type { User } from 'firebase/auth'
import type { ReactElement } from 'react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router'
import { expect } from 'vitest'
import { ToastProvider } from '@/components/ToastProvider'
import { AuthContext, type AuthState } from '@/lib/authContext'
import { i18n } from '@/lib/i18n'

// 컴포넌트가 쓰는 User 필드만 채운 가짜 Firebase 사용자
export const mockFirebaseUser = (overrides: Partial<User> = {}) =>
  ({
    uid: 'test-uid',
    email: 'tester@example.com',
    displayName: null,
    providerData: [{ providerId: 'password' }],
    ...overrides,
  }) as User

type ProvidersOptions = RenderOptions & {
  // MemoryRouter의 시작 주소. location.state가 필요하면 객체로 넘긴다.
  route?: NonNullable<MemoryRouterProps['initialEntries']>[number]
  // null이면 로그아웃 상태
  user?: User | null
  authLoading?: boolean
}

// 실제 앱과 같은 Provider(Auth, Toast, Router)로 감싸 렌더한다. 인증 상태는 Firebase 없이 직접 주입한다.
export const renderWithProviders = (
  ui: ReactElement,
  {
    route = '/',
    user = mockFirebaseUser(),
    authLoading = false,
    ...options
  }: ProvidersOptions = {},
) => {
  const auth: AuthState = { user, loading: authLoading }
  return render(
    <AuthContext value={auth}>
      <ToastProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </ToastProvider>
    </AuthContext>,
    options,
  )
}

// 할 일 목록 스켈레톤(aria-busy)이 사라질 때까지 기다린다.
export const waitForLoadingToFinish = () =>
  waitFor(() => expect(screen.queryByLabelText(i18n.t('list.loading'))).not.toBeInTheDocument(), {
    timeout: 10_000,
  })
