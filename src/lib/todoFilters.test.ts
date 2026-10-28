import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FILTERS,
  filterTodos,
  isFiltering,
  parseStoredFilters,
  sortTodos,
  type TodoFilters,
} from '@/lib/todoFilters'
import type { Todo } from '@/types/todo'

// 2026-06-15(월) 정오를 "지금"으로 고정
const NOW = new Date(2026, 5, 15, 12)
const day = (offset: number) => new Date(2026, 5, 15 + offset)

let seq = 0
const todo = (overrides: Partial<Todo>): Todo => {
  seq += 1
  return {
    id: `t${seq}`,
    title: `할 일 ${seq}`,
    description: '',
    completed: false,
    priority: 'medium',
    dueDate: null,
    tags: [],
    createdAt: new Date(2026, 0, seq),
    updatedAt: new Date(2026, 0, seq),
    ...overrides,
  }
}

const ids = (todos: Todo[]) => todos.map((t) => t.id)
const filters = (overrides: Partial<TodoFilters>) => ({ ...DEFAULT_FILTERS, ...overrides })

describe('filterTodos', () => {
  const done = todo({ id: 'done', completed: true, priority: 'high', tags: ['업무'] })
  const overdue = todo({ id: 'overdue', dueDate: day(-1), priority: 'low', tags: ['개인'] })
  const today = todo({ id: 'today', dueDate: day(0), tags: ['업무', '긴급'] })
  const in6 = todo({ id: 'in6', dueDate: day(6), description: '보고서 초안 작성' })
  const in7 = todo({ id: 'in7', dueDate: day(7), title: 'React 공부' })
  const all = [done, overdue, today, in6, in7]

  it('기본 필터는 전부 통과', () => {
    expect(filterTodos(all, DEFAULT_FILTERS, '', NOW)).toHaveLength(5)
  })

  it('완료 상태', () => {
    expect(ids(filterTodos(all, filters({ status: 'completed' }), '', NOW))).toEqual(['done'])
    expect(filterTodos(all, filters({ status: 'active' }), '', NOW)).toHaveLength(4)
  })

  it('우선순위', () => {
    expect(ids(filterTodos(all, filters({ priority: 'low' }), '', NOW))).toEqual(['overdue'])
  })

  it('태그는 선택한 것 중 하나라도 있으면 통과 (OR)', () => {
    expect(ids(filterTodos(all, filters({ tags: ['개인', '긴급'] }), '', NOW))).toEqual([
      'overdue',
      'today',
    ])
  })

  it('마감일: 기한 초과 / 오늘 / 7일 이내 / 없음', () => {
    const by = (due: TodoFilters['due']) => ids(filterTodos(all, filters({ due }), '', NOW))
    expect(by('overdue')).toEqual(['overdue'])
    expect(by('today')).toEqual(['today'])
    expect(by('week')).toEqual(['today', 'in6']) // 7일 후는 제외, 기한 초과도 제외
    expect(by('none')).toEqual(['done'])
  })

  it('검색은 제목·설명·태그에서 대소문자 무시', () => {
    expect(ids(filterTodos(all, DEFAULT_FILTERS, 'react', NOW))).toEqual(['in7'])
    expect(ids(filterTodos(all, DEFAULT_FILTERS, '보고서', NOW))).toEqual(['in6'])
    expect(ids(filterTodos(all, DEFAULT_FILTERS, '긴급', NOW))).toEqual(['today'])
    expect(filterTodos(all, DEFAULT_FILTERS, '   ', NOW)).toHaveLength(5)
  })

  it('여러 필터 조합은 AND', () => {
    const result = filterTodos(all, filters({ status: 'active', tags: ['업무'] }), '', NOW)
    expect(ids(result)).toEqual(['today'])
  })
})

describe('sortTodos', () => {
  const a = todo({ id: 'a', priority: 'low', dueDate: day(3) })
  const b = todo({ id: 'b', priority: 'high', dueDate: null })
  const c = todo({ id: 'c', priority: 'medium', dueDate: day(1) })
  const list = [a, b, c] // createdAt 순서: a < b < c

  it('생성일 내림차순(기본) / 오름차순', () => {
    expect(ids(sortTodos(list, 'createdAt', 'desc'))).toEqual(['c', 'b', 'a'])
    expect(ids(sortTodos(list, 'createdAt', 'asc'))).toEqual(['a', 'b', 'c'])
  })

  it('우선순위 내림차순은 높음 → 낮음', () => {
    expect(ids(sortTodos(list, 'priority', 'desc'))).toEqual(['b', 'c', 'a'])
    expect(ids(sortTodos(list, 'priority', 'asc'))).toEqual(['a', 'c', 'b'])
  })

  it('마감일 없는 항목은 방향과 무관하게 마지막', () => {
    expect(ids(sortTodos(list, 'dueDate', 'asc'))).toEqual(['c', 'a', 'b'])
    expect(ids(sortTodos(list, 'dueDate', 'desc'))).toEqual(['a', 'c', 'b'])
  })

  it('원본 배열을 바꾸지 않음', () => {
    sortTodos(list, 'priority', 'desc')
    expect(ids(list)).toEqual(['a', 'b', 'c'])
  })
})

describe('parseStoredFilters', () => {
  it('없거나 손상된 값은 기본값', () => {
    expect(parseStoredFilters(null)).toEqual(DEFAULT_FILTERS)
    expect(parseStoredFilters('{not json')).toEqual(DEFAULT_FILTERS)
    expect(parseStoredFilters('"string"')).toEqual(DEFAULT_FILTERS)
  })

  it('잘못된 필드만 기본값으로 대체', () => {
    const raw = JSON.stringify({
      status: 'completed',
      priority: 'urgent',
      tags: ['a', 1],
      due: 'x',
    })
    expect(parseStoredFilters(raw)).toEqual({
      ...DEFAULT_FILTERS,
      status: 'completed',
      tags: ['a'],
    })
  })
})

describe('isFiltering', () => {
  it('기본값이면 false, 하나라도 바뀌거나 검색어가 있으면 true', () => {
    expect(isFiltering(DEFAULT_FILTERS, '')).toBe(false)
    expect(isFiltering(filters({ sortField: 'priority' }), '')).toBe(false) // 정렬은 필터 아님
    expect(isFiltering(filters({ due: 'today' }), '')).toBe(true)
    expect(isFiltering(DEFAULT_FILTERS, '검색')).toBe(true)
  })
})
