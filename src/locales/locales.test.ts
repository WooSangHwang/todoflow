import { describe, expect, it } from 'vitest'
import en from './en.json'
import ko from './ko.json'

type Messages = { [key: string]: string | Messages }

// { a: { b: 'x' } } → { 'a.b': 'x' }. 영어 복수형 접미사(_one/_other)는 같은 키로 묶는다.
const flatten = (messages: Messages, prefix = ''): Map<string, string[]> => {
  const result = new Map<string, string[]>()
  for (const [key, value] of Object.entries(messages)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (typeof value === 'string') {
      const base = path.replace(/_(zero|one|two|few|many|other)$/, '')
      result.set(base, [...(result.get(base) ?? []), value])
    } else {
      for (const [k, v] of flatten(value, path)) result.set(k, v)
    }
  }
  return result
}

const placeholders = (texts: string[]) =>
  [...new Set(texts.flatMap((text) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])))]
    .filter((name) => name !== 'count')
    .sort()

describe('번역 파일', () => {
  const koKeys = flatten(ko)
  const enKeys = flatten(en)

  it('en.json에 ko.json의 모든 키가 있다', () => {
    expect([...koKeys.keys()].filter((key) => !enKeys.has(key))).toEqual([])
  })

  it('en.json에 ko.json에 없는 키가 없다', () => {
    expect([...enKeys.keys()].filter((key) => !koKeys.has(key))).toEqual([])
  })

  it('같은 키는 같은 {{변수}}를 쓴다', () => {
    const mismatches = [...koKeys]
      .filter(([key]) => enKeys.has(key))
      .filter(
        ([key, texts]) => placeholders(texts).join() !== placeholders(enKeys.get(key)!).join(),
      )
      .map(([key]) => key)
    expect(mismatches).toEqual([])
  })

  it('빈 번역이 없다', () => {
    const empty = [...koKeys, ...enKeys].filter(([, texts]) => texts.some((t) => !t.trim()))
    expect(empty.map(([key]) => key)).toEqual([])
  })
})
