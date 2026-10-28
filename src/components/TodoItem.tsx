import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatDueDate, isOverdue } from '@/lib/dates'
import { priorityMeta } from '@/lib/priority'
import type { Todo } from '@/types/todo'

type TodoItemProps = {
  todo: Todo
  onToggle: (todo: Todo) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}

// 할 일 하나가 바뀌어도 나머지 항목은 다시 그리지 않는다.
// useTodos가 바뀌지 않은 할 일 객체를 재사용하고, 핸들러는 useCallback으로 고정되어 있어야 효과가 있다.
export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const { t } = useTranslation()
  const priority = priorityMeta[todo.priority]
  // 완료한 항목은 마감일이 지나도 경고하지 않는다.
  const overdue = !todo.completed && isOverdue(todo.dueDate)

  return (
    <li data-todo-id={todo.id} className="flex items-start gap-3 p-4 sm:px-5">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo)}
        aria-label={t('item.toggle', { title: todo.title })}
        className="mt-1 size-5 shrink-0 cursor-pointer accent-indigo-600"
      />
      <div className="min-w-0 flex-1">
        <p
          className={`font-medium break-words ${
            todo.completed
              ? 'text-slate-600 line-through dark:text-slate-300'
              : 'text-slate-900 dark:text-white'
          }`}
        >
          {todo.title}
        </p>
        {todo.description && (
          <p className="mt-0.5 text-sm break-words whitespace-pre-line text-slate-600 dark:text-slate-300">
            {todo.description}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className={`rounded-full px-2 py-0.5 font-medium ${priority.badgeClass}`}>
            {t('item.priority', { label: t(priority.labelKey) })}
          </span>
          {todo.dueDate && (
            <span
              className={`rounded-full px-2 py-0.5 ${
                overdue
                  ? 'bg-red-800 font-medium text-white'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {t(overdue ? 'item.overdue' : 'item.due', { date: formatDueDate(todo.dueDate) })}
            </span>
          )}
          {todo.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1 text-sm sm:flex-row">
        <button
          type="button"
          onClick={() => onEdit(todo)}
          aria-label={t('item.editLabel', { title: todo.title })}
          className="rounded-lg px-2.5 py-1 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          {t('item.edit')}
        </button>
        <button
          type="button"
          onClick={() => onDelete(todo)}
          aria-label={t('item.deleteLabel', { title: todo.title })}
          className="rounded-lg px-2.5 py-1 text-red-800 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
        >
          {t('item.delete')}
        </button>
      </div>
    </li>
  )
})
