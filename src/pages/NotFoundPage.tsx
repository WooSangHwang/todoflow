import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageShell } from '@/components/PageShell'

export const NotFoundPage = () => {
  const { t } = useTranslation()
  return (
    <PageShell title="404">
      <p>{t('notFound.message')}</p>
      <Link to="/" className="text-indigo-700 hover:underline dark:text-indigo-300">
        {t('notFound.home')}
      </Link>
    </PageShell>
  )
}
