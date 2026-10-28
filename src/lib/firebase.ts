import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth } from 'firebase/auth'
import { i18n } from '@/lib/i18n'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// .env 누락 시 Firebase의 모호한 에러(auth/invalid-api-key 등) 대신 빠진 변수명을 바로 알려준다.
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)
if (missing.length > 0) {
  throw new Error(
    `Firebase 환경변수가 설정되지 않았습니다: ${missing.join(', ')}. .env.example을 참고해 .env를 작성하세요.`,
  )
}

// 로컬 개발·통합 테스트에서 실제 프로젝트 대신 에뮬레이터를 쓴다(포트는 firebase.json과 일치).
export const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true'

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
if (useEmulators) connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
// Google 로그인 팝업과 비밀번호 재설정 메일을 앱과 같은 언어로 표시
auth.languageCode = i18n.language
i18n.on('languageChanged', (lang) => {
  auth.languageCode = lang
})
