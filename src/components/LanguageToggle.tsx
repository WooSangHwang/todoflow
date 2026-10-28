import { useTranslation } from 'react-i18next'
import { changeLanguage, currentLanguage } from '@/lib/i18n'

// 현재 언어가 아닌 다른 언어로 전환한다. 버튼 글자는 전환될 언어의 이름(그 언어로 표기)이다.
// 보이는 글자가 곧 접근 가능한 이름이 되도록 aria-label을 쓰지 않는다(WCAG 2.5.3, 음성 제어 사용자).
export const LanguageToggle = () => {
  const { t } = useTranslation()
  const next = currentLanguage() === 'ko' ? 'en' : 'ko'

  return (
    <button
      type="button"
      onClick={() => changeLanguage(next)}
      title={t('language.switch')}
      lang={next}
      className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      <span aria-hidden="true">🌐</span>
      {next === 'en' ? 'English' : '한국어'}
    </button>
  )
}
