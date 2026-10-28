import { act, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/ToastProvider'
import { useToast } from '@/hooks/useToast'
import type { ToastOptions } from '@/lib/toastContext'

const setup = () => {
  const { result } = renderHook(() => useToast(), { wrapper: ToastProvider })
  return (options: ToastOptions) => act(() => void result.current.showToast(options))
}

afterEach(() => vi.useRealTimers())

it('일반 알림은 status, 오류는 alert 영역에 표시한다', () => {
  const show = setup()
  show({ message: '저장됨' })
  show({ message: '실패함', variant: 'error' })

  expect(screen.getByRole('status')).toHaveTextContent('저장됨')
  expect(screen.getByRole('alert')).toHaveTextContent('실패함')
})

it('지정한 시간이 지나면 사라진다', () => {
  vi.useFakeTimers()
  const show = setup()
  show({ message: '잠깐', duration: 1000 })
  act(() => vi.advanceTimersByTime(999))
  expect(screen.getByText('잠깐')).toBeInTheDocument()
  act(() => vi.advanceTimersByTime(1))
  expect(screen.queryByText('잠깐')).not.toBeInTheDocument()
})

it('액션 버튼은 콜백을 부르고 알림을 닫는다. 닫기 버튼도 동작한다', async () => {
  const onClick = vi.fn()
  const show = setup()
  show({ message: 'A', action: { label: '되돌리기', onClick } })
  show({ message: 'B' })

  await userEvent.click(screen.getByRole('button', { name: '되돌리기' }))
  expect(onClick).toHaveBeenCalledOnce()
  expect(screen.queryByText('A')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: '알림 닫기' }))
  expect(screen.queryByText('B')).not.toBeInTheDocument()
})

it('Provider 밖에서 쓰면 바로 알 수 있는 오류를 던진다', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  expect(() => renderHook(() => useToast())).toThrow('ToastProvider')
})
