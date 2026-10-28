import { isOverdue } from '@/lib/dates'
import { PRIORITIES } from '@/lib/priority'
import type { Todo, TodoPriority } from '@/types/todo'

export type StatusFilter = 'all' | 'active' | 'completed'
export type DueFilter = 'all' | 'overdue' | 'today' | 'week' | 'none'
export type SortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority'
export type SortDirection = 'asc' | 'desc'

export type TodoFilters = {
  status: StatusFilter
  priority: TodoPriority | 'all'
  tags: string[]
  due: DueFilter
  sortField: SortField
  sortDirection: SortDirection
}

export const DEFAULT_FILTERS: TodoFilters = {
  status: 'all',
  priority: 'all',
  tags: [],
  due: 'all',
  sortField: 'createdAt',
  sortDirection: 'desc',
}

export const isFiltering = (filters: TodoFilters, search: string) =>
  filters.status !== 'all' ||
  filters.priority !== 'all' ||
  filters.tags.length > 0 ||
  filters.due !== 'all' ||
  search.trim() !== ''

const DAY_MS = 86_400_000

const startOfToday = (now: Date) => new Date(now.getFullYear(), now.getMonth(), now.getDate())

const matchesDue = (dueDate: Date | null, due: DueFilter, now: Date) => {
  if (due === 'all') return true
  if (due === 'none') return dueDate === null
  if (dueDate === null) return false
  const today = startOfToday(now).getTime()
  const day = startOfToday(dueDate).getTime()
  if (due === 'overdue') return isOverdue(dueDate, now)
  if (due === 'today') return day === today
  // 'week': 오늘부터 7일 이내 (오늘 포함, 기한 초과 제외)
  return day >= today && day < today + 7 * DAY_MS
}

const matchesSearch = (todo: Todo, search: string) => {
  const query = search.trim().toLowerCase()
  if (!query) return true
  return [todo.title, todo.description, ...todo.tags].some((text) =>
    text.toLowerCase().includes(query),
  )
}

export const filterTodos = (todos: Todo[], filters: TodoFilters, search = '', now = new Date()) =>
  todos.filter(
    (todo) =>
      (filters.status === 'all' || todo.completed === (filters.status === 'completed')) &&
      (filters.priority === 'all' || todo.priority === filters.priority) &&
      // 선택한 태그 중 하나라도 있으면 표시 (OR)
      (filters.tags.length === 0 || filters.tags.some((tag) => todo.tags.includes(tag))) &&
      matchesDue(todo.dueDate, filters.due, now) &&
      matchesSearch(todo, search),
  )

// 높음 > 보통 > 낮음 순서를 숫자로 (내림차순 정렬 시 높음이 먼저)
const priorityRank = (priority: TodoPriority) => PRIORITIES.length - PRIORITIES.indexOf(priority)

export const sortTodos = (todos: Todo[], field: SortField, direction: SortDirection) => {
  const sign = direction === 'asc' ? 1 : -1
  return [...todos].sort((a, b) => {
    if (field === 'dueDate') {
      // 마감일 없는 항목은 정렬 방향과 무관하게 항상 마지막
      if (!a.dueDate || !b.dueDate) {
        if (a.dueDate !== b.dueDate) return a.dueDate ? -1 : 1
      } else if (a.dueDate.getTime() !== b.dueDate.getTime()) {
        return sign * (a.dueDate.getTime() - b.dueDate.getTime())
      }
    } else {
      const diff =
        field === 'priority'
          ? priorityRank(a.priority) - priorityRank(b.priority)
          : a[field].getTime() - b[field].getTime()
      if (diff !== 0) return sign * diff
    }
    // 같으면 최신순
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

// localStorage 값은 손상되었거나 이전 버전 형식일 수 있으므로 필드별로 검증하고, 잘못된 필드만 기본값으로 둔다.
export const parseStoredFilters = (raw: string | null): TodoFilters => {
  if (!raw) return DEFAULT_FILTERS
  let value: Record<string, unknown>
  try {
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_FILTERS
    value = parsed as Record<string, unknown>
  } catch {
    return DEFAULT_FILTERS
  }

  const pick = <T>(key: keyof TodoFilters, allowed: readonly T[]) =>
    allowed.includes(value[key] as T) ? (value[key] as T) : (DEFAULT_FILTERS[key] as T)

  return {
    status: pick<StatusFilter>('status', ['all', 'active', 'completed']),
    priority: pick<TodoPriority | 'all'>('priority', ['all', ...PRIORITIES]),
    tags: Array.isArray(value.tags)
      ? value.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    due: pick<DueFilter>('due', ['all', 'overdue', 'today', 'week', 'none']),
    sortField: pick<SortField>('sortField', ['createdAt', 'updatedAt', 'dueDate', 'priority']),
    sortDirection: pick<SortDirection>('sortDirection', ['asc', 'desc']),
  }
}
