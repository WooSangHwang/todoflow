import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageShell } from '@/components/PageShell'
import { useAuth } from '@/hooks/useAuth'

export const AccountPage = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const providerNames: Record<string, string> = {
    password: t('account.providerPassword'),
    'google.com': 'Google',
  }
  const providers = user?.providerData.map((p) => providerNames[p.providerId] ?? p.providerId)

  return (
    <PageShell title={t('account.title')}>
      <dl className="space-y-1 text-sm">
        <div>
          <dt className="inline font-medium">{t('account.name')}</dt>
          <dd className="inline">{user?.displayName ?? '-'}</dd>
        </div>
        <div>
          <dt className="inline font-medium">{t('account.email')}</dt>
          <dd className="inline">{user?.email ?? '-'}</dd>
        </div>
        <div>
          <dt className="inline font-medium">{t('account.provider')}</dt>
          <dd className="inline">{providers?.join(', ') || '-'}</dd>
        </div>
      </dl>
      <Link to="/app" className="text-indigo-700 hover:underline dark:text-indigo-300">
        {t('account.backToList')}
      </Link>
    </PageShell>
  )
}
