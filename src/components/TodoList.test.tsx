import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { TodoList } from '@/components/TodoList'
import type { Todo } from '@/types/todo'

const yesterday = new Date(Date.now() - 86_400_000)
const make = (overrides: Partial<Todo>): Todo => ({
  id: overrides.title ?? 'id',
  title: '할 일',
  description: '',
  completed: false,
  priority: 'medium',
  dueDate: null,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

const handlers = () => ({ onToggle: vi.fn(), onEdit: vi.fn(), onDelete: vi.fn() })

it('로딩 중에는 스켈레톤을 aria-busy로 표시한다', () => {
  render(<TodoList todos={[]} loading {...handlers()} />)
  expect(screen.getByRole('list', { name: '할 일 불러오는 중' })).toHaveAttribute(
    'aria-busy',
    'true',
  )
})

it('빈 목록과 필터 결과 없음을 구분해 안내한다', async () => {
  const onResetFilters = vi.fn()
  const { rerender } = render(<TodoList todos={[]} loading={false} {...handlers()} />)
  expect(screen.getByText('할 일이 없습니다')).toBeInTheDocument()

  rerender(<TodoList todos={[]} loading={false} onResetFilters={onResetFilters} {...handlers()} />)
  expect(screen.getByText('조건에 맞는 할 일이 없습니다')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: '필터 초기화' }))
  expect(onResetFilters).toHaveBeenCalled()
})

it('항목의 상태를 글자로도 알리고, 버튼이 해당 할 일을 넘긴다', async () => {
  const h = handlers()
  const overdue = make({ title: '세금', priority: 'high', dueDate: yesterday, tags: ['돈'] })
  const done = make({ title: '끝난 일', completed: true, dueDate: yesterday })
  render(<TodoList todos={[overdue, done]} loading={false} {...h} />)

  const [first, second] = screen.getAllByRole('listitem')
  expect(within(first).getByText('우선순위 높음')).toBeInTheDocument()
  expect(within(first).getByText('기한 초과 · 어제')).toBeInTheDocument()
  expect(within(first).getByText('#돈')).toBeInTheDocument()
  // 완료한 할 일은 기한이 지나도 경고하지 않는다.
  expect(within(second).getByText('마감 어제')).toBeInTheDocument()
  expect(within(second).getByRole('checkbox')).toBeChecked()

  await userEvent.click(within(first).getByRole('checkbox', { name: "'세금' 완료" }))
  await userEvent.click(within(first).getByRole('button', { name: "'세금' 수정" }))
  await userEvent.click(within(first).getByRole('button', { name: "'세금' 삭제" }))
  expect(h.onToggle).toHaveBeenCalledWith(overdue)
  expect(h.onEdit).toHaveBeenCalledWith(overdue)
  expect(h.onDelete).toHaveBeenCalledWith(overdue)
})
