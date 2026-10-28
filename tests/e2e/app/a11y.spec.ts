import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { expect, quickAdd, test } from './fixtures'

const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'wcag2aaa']
const violations = async (page: Page) =>
  (await new AxeBuilder({ page }).withTags(WCAG).analyze()).violations.map(
    (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  )

for (const colorScheme of ['light', 'dark'] as const) {
  test(`axe 검사 (${colorScheme}): 로그인·목록·모달·토스트`, async ({ page, app }) => {
    await page.emulateMedia({ colorScheme })
    await quickAdd(app, '접근성 확인')
    expect(await violations(app)).toEqual([])

    await app.getByRole('button', { name: "'접근성 확인' 수정" }).click()
    expect(await violations(app)).toEqual([])
    await app.keyboard.press('Escape')

    await app.getByRole('button', { name: "'접근성 확인' 삭제" }).click()
    expect(await violations(app)).toEqual([])

    await app.getByRole('button', { name: '로그아웃', exact: true }).click()
    await expect(app.getByRole('heading', { name: '로그인' })).toBeVisible()
    expect(await violations(app)).toEqual([])
  })
}

test('키보드만으로: 건너뛰기 링크, 모달 포커스 가두기·복원', async ({ app }) => {
  await app.keyboard.press('Tab')
  await expect(app.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused()
  await app.keyboard.press('Enter')
  await app.keyboard.press('Tab')
  await expect(app.getByLabel('새 할 일')).toBeFocused()

  await app.keyboard.type('키보드 할 일')
  await app.keyboard.press('Enter')
  const edit = app.getByRole('button', { name: "'키보드 할 일' 수정" })
  await edit.focus()
  await app.keyboard.press('Enter')
  const dialog = app.getByRole('dialog')
  await expect(dialog.getByLabel('제목')).toBeFocused()

  for (let i = 0; i < 20; i++) await app.keyboard.press('Tab')
  expect(await app.evaluate(() => !!document.activeElement?.closest('dialog'))).toBe(true)

  await app.keyboard.press('Escape')
  await expect(edit).toBeFocused()
})
