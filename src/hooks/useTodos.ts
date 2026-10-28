import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { getFirestoreErrorMessage } from '@/lib/firestoreErrors'
import { todoConverter } from '@/lib/todoConverter'
import { todosCollection } from '@/lib/todoService'
import type { Todo } from '@/types/todo'

type TodosState = {
  uid: string
  todos: Todo[]
  loading: boolean
  error?: string
}

// 현재 사용자의 할 일을 최신순으로 실시간 구독한다.
export const useTodos = (uid: string) => {
  const [state, setState] = useState<TodosState>({ uid, todos: [], loading: true })

  useEffect(() => {
    const q = query(todosCollection(uid).withConverter(todoConverter), orderBy('createdAt', 'desc'))
    return onSnapshot(
      q,
      (snapshot) => {
        // Firestore는 스냅샷마다 모든 문서 객체를 새로 만든다. 바뀐 문서만 새 객체로 바꾸고 나머지는
        // 이전 객체를 재사용해야 memo된 TodoItem이 바뀐 항목만 다시 그린다.
        const changed = new Set(snapshot.docChanges().map((change) => change.doc.id))
        setState((prev) => {
          const previous = new Map(prev.uid === uid ? prev.todos.map((t) => [t.id, t]) : [])
          const todos = snapshot.docs.map((d) =>
            changed.has(d.id) ? d.data() : (previous.get(d.id) ?? d.data()),
          )
          return { uid, todos, loading: false }
        })
      },
      (error) =>
        setState({ uid, todos: [], loading: false, error: getFirestoreErrorMessage(error) }),
    )
  }, [uid])

  // uid가 바뀐 직후 첫 스냅샷 전에는 이전 사용자의 목록 대신 로딩 상태를 보여준다.
  if (state.uid !== uid) return { todos: [], loading: true, error: undefined }
  return { todos: state.todos, loading: state.loading, error: state.error }
}
