import { defineConfig } from '@playwright/test'

// - app: 로컬 Vite(--mode e2e) + Firebase 에뮬레이터. `npm run test:e2e`
// - smoke: 배포된 주소(BASE_URL)에 읽기 전용 점검. `BASE_URL=https://... npm run test:smoke`
// 브라우저는 로컬·GitHub Actions 러너에 이미 설치된 Chrome을 쓴다(별도 다운로드 없음).
const E2E_PORT = 5174

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    channel: 'chrome',
    locale: 'ko-KR',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'app',
      testMatch: 'app/**/*.spec.ts',
      use: { baseURL: `http://localhost:${E2E_PORT}` },
    },
    {
      name: 'smoke',
      testMatch: 'smoke.spec.ts',
      use: { baseURL: process.env.BASE_URL },
    },
  ],
  // app 프로젝트만 로컬 서버가 필요하다. smoke만 돌릴 때는 띄우지 않는다.
  webServer: process.argv.includes('smoke')
    ? undefined
    : {
        command: `vite --mode e2e --port ${E2E_PORT} --strictPort`,
        url: `http://localhost:${E2E_PORT}`,
        reuseExistingServer: !process.env.CI,
      },
})
