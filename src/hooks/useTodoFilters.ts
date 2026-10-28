import { useEffect, useState } from 'react'
import { DEFAULT_FILTERS, parseStoredFilters, type TodoFilters } from '@/lib/todoFilters'

const storageKey = (uid: string) => `todoFilters:${uid}`

const load = (uid: string) => {
  try {
    return parseStoredFilters(localStorage.getItem(storageKey(uid)))
  } catch {
    return DEFAULT_FILTERS
  }
}

// 필터/정렬은 사용자별로 localStorage에 저장한다. 검색어는 다음 방문 시 혼란을 줄 수 있어 저장하지 않는다.
export const useTodoFilters = (uid: string) => {
  // 첫 렌더부터 저장값을 사용해 기본 필터로 잠깐 보였다 바뀌는 깜빡임을 막는다.
  const [filters, setFilters] = useState(() => load(uid))
  const [search, setSearch] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(uid), JSON.stringify(filters))
    } catch {
      // 저장소를 쓸 수 없어도 현재 세션에서는 동작한다.
    }
  }, [uid, filters])

  const updateFilters = (patch: Partial<TodoFilters>) =>
    setFilters((prev) => ({ ...prev, ...patch }))

  const toggleTag = (tag: string) =>
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))

  // 정렬은 유지하고 필터와 검색어만 초기화
  const resetFilters = () => {
    setFilters((prev) => ({
      ...DEFAULT_FILTERS,
      sortField: prev.sortField,
      sortDirection: prev.sortDirection,
    }))
    setSearch('')
  }

  return { filters, search, setSearch, updateFilters, toggleTag, resetFilters }
}
