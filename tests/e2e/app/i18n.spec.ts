import { expect, test } from '@playwright/test'

test.use({ locale: 'en-US' })

test('브라우저 언어가 영어면 영어로 시작하고, 전환한 언어는 저장된다', async ({ page }) => {
  await page.goto('/signin')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')

  await page.getByRole('button', { name: '한국어', exact: true }).click()
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko')

  await page.reload()
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible()
})
