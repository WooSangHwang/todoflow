import type { TodoPriority } from '@/types/todo'

export const PRIORITIES: TodoPriority[] = ['high', 'medium', 'low']

export const priorityMeta: Record<
  TodoPriority,
  { labelKey: `priority.${TodoPriority}`; badgeClass: string }
> = {
  high: {
    labelKey: 'priority.high',
    badgeClass: 'bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-300',
  },
  medium: {
    labelKey: 'priority.medium',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300',
  },
  low: {
    labelKey: 'priority.low',
    badgeClass: 'bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-300',
  },
}
