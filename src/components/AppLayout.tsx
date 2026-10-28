import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet } from 'react-router'
import { Header } from '@/components/Header'
import { PageSpinner } from '@/components/PageSpinner'

// 로그인 후 페이지(/app, /account) 공통 레이아웃
export const AppLayout = () => {
  const { t } = useTranslation()
  return (
    <>
      {/* 키보드 사용자가 헤더를 건너뛰고 바로 본문으로 갈 수 있게 한다. 포커스될 때만 보인다. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-indigo-700 focus:px-4 focus:py-2 focus:font-medium focus:text-white"
      >
        {t('nav.skipToMain')}
      </a>
      <Header />
      {/* 페이지 코드를 받는 동안에도 헤더는 그대로 둔다. */}
      <Suspense fallback={<PageSpinner />}>
        <Outlet />
      </Suspense>
    </>
  )
}
