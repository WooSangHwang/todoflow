import { act, fireEvent, renderHook, screen } from '@testing-library/react'
import { FirebaseError } from 'firebase/app'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ToastProvider'
import { UNDO_DELETE_MS, useUndoableDelete } from '@/hooks/useUndoableDelete'
import { deleteTodo } from '@/lib/todoService'
import type { Todo } from '@/types/todo'

vi.mock('@/lib/todoService')

const todo = (id: string, title = id) => ({ id, title }) as Todo

const setup = () => renderHook(() => useUndoableDelete('u1'), { wrapper: ToastProvider })

// 모킹 초기화는 beforeEach에서 한다. afterEach는 setup.ts의 cleanup(언마운트)보다 먼저 실행되므로,
// 거기서 초기화하면 언마운트 시 '남은 삭제 즉시 실행'이 빈 모킹을 호출한다.
beforeEach(() => {
  vi.useFakeTimers()
  vi.mocked(deleteTodo).mockReset().mockResolvedValue()
})
afterEach(() => {
  vi.useRealTimers()
})

it('삭제하면 3초 동안 숨기기만 하고, 3초 뒤 실제로 삭제한다', () => {
  const { result } = setup()
  act(() => result.current.scheduleDelete(todo('a', '장보기')))

  expect(result.current.pendingIds.has('a')).toBe(true)
  expect(screen.getByText("'장보기' 삭제됨")).toBeInTheDocument()
  expect(deleteTodo).not.toHaveBeenCalled()

  act(() => vi.advanceTimersByTime(UNDO_DELETE_MS))
  expect(deleteTodo).toHaveBeenCalledWith('u1', 'a')
  expect(result.current.pendingIds.has('a')).toBe(false)
})

it('실행취소 버튼을 누르면 삭제하지 않는다', () => {
  const { result } = setup()
  act(() => result.current.scheduleDelete(todo('a')))
  fireEvent.click(screen.getByRole('button', { name: /^실행취소/ }))
  // 취소 알림은 2초 뒤 사라지므로 시간을 보내기 전에 확인한다.
  expect(screen.getByText('삭제를 취소했습니다.')).toBeInTheDocument()
  expect(result.current.pendingIds.size).toBe(0)

  act(() => vi.advanceTimersByTime(UNDO_DELETE_MS))
  expect(deleteTodo).not.toHaveBeenCalled()
})

it('Ctrl+Z는 가장 최근 삭제부터 되돌린다', () => {
  const { result } = setup()
  act(() => {
    result.current.scheduleDelete(todo('a'))
    result.current.scheduleDelete(todo('b'))
  })
  fireEvent.keyDown(window, { key: 'z', ctrlKey: true })

  expect([...result.current.pendingIds]).toEqual(['a'])
})

it('입력칸 안의 Ctrl+Z는 가로채지 않는다', () => {
  const { result } = setup()
  const input = document.body.appendChild(document.createElement('input'))
  act(() => result.current.scheduleDelete(todo('a')))
  fireEvent.keyDown(input, { key: 'z', ctrlKey: true })

  expect(result.current.pendingIds.has('a')).toBe(true)
  input.remove()
})

it('페이지를 떠나면 유예 중인 삭제를 즉시 실행한다', () => {
  const { result, unmount } = setup()
  act(() => result.current.scheduleDelete(todo('a')))
  unmount()
  expect(deleteTodo).toHaveBeenCalledWith('u1', 'a')
})

it('삭제에 실패하면 오류 알림을 보여준다', async () => {
  vi.mocked(deleteTodo).mockRejectedValue(new FirebaseError('permission-denied', 'raw'))
  const { result } = setup()
  act(() => result.current.scheduleDelete(todo('a')))
  await act(() => vi.advanceTimersByTimeAsync(UNDO_DELETE_MS))

  expect(screen.getByText('권한이 없거나 입력값이 올바르지 않습니다.')).toBeInTheDocument()
})
