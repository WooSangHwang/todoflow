import { test as base, expect, type Page } from '@playwright/test'

export const PASSWORD = 'test1234!'

// 테스트마다 고유한 이메일로 에뮬레이터에 가입해 할 일 화면까지 들어간 페이지를 준다.
// 계정이 서로 달라 테스트를 병렬로 돌려도 데이터가 섞이지 않는다.
export const signUp = async (page: Page, email: string) => {
  await page.goto('/signin')
  await page.getByRole('button', { name: '회원가입' }).first().click()
  await page.getByLabel('이메일', { exact: true }).fill(email)
  await page.getByLabel('비밀번호', { exact: true }).fill(PASSWORD)
  await page.getByLabel('비밀번호 확인').fill(PASSWORD)
  await page.locator('form button[type=submit]').click()
  await expect(page.getByRole('heading', { name: '할 일 목록' })).toBeVisible()
  await expect(page.getByText('할 일이 없습니다')).toBeVisible()
}

export const test = base.extend<{ email: string; app: Page }>({
  // Playwright fixture의 두 번째 인자(값 전달 함수)는 관례상 use지만, React 훅 린트 규칙과
  // 이름이 겹쳐 provide로 쓴다.
  // oxlint-disable-next-line no-empty-pattern -- Playwright fixture는 첫 인자를 구조 분해해야 한다.
  email: async ({}, provide, testInfo) => {
    await provide(`e2e-${testInfo.workerIndex}-${Date.now()}@example.com`)
  },
  app: async ({ page, email }, provide) => {
    await signUp(page, email)
    await provide(page)
  },
})

export { expect }

// 입력칸에서 할 일 추가
export const quickAdd = async (page: Page, title: string) => {
  await page.getByLabel('새 할 일').fill(title)
  await page.getByLabel('새 할 일').press('Enter')
  await expect(page.getByText(title, { exact: true })).toBeVisible()
}

// 화면에 보이는 할 일 제목(위에서부터)
export const shownTitles = (page: Page) =>
  page.locator('li[data-todo-id] p.font-medium').allTextContents()
