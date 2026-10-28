import { collection, deleteDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/db'
import { toCreateData, toUpdateData } from '@/lib/todoConverter'
import type { TodoInput, TodoUpdate } from '@/types/todo'

// 쓰기는 로컬 캐시에 즉시 반영되어 onSnapshot이 바로 갱신되고(낙관적 업데이트),
// 서버가 거부하면 SDK가 로컬 변경을 되돌린 뒤 반환된 Promise를 reject한다.
// 오프라인이면 온라인 복귀 후 서버 확인까지 Promise가 끝나지 않으므로 UI를 이 Promise에 묶지 말 것.

export const todosCollection = (uid: string) => collection(db, 'users', uid, 'todos')

const todoDoc = (uid: string, todoId: string) => doc(db, 'users', uid, 'todos', todoId)

export const createTodo = (uid: string, input: TodoInput) =>
  setDoc(doc(todosCollection(uid)), toCreateData(input))

export const updateTodo = (uid: string, todoId: string, update: TodoUpdate) =>
  updateDoc(todoDoc(uid, todoId), toUpdateData(update))

export const deleteTodo = (uid: string, todoId: string) => deleteDoc(todoDoc(uid, todoId))
