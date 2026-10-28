import { expect, PASSWORD, quickAdd, shownTitles, test } from './fixtures'

test('로그인 전에는 할 일 화면에 들어갈 수 없다', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/signin$/)
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
})

test('할 일 추가 → 완료 → 수정 → 새로고침 후에도 유지', async ({ app }) => {
  await quickAdd(app, '우유 사기')
  await expect(app.getByText('남은 할 일 1개 / 전체 1개')).toBeVisible()

  await app.getByRole('checkbox', { name: "'우유 사기' 완료" }).click()
  await expect(app.getByText('남은 할 일 0개 / 전체 1개')).toBeVisible()

  await app.getByRole('button', { name: "'우유 사기' 수정" }).click()
  const dialog = app.getByRole('dialog')
  await dialog.getByLabel('제목').fill('두유 사기')
  await dialog.getByText('높음', { exact: true }).click()
  await dialog.getByLabel('태그').fill('장보기')
  await dialog.getByRole('button', { name: '저장' }).click()
  await expect(dialog).toBeHidden()

  await app.reload()
  const item = app.locator('li[data-todo-id]', { hasText: '두유 사기' })
  await expect(item.getByRole('checkbox')).toBeChecked()
  await expect(item.getByText('우선순위 높음')).toBeVisible()
  await expect(item.getByText('#장보기')).toBeVisible()
})

test('삭제는 3초 안에 버튼이나 Ctrl/⌘+Z로 되돌릴 수 있다', async ({ app }) => {
  await quickAdd(app, '남길 일')
  await quickAdd(app, '지울 일')

  await app.getByRole('button', { name: "'지울 일' 삭제" }).click()
  await expect(app.getByText('지울 일', { exact: true })).toBeHidden()
  await app.getByRole('button', { name: /^실행취소/ }).click()
  await expect(app.getByText('지울 일', { exact: true })).toBeVisible()

  await app.getByRole('button', { name: "'지울 일' 삭제" }).click()
  await app.keyboard.press('ControlOrMeta+z')
  await expect(app.getByText('지울 일', { exact: true })).toBeVisible()

  await app.getByRole('button', { name: "'지울 일' 삭제" }).click()
  await expect(app.getByText("'지울 일' 삭제됨")).toBeHidden({ timeout: 6_000 })
  await app.reload()
  await expect.poll(() => shownTitles(app)).toEqual(['남길 일'])
})

test('필터·검색·정렬과 저장된 필터', async ({ app }) => {
  for (const [title, priority] of [
    ['보고서 쓰기', '낮음'],
    ['운동하기', '높음'],
    ['책 읽기', '보통'],
  ]) {
    await app.getByRole('button', { name: '자세히' }).click()
    const dialog = app.getByRole('dialog')
    await dialog.getByLabel('제목').fill(title)
    await dialog.getByText(priority, { exact: true }).click()
    await dialog.getByRole('button', { name: '저장' }).click()
    await expect(dialog).toBeHidden()
  }
  await app.getByRole('checkbox', { name: "'책 읽기' 완료" }).click()

  await app.getByLabel('정렬', { exact: true }).selectOption({ label: '우선순위 높은순' })
  expect(await shownTitles(app)).toEqual(['운동하기', '책 읽기', '보고서 쓰기'])

  await app.getByRole('button', { name: '진행 중' }).click()
  expect(await shownTitles(app)).toEqual(['운동하기', '보고서 쓰기'])

  await app.getByLabel('할 일 검색').fill('보고')
  await expect.poll(() => shownTitles(app)).toEqual(['보고서 쓰기'])

  // 필터·정렬은 저장되고 검색어는 저장되지 않는다.
  await app.reload()
  await expect(app.getByLabel('할 일 검색')).toHaveValue('')
  await expect.poll(() => shownTitles(app)).toEqual(['운동하기', '보고서 쓰기'])
})

test('같은 계정의 다른 기기에서 바꾸면 실시간으로 반영된다', async ({ app, browser, email }) => {
  const other = await (await browser.newContext({ locale: 'ko-KR' })).newPage()
  await other.goto('/signin')
  await other.getByLabel('이메일', { exact: true }).fill(email)
  await other.getByLabel('비밀번호', { exact: true }).fill(PASSWORD)
  await other.locator('form button[type=submit]').click()
  await expect(other.getByText('할 일이 없습니다')).toBeVisible()

  await quickAdd(app, '동기화 확인')
  await expect(other.getByText('동기화 확인')).toBeVisible()

  await other.getByRole('checkbox', { name: "'동기화 확인' 완료" }).click()
  await expect(app.getByRole('checkbox', { name: "'동기화 확인' 완료" })).toBeChecked()
  await other.context().close()
})

test('로그아웃하면 로그인 화면으로 가고, 다시 로그인하면 데이터가 그대로다', async ({
  app,
  email,
}) => {
  await quickAdd(app, '로그아웃 전 할 일')
  await app.getByRole('button', { name: '로그아웃', exact: true }).click()
  await expect(app).toHaveURL(/\/signin$/)

  await app.getByLabel('이메일', { exact: true }).fill(email)
  await app.getByLabel('비밀번호', { exact: true }).fill(PASSWORD)
  await app.locator('form button[type=submit]').click()
  await expect(app.getByText('로그아웃 전 할 일')).toBeVisible()
})
