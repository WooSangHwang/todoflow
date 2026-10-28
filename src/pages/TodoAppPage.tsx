import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QuickAddForm } from '@/components/QuickAddForm'
import { TodoEditor } from '@/components/TodoEditor'
import { TodoFilters } from '@/components/TodoFilters'
import { TodoList } from '@/components/TodoList'
import { useAuth } from '@/hooks/useAuth'
import { useTodoFilters } from '@/hooks/useTodoFilters'
import { useTodos } from '@/hooks/useTodos'
import { useToast } from '@/hooks/useToast'
import { useUndoableDelete } from '@/hooks/useUndoableDelete'
import { getFirestoreErrorMessage } from '@/lib/firestoreErrors'
import { filterTodos, isFiltering, sortTodos } from '@/lib/todoFilters'
import { createTodo, updateTodo } from '@/lib/todoService'
import type { Todo, TodoInput } from '@/types/todo'

type EditorState =
  { mode: 'closed' } | { mode: 'create'; title: string } | { mode: 'edit'; todo: Todo }

export const TodoAppPage = () => {
  // PrivateRoute 하위이므로 user는 항상 존재한다.
  const uid = useAuth().user!.uid
  const { todos, loading, error } = useTodos(uid)
  const { pendingIds, scheduleDelete } = useUndoableDelete(uid)
  const { showToast } = useToast()
  const { t } = useTranslation()
  const [editor, setEditor] = useState<EditorState>({ mode: 'closed' })
  const { filters, search, setSearch, updateFilters, toggleTag, resetFilters } = useTodoFilters(uid)
  // 입력은 즉시 반영하고 목록 필터링은 여유 있을 때 처리한다(디바운스 대신).
  const deferredSearch = useDeferredValue(search)

  // 쓰기 Promise는 await하지 않는다: 화면은 로컬 캐시로 즉시 갱신되고, 실패 시 SDK가 되돌린 뒤 여기서 알린다.
  const report = useCallback(
    (error: unknown) => showToast({ message: getFirestoreErrorMessage(error), variant: 'error' }),
    [showToast],
  )

  // 목록 항목(memo된 TodoItem)에 넘기는 핸들러는 참조가 유지되어야 다른 항목이 다시 그려지지 않는다.
  const handleToggle = useCallback(
    (todo: Todo) => void updateTodo(uid, todo.id, { completed: !todo.completed }).catch(report),
    [uid, report],
  )
  const handleEdit = useCallback((todo: Todo) => setEditor({ mode: 'edit', todo }), [])

  const handleCreate = (input: TodoInput) => void createTodo(uid, input).catch(report)
  const handleSave = (input: Required<TodoInput>) => {
    if (editor.mode === 'edit') void updateTodo(uid, editor.todo.id, input).catch(report)
    else handleCreate(input)
  }

  // 삭제 유예 중인 항목 제외. 아래 useMemo들이 매 렌더 재계산되지 않도록 이것도 메모이즈한다.
  const activeTodos = useMemo(
    () => todos.filter((todo) => !pendingIds.has(todo.id)),
    [todos, pendingIds],
  )
  const remaining = activeTodos.filter((todo) => !todo.completed).length
  const filtering = isFiltering(filters, search)

  const shownTodos = useMemo(
    () =>
      sortTodos(
        filterTodos(activeTodos, filters, deferredSearch),
        filters.sortField,
        filters.sortDirection,
      ),
    [activeTodos, filters, deferredSearch],
  )

  // 삭제한 항목의 버튼이 사라지면 포커스가 페이지 맨 위로 튀므로, 다음(없으면 이전) 할 일의 체크박스로 옮긴다.
  // 목록이 비면 새 할 일 입력칸으로 보낸다. 실제 이동은 목록이 다시 렌더된 뒤 effect에서 한다.
  // 이웃 항목은 화면의 <li> 형제에서 찾는다(목록 배열에 의존하지 않아 핸들러 참조가 유지된다).
  const focusAfterDelete = useRef<string | null>(null)
  const handleDelete = useCallback(
    (todo: Todo) => {
      const item = document.querySelector(`[data-todo-id="${CSS.escape(todo.id)}"]`)
      const neighbor = item?.nextElementSibling ?? item?.previousElementSibling
      focusAfterDelete.current = neighbor?.getAttribute('data-todo-id') ?? ''
      scheduleDelete(todo)
    },
    [scheduleDelete],
  )
  useEffect(() => {
    const targetId = focusAfterDelete.current
    if (targetId === null) return
    focusAfterDelete.current = null
    const target = targetId
      ? document.querySelector<HTMLElement>(`[data-todo-id="${CSS.escape(targetId)}"] input`)
      : null
    ;(target ?? document.getElementById('quick-add'))?.focus()
  }, [shownTodos])

  // 선택된 태그는 해당 할 일이 사라져도 해제할 수 있도록 목록에 남긴다.
  const availableTags = useMemo(
    () =>
      [...new Set([...activeTodos.flatMap((todo) => todo.tags), ...filters.tags])].sort((a, b) =>
        a.localeCompare(b, 'ko'),
      ),
    [activeTodos, filters.tags],
  )

  return (
    <main
      id="main"
      tabIndex={-1}
      className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 focus-visible:outline-none sm:px-6 lg:py-10"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          {t('todos.heading')}
        </h1>
        {!loading && !error && (
          <p aria-live="polite" className="text-sm text-slate-600 dark:text-slate-300">
            {filtering && t('todos.showing', { count: shownTodos.length })}
            {t('todos.summary', {
              remaining,
              total: activeTodos.length,
              count: activeTodos.length,
            })}
          </p>
        )}
      </div>

      <QuickAddForm
        onAdd={(title) => handleCreate({ title })}
        onOpenDetails={(title) => setEditor({ mode: 'create', title })}
      />

      {activeTodos.length > 0 && (
        <TodoFilters
          filters={filters}
          search={search}
          availableTags={availableTags}
          filtering={filtering}
          onSearchChange={setSearch}
          onChange={updateFilters}
          onToggleTag={toggleTag}
          onReset={resetFilters}
        />
      )}

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      ) : (
        <TodoList
          todos={shownTodos}
          loading={loading}
          onResetFilters={activeTodos.length > 0 ? resetFilters : undefined}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {editor.mode !== 'closed' && (
        <TodoEditor
          // 다른 할 일을 열면 입력 상태를 새로 초기화한다.
          key={editor.mode === 'edit' ? editor.todo.id : 'new'}
          todo={editor.mode === 'edit' ? editor.todo : undefined}
          initialTitle={editor.mode === 'create' ? editor.title : undefined}
          onSave={handleSave}
          onClose={() => setEditor({ mode: 'closed' })}
        />
      )}
    </main>
  )
}
