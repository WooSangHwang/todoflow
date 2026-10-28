import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

// 테스트는 .env(실제 프로젝트)를 쓰지 않는다. demo- 프로젝트는 실제 Firebase에 절대 연결되지 않으며,
// CI처럼 .env가 없는 환경에서도 lib/firebase.ts가 초기화된다.
const testEnv = {
  VITE_FIREBASE_API_KEY: 'demo-api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo-todoflow.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-todoflow',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo-todoflow.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '0',
  VITE_FIREBASE_APP_ID: 'demo-app-id',
}

// vite.config.ts(별칭 @, React 플러그인)를 그대로 쓰고 테스트 설정만 더한다.
// - unit: Firebase를 모킹한 단위·컴포넌트 테스트. 에뮬레이터 불필요 (npm test)
// - integration: 실제 앱 화면을 Firestore/Auth 에뮬레이터에 연결한 시나리오 테스트
// - rules: 보안 규칙 테스트
// integration·rules는 에뮬레이터 안에서 실행한다 (npm run test:emulators)
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      env: testEnv,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/*.d.ts'],
        reporter: ['text-summary', 'text', 'html', 'json-summary'],
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            include: ['src/**/*.test.{ts,tsx}'],
          },
        },
        {
          extends: true,
          test: {
            name: 'integration',
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            include: ['tests/integration/**/*.test.{ts,tsx}'],
            env: { ...testEnv, VITE_USE_EMULATORS: 'true' },
            testTimeout: 20_000,
          },
        },
        {
          extends: true,
          test: { name: 'rules', environment: 'node', include: ['tests/*.test.ts'] },
        },
      ],
    },
  }),
)
