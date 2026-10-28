import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { TextField } from '@/components/TextField'
import { fromDateInputValue, toDateInputValue } from '@/lib/dates'
import { showErrorsAndFocusFirst } from '@/lib/focus'
import { fieldClass, labelClass } from '@/lib/formStyles'
import { PRIORITIES, priorityMeta } from '@/lib/priority'
import { parseTags, TAG_MAX_LENGTH, validateTags } from '@/lib/tags'
import { TODO_LIMITS } from '@/lib/todoConverter'
import type { Todo, TodoInput, TodoPriority } from '@/types/todo'

type TodoEditorProps = {
  // 있으면 수정 모드, 없으면 생성 모드
  todo?: Todo
  initialTitle?: string
  onSave: (input: Required<TodoInput>) => void
  onClose: () => void
}

const FOCUSABLE = 'button, input, textarea, select, [href], [tabindex]:not([tabindex="-1"])'

// 생성/수정 공용 모달. 네이티브 <dialog>.showModal()로 배경 비활성화·Esc 닫기를 브라우저에 맡긴다.
// 두 가지는 직접 처리한다:
// - 포커스 순환: 네이티브 dialog는 마지막 요소에서 Tab 시 브라우저 주소창으로 빠져나간다.
// - 포커스 복원: 저장 시 React가 dialog를 DOM에서 제거하므로 브라우저 복원이 동작하지 않는다.
export const TodoEditor = ({ todo, initialTitle = '', onSave, onClose }: TodoEditorProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  const headingId = useId()
  const descriptionId = useId()

  const [title, setTitle] = useState(todo?.title ?? initialTitle)
  const [description, setDescription] = useState(todo?.description ?? '')
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(toDateInputValue(todo?.dueDate ?? null))
  const [tagsText, setTagsText] = useState(todo?.tags.join(', ') ?? '')
  const [submitted, setSubmitted] = useState(false)
  // autoFocus가 포커스를 옮기기 전(첫 렌더 시점)에 모달을 연 요소를 기억한다.
  const [opener] = useState(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement : null,
  )

  useEffect(() => {
    dialogRef.current?.showModal()
    return () => opener?.focus()
  }, [opener])

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return
    const items = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      (el) => !el.matches(':disabled') && el.getClientRects().length > 0,
    )
    const [first, last] = [items[0], items.at(-1)]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }

  const tags = parseTags(tagsText)
  const errors = {
    title: title.trim() ? undefined : t('editor.titleRequired'),
    tags: validateTags(tags),
  }
  const visibleErrors: Partial<typeof errors> = submitted ? errors : {}

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (Object.values(errors).some(Boolean)) {
      showErrorsAndFocusFirst(event.currentTarget, () => setSubmitted(true))
      return
    }
    onSave({ title, description, priority, dueDate: fromDateInputValue(dueDate), tags })
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={headingId}
      onClose={onClose}
      // 배경(::backdrop) 클릭 시 닫기: 클릭 대상이 dialog 자신이면 바깥 영역이다.
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={trapFocus}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/50 dark:bg-slate-800 dark:text-white"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4 p-6">
        <h2 id={headingId} className="text-lg font-bold">
          {todo ? t('editor.editTitle') : t('editor.createTitle')}
        </h2>

        <TextField
          label={t('editor.title')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TODO_LIMITS.titleMaxLength}
          error={visibleErrors.title}
          autoFocus
        />

        <div>
          <label htmlFor={descriptionId} className={labelClass}>
            {t('editor.description')}
          </label>
          <textarea
            id={descriptionId}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={TODO_LIMITS.descriptionMaxLength}
            rows={3}
            className={fieldClass()}
          />
        </div>

        <fieldset>
          <legend className={labelClass}>{t('editor.priority')}</legend>
          <div className="grid grid-cols-3 gap-2">
            {PRIORITIES.map((value) => (
              <label
                key={value}
                className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-medium has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-indigo-700 dark:has-[:focus-visible]:outline-indigo-300 ${
                  priority === value
                    ? `border-transparent ${priorityMeta[value].badgeClass}`
                    : 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={value}
                  checked={priority === value}
                  onChange={() => setPriority(value)}
                  className="sr-only"
                />
                {t(priorityMeta[value].labelKey)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label={t('editor.dueDate')}
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <TextField
            label={t('editor.tags')}
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder={t('editor.tagsPlaceholder')}
            error={visibleErrors.tags}
            hint={t('editor.tagsHint', { max: TODO_LIMITS.maxTags, length: TAG_MAX_LENGTH })}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {t('editor.cancel')}
          </button>
          <button
            type="submit"
            className="rounded-lg bg-indigo-700 px-4 py-2 font-medium text-white hover:bg-indigo-800"
          >
            {t('editor.save')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
