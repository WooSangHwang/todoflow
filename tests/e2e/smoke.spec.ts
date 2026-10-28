// 배포 직후 실제 주소에서 돌리는 읽기 전용 점검. 계정을 만들거나 데이터를 쓰지 않는다.
import { expect, test } from '@playwright/test'

test.skip(!process.env.BASE_URL, 'BASE_URL이 없으면 건너뛴다')

test('로그인 화면이 오류 없이 뜬다', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))

  await page.goto('/signin')
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeEnabled()
  expect(errors).toEqual([])
})

test('보호된 주소는 로그인 화면으로 보내고, 깊은 주소 새로고침도 동작한다', async ({ page }) => {
  await page.goto('/app')
  await expect(page).toHaveURL(/\/signin$/)

  const response = await page.goto('/account')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
})
