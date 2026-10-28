import {
  serverTimestamp,
  Timestamp,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import type { Todo, TodoInput, TodoUpdate } from '@/types/todo'

// firestore.rules의 검증 조건과 반드시 일치시킬 것
export const TODO_LIMITS = {
  titleMaxLength: 200,
  descriptionMaxLength: 2000,
  maxTags: 10,
} as const

const toDate = (value: unknown) => (value instanceof Timestamp ? value.toDate() : null)

// 읽기 전용 컨버터. 쓰기는 serverTimestamp 처리를 위해 toCreateData / toUpdateData를 사용한다.
export const todoConverter: FirestoreDataConverter<Todo> = {
  toFirestore: () => {
    throw new Error('todoConverter는 읽기 전용입니다. toCreateData / toUpdateData를 사용하세요.')
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    // 로컬에서 방금 쓴 문서는 serverTimestamp가 아직 null이므로 추정값으로 채운다.
    const data = snapshot.data({ serverTimestamps: 'estimate' })
    return {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      completed: data.completed,
      priority: data.priority,
      dueDate: toDate(data.dueDate),
      tags: data.tags,
      createdAt: toDate(data.createdAt) ?? new Date(),
      updatedAt: toDate(data.updatedAt) ?? new Date(),
    }
  },
}

const toTimestamp = (date: Date | null) => (date ? Timestamp.fromDate(date) : null)

export const toCreateData = (input: TodoInput) => ({
  title: input.title.trim(),
  description: input.description?.trim() ?? '',
  completed: false,
  priority: input.priority ?? 'medium',
  dueDate: toTimestamp(input.dueDate ?? null),
  tags: input.tags ?? [],
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

export const toUpdateData = (update: TodoUpdate) => {
  const { title, description, dueDate, ...rest } = update
  return {
    ...rest,
    ...(title !== undefined && { title: title.trim() }),
    ...(description !== undefined && { description: description.trim() }),
    ...(dueDate !== undefined && { dueDate: toTimestamp(dueDate) }),
    updatedAt: serverTimestamp(),
  }
}
