import { act, renderHook } from '@testing-library/react'
import { expect, it } from 'vitest'
import { useTodoFilters } from '@/hooks/useTodoFilters'
import { DEFAULT_FILTERS } from '@/lib/todoFilters'

it('필터는 사용자별로 저장되고 검색어는 저장되지 않는다', () => {
  const first = renderHook(() => useTodoFilters('alice'))
  act(() => {
    first.result.current.updateFilters({ status: 'completed', sortField: 'priority' })
    first.result.current.toggleTag('업무')
    first.result.current.setSearch('보고서')
  })
  first.unmount()

  const again = renderHook(() => useTodoFilters('alice')).result.current
  expect(again.filters).toMatchObject({
    status: 'completed',
    sortField: 'priority',
    tags: ['업무'],
  })
  expect(again.search).toBe('')

  expect(renderHook(() => useTodoFilters('bob')).result.current.filters).toEqual(DEFAULT_FILTERS)
})

it('태그는 다시 누르면 해제되고, 초기화는 정렬을 유지한다', () => {
  const { result } = renderHook(() => useTodoFilters('alice'))
  act(() => {
    result.current.toggleTag('a')
    result.current.toggleTag('b')
    result.current.toggleTag('a')
  })
  expect(result.current.filters.tags).toEqual(['b'])

  act(() => result.current.updateFilters({ sortField: 'dueDate', sortDirection: 'asc' }))
  act(() => result.current.resetFilters())
  expect(result.current.filters).toEqual({
    ...DEFAULT_FILTERS,
    sortField: 'dueDate',
    sortDirection: 'asc',
  })
})

it('저장값이 깨져 있으면 기본값을 쓴다', () => {
  localStorage.setItem('todoFilters:alice', '{not json')
  expect(renderHook(() => useTodoFilters('alice')).result.current.filters).toEqual(DEFAULT_FILTERS)
})
