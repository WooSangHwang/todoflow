import { Spinner } from '@/components/Spinner'

// 인증 확인·페이지 코드 로딩 중 화면 가운데에 표시
export const PageSpinner = () => (
  <div className="flex flex-1 items-center justify-center text-slate-600 dark:text-slate-300">
    <Spinner className="size-6" />
  </div>
)
