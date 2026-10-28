import { useTranslation } from 'react-i18next'

export const Spinner = ({ className = 'size-4' }: { className?: string }) => {
  const { t } = useTranslation()
  return (
    <span
      role="status"
      aria-label={t('common.loading')}
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  )
}
