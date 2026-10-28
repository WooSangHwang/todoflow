import { Navigate, Outlet, useLocation } from 'react-router'
import { PageSpinner } from '@/components/PageSpinner'
import { useAuth } from '@/hooks/useAuth'

// 하위 라우트를 감싸는 레이아웃 라우트. 미인증 시 원래 가려던 경로를 state.from에 담아 /signin으로 보낸다.
export const PrivateRoute = () => {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />

  return user ? <Outlet /> : <Navigate to="/signin" replace state={{ from: location }} />
}
