export type TodoPriority = 'low' | 'medium' | 'high'

// Firestore 경로: users/{uid}/todos/{id}. 소유자는 경로로 식별하므로 userId 필드를 두지 않는다.
export interface Todo {
  id: string
  title: string
  description: string
  completed: boolean
  priority: TodoPriority
  dueDate: Date | null
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 생성 시 입력값. title 외에는 기본값이 채워진다.
export type TodoInput = Pick<Todo, 'title'> &
  Partial<Pick<Todo, 'description' | 'priority' | 'dueDate' | 'tags'>>

// 수정 가능한 필드
export type TodoUpdate = Partial<
  Pick<Todo, 'title' | 'description' | 'completed' | 'priority' | 'dueDate' | 'tags'>
>
