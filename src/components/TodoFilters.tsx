import type { ParseKeys } from 'i18next'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { fieldBaseClass } from '@/lib/formStyles'
import { PRIORITIES, priorityMeta } from '@/lib/priority'
import type {
  DueFilter,
  SortDirection,
  SortField,
  StatusFilter,
  TodoFilters as Filters,
} from '@/lib/todoFilters'
import type { TodoPriority } from '@/types/todo'

const statusOptions: { value: StatusFilter; label: ParseKeys }[] = [
  { value: 'all', label: 'filters.statusAll' },
  { value: 'active', label: 'filters.statusActive' },
  { value: 'completed', label: 'filters.statusCompleted' },
]

const dueOptions: { value: DueFilter; label: ParseKeys }[] = [
  { value: 'all', label: 'filters.dueAll' },
  { value: 'overdue', label: 'filters.dueOverdue' },
  { value: 'today', label: 'filters.dueToday' },
  { value: 'week', label: 'filters.dueWeek' },
  { value: 'none', label: 'filters.dueNone' },
]

// 정렬 기준·방향을 하나의 선택지로 합친다. 값 형식: "field:direction"
const sortOptions: { value: `${SortField}:${SortDirection}`; label: ParseKeys }[] = [
  { value: 'createdAt:desc', label: 'filters.sortNewest' },
  { value: 'createdAt:asc', label: 'filters.sortOldest' },
  { value: 'updatedAt:desc', label: 'filters.sortUpdated' },
  { value: 'dueDate:asc', label: 'filters.sortDueSoon' },
  { value: 'dueDate:desc', label: 'filters.sortDueLate' },
  { value: 'priority:desc', label: 'filters.sortPriorityHigh' },
  { value: 'priority:asc', label: 'filters.sortPriorityLow' },
]

type TodoFiltersProps = {
  filters: Filters
  search: string
  availableTags: string[]
  filtering: boolean
  onSearchChange: (search: string) => void
  onChange: (patch: Partial<Filters>) => void
  onToggleTag: (tag: string) => void
  onReset: () => void
}

const selectClass = `${fieldBaseClass()} w-full px-3 py-1.5 text-sm sm:w-auto`

export const TodoFilters = ({
  filters,
  search,
  availableTags,
  filtering,
  onSearchChange,
  onChange,
  onToggleTag,
  onReset,
}: TodoFiltersProps) => {
  const id = useId()
  const { t } = useTranslation()

  return (
    <section aria-label={t('filters.region')} className="space-y-3">
      <div className="relative">
        <label htmlFor={`${id}-search`} className="sr-only">
          {t('filters.search')}
        </label>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-600"
        >
          🔍
        </span>
        <input
          id={`${id}-search`}
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filters.searchPlaceholder')}
          className={`${fieldBaseClass()} w-full py-2 pr-3 pl-10`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          role="group"
          aria-label={t('filters.status')}
          className="inline-flex rounded-lg bg-slate-200/70 p-1 text-sm dark:bg-slate-800"
        >
          {statusOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filters.status === option.value}
              onClick={() => onChange({ status: option.value })}
              className={`rounded-md px-3 py-1 font-medium ${
                filters.status === option.value
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white'
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {t(option.label)}
            </button>
          ))}
        </div>

        <label htmlFor={`${id}-priority`} className="sr-only">
          {t('filters.priority')}
        </label>
        <select
          id={`${id}-priority`}
          value={filters.priority}
          onChange={(e) => onChange({ priority: e.target.value as TodoPriority | 'all' })}
          className={selectClass}
        >
          <option value="all">{t('filters.priorityAll')}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {t('filters.priorityOption', { label: t(priorityMeta[p].labelKey) })}
            </option>
          ))}
        </select>

        <label htmlFor={`${id}-due`} className="sr-only">
          {t('filters.due')}
        </label>
        <select
          id={`${id}-due`}
          value={filters.due}
          onChange={(e) => onChange({ due: e.target.value as DueFilter })}
          className={selectClass}
        >
          {dueOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>

        <label htmlFor={`${id}-sort`} className="sr-only">
          {t('filters.sort')}
        </label>
        <select
          id={`${id}-sort`}
          value={`${filters.sortField}:${filters.sortDirection}`}
          onChange={(e) => {
            const [sortField, sortDirection] = e.target.value.split(':') as [
              SortField,
              SortDirection,
            ]
            onChange({ sortField, sortDirection })
          }}
          className={`${selectClass} sm:ml-auto`}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </select>
      </div>

      {availableTags.length > 0 && (
        <div role="group" aria-label={t('filters.tags')} className="flex flex-wrap gap-1.5">
          {availableTags.map((tag) => {
            const selected = filters.tags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={selected}
                onClick={() => onToggleTag(tag)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  selected
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900'
                }`}
              >
                #{tag}
              </button>
            )
          })}
        </div>
      )}

      {filtering && (
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-indigo-700 hover:underline dark:text-indigo-300"
        >
          {t('filters.reset')}
        </button>
      )}
    </section>
  )
}
