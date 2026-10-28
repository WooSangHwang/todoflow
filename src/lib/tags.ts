import { i18n } from '@/lib/i18n'
import { TODO_LIMITS } from '@/lib/todoConverter'

export const TAG_MAX_LENGTH = 20

// "공부, #react, 공부" → ['공부', 'react'] (공백·# 제거, 중복 제거)
export const parseTags = (input: string) => [
  ...new Set(
    input
      .split(',')
      .map((tag) => tag.trim().replace(/^#+/, '').trim())
      .filter(Boolean),
  ),
]

export const validateTags = (tags: string[]) => {
  if (tags.length > TODO_LIMITS.maxTags) return i18n.t('tags.tooMany', { max: TODO_LIMITS.maxTags })
  if (tags.some((tag) => tag.length > TAG_MAX_LENGTH)) {
    return i18n.t('tags.tooLong', { length: TAG_MAX_LENGTH })
  }
}
