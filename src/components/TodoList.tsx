import { useTranslation } from 'react-i18next'
import { TodoItem } from '@/components/TodoItem'
import type { Todo } from '@/types/todo'

type TodoListProps = {
  todos: Todo[]
  loading: boolean
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
  // 할 일은 있지만 필터 결과가 비었을 때 초기화 버튼과 함께 다른 안내를 보여준다.
  onResetFilters?: () => void
}

const cardClass =
  'divide-y divide-slate-200 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 dark:divide-slate-700 dark:bg-slate-800 dark:ring-slate-700'

export const TodoList = ({ todos, loading, onResetFilters, ...handlers }: TodoListProps) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <ul aria-label={t('list.loading')} aria-busy="true" className={cardClass}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex animate-pulse items-start gap-3 p-4 sm:px-5">
            <div className="size-5 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (todos.length === 0 && onResetFilters) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
        <p className="text-4xl" aria-hidden="true">
          🔍
        </p>
        <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">{t('list.noMatch')}</p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-3 text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300"
        >
          {t('filters.reset')}
        </button>
      </div>
    )
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
        <p className="text-4xl" aria-hidden="true">
          📝
        </p>
        <p className="mt-3 font-medium text-slate-700 dark:text-slate-200">{t('list.empty')}</p>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t('list.emptyHint')}</p>
      </div>
    )
  }

  return (
    <ul className={cardClass}>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} {...handlers} />
      ))}
    </ul>
  )
}
