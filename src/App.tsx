import { lazy, Suspense, type ComponentType } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { AppLayout } from '@/components/AppLayout'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSpinner } from '@/components/PageSpinner'
import { PrivateRoute } from '@/components/PrivateRoute'
import { ToastProvider } from '@/components/ToastProvider'

// 페이지는 해당 주소에 처음 들어갈 때 내려받는다. 특히 TodoAppPage는 Firestore SDK를 함께 끌어온다.
const named = <K extends string>(load: () => Promise<Record<K, ComponentType>>, name: K) =>
  lazy(() => load().then((module) => ({ default: module[name] })))
const SignInPage = named(() => import('@/pages/SignInPage'), 'SignInPage')
const TodoAppPage = named(() => import('@/pages/TodoAppPage'), 'TodoAppPage')
const AccountPage = named(() => import('@/pages/AccountPage'), 'AccountPage')
const NotFoundPage = named(() => import('@/pages/NotFoundPage'), 'NotFoundPage')

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<PageSpinner />}>
              <Routes>
                <Route path="/" element={<Navigate to="/app" replace />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route element={<PrivateRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/app" element={<TodoAppPage />} />
                    <Route path="/account" element={<AccountPage />} />
                  </Route>
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
