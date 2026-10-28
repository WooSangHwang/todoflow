import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TodoEditor } from '@/components/TodoEditor'
import type { Todo } from '@/types/todo'

const todo: Todo = {
  id: 't1',
  title: '보고서',
  description: '초안',
  completed: false,
  priority: 'low',
  dueDate: new Date(2030, 0, 15),
  tags: ['업무'],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const setup = (props: Partial<Parameters<typeof TodoEditor>[0]> = {}) => {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(<TodoEditor onSave={onSave} onClose={onClose} {...props} />)
  return { onSave, onClose, dialog: screen.getByRole('dialog') }
}

describe('새 할 일', () => {
  it('입력값을 정리해 저장하고 닫는다', async () => {
    const { onSave, onClose, dialog } = setup({ initialTitle: '운동' })
    expect(within(dialog).getByLabelText('제목')).toHaveValue('운동')

    await userEvent.click(within(dialog).getByText('높음'))
    await userEvent.type(within(dialog).getByLabelText('마감일'), '2030-03-05')
    await userEvent.type(within(dialog).getByLabelText('태그'), '건강, #건강, 아침')
    await userEvent.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(onSave).toHaveBeenCalledWith({
      title: '운동',
      description: '',
      priority: 'high',
      dueDate: new Date(2030, 2, 5),
      tags: ['건강', '아침'],
    })
    expect(onClose).toHaveBeenCalled()
  })

  it('제목이 비면 오류를 보여주고 저장하지 않는다', async () => {
    const { onSave, dialog } = setup()
    await userEvent.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(within(dialog).getByText('제목을 입력해 주세요.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('제목')).toHaveAttribute('aria-invalid', 'true')
    expect(onSave).not.toHaveBeenCalled()
  })

  it('태그가 10개를 넘으면 저장하지 않는다', async () => {
    const { onSave, dialog } = setup({ initialTitle: '태그 많음' })
    await userEvent.type(
      within(dialog).getByLabelText('태그'),
      Array.from({ length: 11 }, (_, i) => `t${i}`).join(','),
    )
    await userEvent.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(within(dialog).getByText('태그는 최대 10개까지 입력할 수 있습니다.')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })
})

it('수정 모드는 기존 값을 채워서 연다', () => {
  const { dialog } = setup({ todo })
  expect(within(dialog).getByRole('heading', { name: '할 일 수정' })).toBeInTheDocument()
  expect(within(dialog).getByLabelText('제목')).toHaveValue('보고서')
  expect(within(dialog).getByLabelText('설명')).toHaveValue('초안')
  expect(within(dialog).getByLabelText('마감일')).toHaveValue('2030-01-15')
  expect(within(dialog).getByLabelText('태그')).toHaveValue('업무')
  expect(within(dialog).getByRole('radio', { name: '낮음' })).toBeChecked()
})

it('취소 버튼은 저장 없이 닫는다', async () => {
  const { onSave, onClose, dialog } = setup({ todo })
  await userEvent.click(within(dialog).getByRole('button', { name: '취소' }))
  expect(onClose).toHaveBeenCalled()
  expect(onSave).not.toHaveBeenCalled()
})
