import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { LanguageToggle } from '@/components/LanguageToggle'
import { ThemeToggle } from '@/components/ThemeToggle'
import { i18n } from '@/lib/i18n'

afterEach(async () => {
  await i18n.changeLanguage('ko')
  document.documentElement.classList.remove('dark')
})

it('언어 전환: 글자·<html lang>·저장값이 함께 바뀐다', async () => {
  render(<LanguageToggle />)
  await userEvent.click(screen.getByRole('button', { name: 'English' }))

  expect(document.documentElement.lang).toBe('en')
  expect(localStorage.getItem('lang')).toBe('en')
  expect(screen.getByRole('button', { name: '한국어' })).toHaveAttribute('lang', 'ko')
})

it('테마 전환: 시스템 → 라이트 → 다크 → 시스템 순으로 돌고 저장한다', async () => {
  render(<ThemeToggle />)
  const button = () => screen.getByRole('button')
  expect(button()).toHaveAccessibleName('테마: 시스템 설정 (클릭하면 라이트 모드)')

  await userEvent.click(button())
  expect(localStorage.getItem('theme')).toBe('light')

  await userEvent.click(button())
  expect(localStorage.getItem('theme')).toBe('dark')
  expect(document.documentElement).toHaveClass('dark')

  await userEvent.click(button())
  expect(localStorage.getItem('theme')).toBeNull()
  expect(document.documentElement).not.toHaveClass('dark')
})
