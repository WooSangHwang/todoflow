import { i18n } from '@/lib/i18n'

// <input type="date">는 'YYYY-MM-DD' 문자열을 쓴다. new Date('YYYY-MM-DD')는 UTC로 해석되어
// 시간대에 따라 하루가 밀리므로, 항상 사용자 로컬 자정 기준으로 변환한다.

const pad = (n: number) => String(n).padStart(2, '0')

export const toDateInputValue = (date: Date | null) =>
  date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : ''

export const fromDateInputValue = (value: string) => {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const dayDiff = (date: Date, now: Date) =>
  Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000)

// 마감일이 오늘보다 이전이면 기한 초과 (오늘 마감은 초과 아님)
export const isOverdue = (dueDate: Date | null, now = new Date()) =>
  dueDate !== null && dayDiff(dueDate, now) < 0

// 언어별 날짜 포맷터를 한 번만 만든다(Intl.DateTimeFormat 생성은 비싸다).
const formatters = new Map<string, { monthDay: Intl.DateTimeFormat; full: Intl.DateTimeFormat }>()
const getFormatters = (lang: string) => {
  let entry = formatters.get(lang)
  if (!entry) {
    entry = {
      monthDay: new Intl.DateTimeFormat(lang, { month: 'long', day: 'numeric' }),
      full: new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' }),
    }
    formatters.set(lang, entry)
  }
  return entry
}

export const formatDueDate = (dueDate: Date, now = new Date()) => {
  const diff = dayDiff(dueDate, now)
  if (diff === 0) return i18n.t('dates.today')
  if (diff === 1) return i18n.t('dates.tomorrow')
  if (diff === -1) return i18n.t('dates.yesterday')
  const { monthDay, full } = getFormatters(i18n.language)
  return dueDate.getFullYear() === now.getFullYear()
    ? monthDay.format(dueDate)
    : full.format(dueDate)
}
