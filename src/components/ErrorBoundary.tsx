import { Component, type ErrorInfo, type ReactNode } from 'react'
import { i18n } from '@/lib/i18n'

type Props = { children: ReactNode }
type State = { hasError: boolean }

// 렌더링 중 예상치 못한 에러로 화면 전체가 비는 것을 막는다. (에러 경계는 클래스 컴포넌트로만 구현 가능)
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {i18n.t('errorBoundary.title')}
        </h1>
        <p className="text-slate-600 dark:text-slate-300">{i18n.t('errorBoundary.message')}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800"
        >
          {i18n.t('errorBoundary.reload')}
        </button>
      </main>
    )
  }
}
