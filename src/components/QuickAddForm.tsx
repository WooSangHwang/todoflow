import { useRef, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { fieldBaseClass } from '@/lib/formStyles'
import { TODO_LIMITS } from '@/lib/todoConverter'

type QuickAddFormProps = {
  onAdd: (title: string) => void
  // 입력 중인 제목을 넘겨 상세 편집기(TodoEditor)를 연다.
  onOpenDetails: (title: string) => void
}

export const QuickAddForm = ({ onAdd, onOpenDetails }: QuickAddFormProps) => {
  const [title, setTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      inputRef.current?.focus()
      return
    }
    onAdd(title)
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <label htmlFor="quick-add" className="sr-only">
        {t('quickAdd.label')}
      </label>
      <input
        id="quick-add"
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={TODO_LIMITS.titleMaxLength}
        placeholder={t('quickAdd.placeholder')}
        className={`${fieldBaseClass()} w-full px-3 py-2.5`}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 rounded-lg bg-indigo-700 px-5 py-2.5 font-medium whitespace-nowrap text-white hover:bg-indigo-800 sm:flex-none"
        >
          {t('quickAdd.add')}
        </button>
        <button
          type="button"
          onClick={() => {
            onOpenDetails(title)
            setTitle('')
          }}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium whitespace-nowrap text-slate-700 hover:bg-slate-50 sm:flex-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {t('quickAdd.details')}
        </button>
      </div>
    </form>
  )
}
