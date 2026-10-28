import type { ReactNode } from 'react'

type PageShellProps = {
  title: string
  // 제목 오른쪽에 둘 보조 버튼(예: 언어 전환)
  actions?: ReactNode
  children?: ReactNode
}

export const PageShell = ({ title, actions, children }: PageShellProps) => (
  <main
    id="main"
    tabIndex={-1}
    className="flex flex-1 items-center justify-center p-4 focus-visible:outline-none"
  >
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-800">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
        {actions}
      </div>
      <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">{children}</div>
    </div>
  </main>
)
