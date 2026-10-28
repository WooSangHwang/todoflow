import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { getFirestoreErrorMessage } from '@/lib/firestoreErrors'
import { i18n } from '@/lib/i18n'
import { deleteTodo } from '@/lib/todoService'
import type { Todo } from '@/types/todo'

export const UNDO_DELETE_MS = 3000

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent)
export const UNDO_SHORTCUT_LABEL = isMac ? '⌘Z' : 'Ctrl+Z'

// 글자를 입력하는 칸만 해당한다. 체크박스·버튼에 포커스가 있을 때는 앱 실행취소로 처리한다.
const isTextEntry = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    target.matches(
      'textarea, select, input:not([type=checkbox], [type=radio], [type=button], [type=submit])',
    ))

// 삭제를 3초 유예한다. 유예 중인 항목은 pendingIds로 화면에서만 숨기고, 실행취소 시 타이머를 취소한다.
// 3초 안에 토스트 버튼까지 가기 어려운 키보드·스크린리더 사용자를 위해 Ctrl/⌘+Z로도 실행취소할 수 있다.
export const useUndoableDelete = (uid: string) => {
  const { showToast, dismissToast } = useToast()
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set())
  // 삽입 순서가 유지되므로 마지막 항목이 가장 최근에 삭제한 할 일이다.
  const pending = useRef(
    new Map<string, { timer: ReturnType<typeof setTimeout>; toastId: number }>(),
  )

  const setPending = useCallback(
    (id: string, isPending: boolean) =>
      setPendingIds((prev) => {
        const next = new Set(prev)
        if (isPending) next.add(id)
        else next.delete(id)
        return next
      }),
    [],
  )

  const commitDelete = useCallback(
    (id: string) =>
      deleteTodo(uid, id).catch((error) =>
        showToast({ message: getFirestoreErrorMessage(error), variant: 'error' }),
      ),
    [uid, showToast],
  )

  const undo = useCallback(
    (id: string) => {
      const entry = pending.current.get(id)
      if (!entry) return
      clearTimeout(entry.timer)
      dismissToast(entry.toastId)
      pending.current.delete(id)
      setPending(id, false)
      showToast({ message: i18n.t('toast.undone'), duration: 2000 })
    },
    [showToast, dismissToast, setPending],
  )

  const scheduleDelete = useCallback(
    (todo: Todo) => {
      setPending(todo.id, true)
      const timer = setTimeout(() => {
        pending.current.delete(todo.id)
        void commitDelete(todo.id)
        // deleteDoc이 로컬 캐시에서 즉시 제거하므로 숨김을 풀어도 다시 나타나지 않는다.
        setPending(todo.id, false)
      }, UNDO_DELETE_MS)
      const toastId = showToast({
        message: i18n.t('toast.deleted', { title: todo.title }),
        action: {
          label: i18n.t('toast.undo', { shortcut: UNDO_SHORTCUT_LABEL }),
          onClick: () => undo(todo.id),
        },
        duration: UNDO_DELETE_MS,
      })
      pending.current.set(todo.id, { timer, toastId })
    },
    [commitDelete, showToast, undo, setPending],
  )

  // 입력칸 안에서는 브라우저 기본 되돌리기(글자 undo)를 방해하지 않는다.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'z' || event.shiftKey || !(event.metaKey || event.ctrlKey))
        return
      if (isTextEntry(event.target) || document.querySelector('dialog[open]')) return
      const lastId = [...pending.current.keys()].at(-1)
      if (!lastId) return
      event.preventDefault()
      undo(lastId)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo])

  // 페이지를 떠나면 유예 중인 삭제를 취소하지 않고 즉시 실행한다(사용자는 이미 삭제했다고 인지).
  useEffect(() => {
    const entries = pending.current
    return () => {
      entries.forEach(({ timer }, id) => {
        clearTimeout(timer)
        void commitDelete(id)
      })
      entries.clear()
    }
  }, [commitDelete])

  return { pendingIds, scheduleDelete }
}
