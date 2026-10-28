// 실제 앱(App)을 Auth·Firestore 에뮬레이터에 연결해 사용자 시나리오를 검증한다.
// `npm run test:emulators`로 실행한다. "다른 기기"는 같은 계정으로 로그인한 두 번째 Firebase 앱이다.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { deleteApp, FirebaseError, initializeApp, type FirebaseApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
  terminate,
  updateDoc,
  type Firestore,
} from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import App from '@/App'
import { logOut, signUpWithEmail } from '@/lib/auth'
import { db } from '@/lib/db'
import { toCreateData, toUpdateData } from '@/lib/todoConverter'
import { waitForLoadingToFinish } from '@/test/helpers'
import type { TodoInput } from '@/types/todo'

const email = `integration-${Date.now()}@example.com`
const password = 'test1234!'
let uid: string
let device: FirebaseApp
let deviceDb: Firestore

beforeAll(async () => {
  uid = (await signUpWithEmail(email, password)).uid
  device = initializeApp({ apiKey: 'demo-api-key', projectId: 'demo-todoflow' }, 'other-device')
  const deviceAuth = getAuth(device)
  connectAuthEmulator(deviceAuth, 'http://127.0.0.1:9099', { disableWarnings: true })
  deviceDb = getFirestore(device)
  connectFirestoreEmulator(deviceDb, '127.0.0.1', 8080)
  await signInWithEmailAndPassword(deviceAuth, email, password)
})

afterAll(async () => {
  await terminate(deviceDb)
  await deleteApp(device)
  await logOut()
})

const todosOnDevice = () => collection(deviceDb, 'users', uid, 'todos')

beforeEach(async () => {
  const snapshot = await getDocs(todosOnDevice())
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)))
})

// 다른 기기에서 할 일을 만든다(앱과 같은 변환 함수 사용 → 보안 규칙도 통과해야 한다).
const createOnDevice = async (input: TodoInput, completed = false) => {
  const ref = doc(todosOnDevice())
  await setDoc(ref, toCreateData(input))
  if (completed) await updateDoc(ref, toUpdateData({ completed: true }))
  return ref
}

const renderApp = async () => {
  window.history.pushState({}, '', '/app')
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('heading', { name: '할 일 목록' }, { timeout: 10_000 })
  await waitForLoadingToFinish()
  return user
}

// 화면에 보이는 할 일 제목(위에서부터)
const shownTitles = () =>
  screen
    .queryAllByRole('listitem')
    .filter((li) => li.hasAttribute('data-todo-id'))
    .map((li) => li.querySelector('p')?.textContent)

describe('할 일 생성·완료', () => {
  it('입력칸에서 추가하면 목록에 나타나고 서버에 저장된다', async () => {
    const user = await renderApp()
    await user.type(screen.getByLabelText('새 할 일'), '  우유 사기  {Enter}')

    expect(await screen.findByText('우유 사기')).toBeInTheDocument()
    expect(screen.getByText('남은 할 일 1개 / 전체 1개')).toBeInTheDocument()
    await waitFor(async () => {
      const saved = (await getDocs(todosOnDevice())).docs.map((d) => d.data())
      expect(saved).toMatchObject([{ title: '우유 사기', completed: false, priority: 'medium' }])
    })
  })

  it('체크하면 완료로 저장되고 남은 개수가 줄어든다', async () => {
    const ref = await createOnDevice({ title: '빨래' })
    const user = await renderApp()

    await user.click(await screen.findByRole('checkbox', { name: "'빨래' 완료" }))

    expect(screen.getByRole('checkbox', { name: "'빨래' 완료" })).toBeChecked()
    expect(screen.getByText('남은 할 일 0개 / 전체 1개')).toBeInTheDocument()
    await waitFor(async () => expect((await getDoc(ref)).data()?.completed).toBe(true))
  })

  it('편집기에서 제목 없이 저장하면 오류를 보여주고 저장하지 않는다', async () => {
    const user = await renderApp()
    await user.click(screen.getByRole('button', { name: '자세히' }))
    const dialog = await screen.findByRole('dialog')

    await user.click(within(dialog).getByRole('button', { name: '저장' }))

    expect(within(dialog).getByText('제목을 입력해 주세요.')).toBeInTheDocument()
    expect(within(dialog).getByLabelText('제목')).toHaveFocus()
    expect((await getDocs(todosOnDevice())).size).toBe(0)
  })
})

describe('필터링·정렬', () => {
  beforeEach(async () => {
    await createOnDevice({ title: '보통 일', priority: 'medium' })
    await createOnDevice({ title: '낮은 일', priority: 'low' }, true)
    await createOnDevice({ title: '높은 일', priority: 'high' })
  })

  it('완료 필터를 켜면 완료한 할 일만 보인다', async () => {
    const user = await renderApp()
    await screen.findByText('높은 일')

    await user.click(screen.getByRole('button', { name: '완료', pressed: false }))

    expect(shownTitles()).toEqual(['낮은 일'])
    expect(screen.getByText(/1개 표시 중/)).toBeInTheDocument()
  })

  it('우선순위 높은순으로 정렬한다', async () => {
    const user = await renderApp()
    await screen.findByText('높은 일')

    await user.selectOptions(screen.getByLabelText('정렬', { exact: true }), '우선순위 높은순')

    expect(shownTitles()).toEqual(['높은 일', '보통 일', '낮은 일'])
  })
})

describe('실시간 동기화', () => {
  it('다른 기기에서 추가·수정·삭제하면 새로고침 없이 화면에 반영된다', async () => {
    await renderApp()
    // 앞 테스트의 할 일이 로컬 캐시에서 먼저 보일 수 있어, 서버 기준 빈 목록이 될 때까지 기다린다.
    expect(await screen.findByText('할 일이 없습니다')).toBeInTheDocument()

    const ref = await createOnDevice({ title: '다른 기기에서 추가' })
    expect(await screen.findByText('다른 기기에서 추가')).toBeInTheDocument()

    await updateDoc(ref, toUpdateData({ title: '다른 기기에서 수정' }))
    expect(await screen.findByText('다른 기기에서 수정')).toBeInTheDocument()
    expect(screen.queryByText('다른 기기에서 추가')).not.toBeInTheDocument()

    await deleteDoc(ref)
    expect(await screen.findByText('할 일이 없습니다')).toBeInTheDocument()
  })
})

describe('권한 검증', () => {
  it('앱의 Firestore 연결로 다른 사용자의 할 일을 읽으면 거부된다', async () => {
    const error = await getDocs(collection(db, 'users', 'someone-else', 'todos')).catch((e) => e)
    expect(error).toBeInstanceOf(FirebaseError)
    expect((error as FirebaseError).code).toBe('permission-denied')
  })
})
