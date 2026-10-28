// Firestore 보안 규칙 테스트. `npm run test:emulators`로 에뮬레이터(Auth + Firestore) 위에서 실행한다.
// demo- 접두사 프로젝트는 실제 Firebase 프로젝트에 절대 연결되지 않는다.
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, createUserWithEmailAndPassword, getAuth } from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  serverTimestamp,
  setDoc,
  terminate,
  Timestamp,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { toCreateData, toUpdateData } from '@/lib/todoConverter'

const PROJECT_ID = 'demo-todoflow'

type Client = { app: FirebaseApp; db: Firestore; uid: string | null }

const createClient = async (name: string, signedIn: boolean): Promise<Client> => {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT_ID }, name)
  const auth = getAuth(app)
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  const db = getFirestore(app)
  connectFirestoreEmulator(db, '127.0.0.1', 8080)

  if (!signedIn) return { app, db, uid: null }
  const { user } = await createUserWithEmailAndPassword(
    auth,
    `${name}-${Date.now()}@example.com`,
    'password123',
  )
  return { app, db, uid: user.uid }
}

const expectDenied = (promise: Promise<unknown>) =>
  expect(promise).rejects.toMatchObject({ code: 'permission-denied' })

let alice: Client
let bob: Client
let guest: Client

const todoRef = (client: Client, ownerUid: string, id: string) =>
  doc(client.db, 'users', ownerUid, 'todos', id)

const validData = () => toCreateData({ title: '장보기' })

beforeAll(async () => {
  ;[alice, bob, guest] = await Promise.all([
    createClient('alice', true),
    createClient('bob', true),
    createClient('guest', false),
  ])
})

afterAll(async () => {
  for (const client of [alice, bob, guest]) {
    await terminate(client.db)
    await deleteApp(client.app)
  }
})

describe('소유자 접근', () => {
  it('본인 할 일 생성/조회/목록/수정/삭제 가능', async () => {
    const ref = todoRef(alice, alice.uid!, 'own')
    await setDoc(ref, validData())
    expect((await getDoc(ref)).data()?.title).toBe('장보기')
    expect((await getDocs(collection(alice.db, 'users', alice.uid!, 'todos'))).size).toBe(1)
    await updateDoc(ref, toUpdateData({ completed: true, title: '장보기 완료' }))
    await deleteDoc(ref)
    expect((await getDoc(ref)).exists()).toBe(false)
  })
})

describe('타인/미인증 접근 차단', () => {
  beforeAll(async () => {
    await setDoc(todoRef(alice, alice.uid!, 'private'), validData())
  })

  it('다른 사용자는 읽기/목록 조회 불가', async () => {
    await expectDenied(getDoc(todoRef(bob, alice.uid!, 'private')))
    await expectDenied(getDocs(collection(bob.db, 'users', alice.uid!, 'todos')))
  })

  it('다른 사용자는 생성/수정/삭제 불가', async () => {
    await expectDenied(setDoc(todoRef(bob, alice.uid!, 'by-bob'), validData()))
    await expectDenied(
      updateDoc(todoRef(bob, alice.uid!, 'private'), toUpdateData({ completed: true })),
    )
    await expectDenied(deleteDoc(todoRef(bob, alice.uid!, 'private')))
  })

  it('미인증 사용자는 읽기/쓰기 불가', async () => {
    await expectDenied(getDoc(todoRef(guest, alice.uid!, 'private')))
    await expectDenied(setDoc(todoRef(guest, alice.uid!, 'by-guest'), validData()))
  })

  it('정의되지 않은 경로는 쓰기 불가', async () => {
    await expectDenied(setDoc(doc(alice.db, 'other', 'x'), { a: 1 }))
    await expectDenied(setDoc(doc(alice.db, 'users', alice.uid!), { name: 'alice' }))
  })
})

describe('생성 시 데이터 검증', () => {
  let n = 0
  const create = (data: Record<string, unknown>) =>
    setDoc(todoRef(alice, alice.uid!, `create-${n++}`), data)

  it('제목 200자는 허용', async () => {
    await create(toCreateData({ title: 'a'.repeat(200) }))
  })

  it('필수 필드 누락 시 거부', async () => {
    const { description: _omit, ...data } = validData()
    await expectDenied(create(data))
  })

  it('정의되지 않은 필드 추가 시 거부', async () => {
    await expectDenied(create({ ...validData(), userId: alice.uid }))
  })

  it('빈 제목 / 200자 초과 제목 거부', async () => {
    await expectDenied(create({ ...validData(), title: '' }))
    await expectDenied(create({ ...validData(), title: 'a'.repeat(201) }))
  })

  it('잘못된 타입/값 거부', async () => {
    await expectDenied(create({ ...validData(), priority: 'urgent' }))
    await expectDenied(create({ ...validData(), completed: 'yes' }))
    await expectDenied(create({ ...validData(), dueDate: '2026-12-31' }))
    await expectDenied(create({ ...validData(), description: 'a'.repeat(2001) }))
  })

  it('태그 11개 이상 거부', async () => {
    await expectDenied(
      create({ ...validData(), tags: Array.from({ length: 11 }, (_, i) => `t${i}`) }),
    )
  })

  it('클라이언트가 지정한 createdAt/updatedAt 거부', async () => {
    await expectDenied(create({ ...validData(), createdAt: Timestamp.now() }))
    await expectDenied(create({ ...validData(), updatedAt: Timestamp.now() }))
  })
})

describe('수정 시 데이터 검증', () => {
  const ref = () => todoRef(alice, alice.uid!, 'update-target')

  beforeAll(async () => {
    await setDoc(ref(), validData())
  })

  it('정상 수정 허용 (마감일 설정 포함)', async () => {
    await updateDoc(ref(), toUpdateData({ priority: 'high', dueDate: new Date('2026-12-31') }))
  })

  it('createdAt 변경 거부', async () => {
    await expectDenied(
      updateDoc(ref(), { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    )
  })

  it('updatedAt 미갱신 거부', async () => {
    await expectDenied(updateDoc(ref(), { completed: true }))
  })

  it('잘못된 값으로 수정 거부', async () => {
    await expectDenied(updateDoc(ref(), toUpdateData({ title: '' })))
    await expectDenied(updateDoc(ref(), { ...toUpdateData({}), completed: 'yes' }))
  })
})
