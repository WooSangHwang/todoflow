# TodoFlow

로그인한 사용자마다 자기 할 일만 보이고, 여러 기기에서 실시간으로 동기화되는 할 일 앱입니다.
React로 만든 화면이 Firebase(Auth, Firestore)를 백엔드로 씁니다. 직접 운영하는 서버는 없습니다.

- 이메일/비밀번호, Google 로그인
- 할 일 추가·수정·완료·삭제 (삭제는 3초 안에 실행취소, `Ctrl/⌘+Z`)
- 우선순위·마감일·태그, 필터·검색·정렬 (필터는 사용자별로 저장)
- 실시간 동기화, 서버 응답을 기다리지 않고 바로 반영되는 화면(Firestore 로컬 캐시)
- 한국어/English, 라이트/다크 테마, 키보드·스크린리더 지원 (WCAG 2.2 AA, 색 대비 AAA)

## 기술 스택

| 영역   | 사용                                                                 |
| ------ | -------------------------------------------------------------------- |
| 화면   | React 19, React Router 8, Tailwind CSS 4, i18next                    |
| 빌드   | Vite 8 (Rolldown), TypeScript                                        |
| 백엔드 | Firebase Auth, Cloud Firestore, Firebase Hosting                     |
| 테스트 | Vitest + Testing Library, Firebase 에뮬레이터, Playwright + axe-core |
| CI/CD  | GitHub Actions                                                       |

## 시작하기

Node.js 22 이상이 필요합니다. 에뮬레이터를 쓰는 테스트는 Java 21도 필요합니다.

```bash
npm install
cp .env.example .env   # Firebase 콘솔 > 프로젝트 설정 > 내 앱의 SDK 구성값을 채운다
npm run dev            # http://localhost:5173
```

실제 프로젝트 대신 로컬 에뮬레이터로 개발하려면 `.env`에 `VITE_USE_EMULATORS=true`와
`VITE_FIREBASE_PROJECT_ID=demo-todoflow`를 넣고, 다른 터미널에서 에뮬레이터를 켭니다.

```bash
npx firebase emulators:start --only auth,firestore --project demo-todoflow
```

## 명령어

| 명령                                 | 내용                                                              |
| ------------------------------------ | ----------------------------------------------------------------- |
| `npm run dev` / `build` / `preview`  | 개발 서버 / 운영 빌드 / 빌드 결과 미리보기                        |
| `npm run lint` / `format`            | oxlint / Prettier                                                 |
| `npm test`                           | 단위·컴포넌트 테스트 (Firebase 모킹, 에뮬레이터 불필요)           |
| `npm run test:watch`                 | 위 테스트를 감시 모드로                                           |
| `npm run test:emulators`             | 통합 테스트(실제 앱 화면 + 에뮬레이터)와 보안 규칙 테스트         |
| `npm run test:coverage`              | 위 전부 + 커버리지 (`coverage/index.html`)                        |
| `npm run test:e2e`                   | Chrome으로 실제 사용 흐름 검사 (에뮬레이터, axe 접근성 검사 포함) |
| `BASE_URL=<주소> npm run test:smoke` | 배포된 주소 읽기 전용 점검                                        |

테스트는 `.env`를 쓰지 않습니다. `demo-` 프로젝트 설정으로 에뮬레이터에만 연결되므로 실제 데이터를 건드리지 않습니다.

## 배포 (GitHub Actions)

`.github/workflows/ci.yml`

```
PR / main push → 빌드 · 테스트 · E2E ─┬→ PR: 프리뷰 채널 배포(7일) → smoke 테스트, PR에 주소 댓글
                                      └→ main: 보안 규칙 + Hosting 배포 → smoke 테스트
```

- 운영 주소: https://todoflow-20d80.web.app
- 저장소 설정
  - Variables: `VITE_FIREBASE_*` 6개 (배포된 JS에 들어가는 공개 값)
  - Secrets: `FIREBASE_SERVICE_ACCOUNT_TODOFLOW_20D80` (배포용 서비스 계정 키)

## 폴더 구조

```
src/
  pages/        화면 (로그인, 할 일, 내 정보, 404) — 주소별로 나눠 필요할 때 내려받는다
  components/   화면 부품 (목록, 편집 모달, 필터, 토스트, 헤더 …)
  hooks/        Firestore 구독, 3초 실행취소, 필터 저장, 테마
  lib/          Firebase 연결, 데이터 변환, 필터·정렬, 날짜, 검증, i18n
  locales/      ko.json(기준), en.json
tests/
  integration/  실제 앱 + 에뮬레이터 시나리오
  e2e/          Playwright (app: 에뮬레이터, smoke: 배포 주소)
  firestore.rules.test.ts
firestore.rules 데이터 구조·권한 규칙 (users/{uid}/todos/{todoId})
```

처음 읽는다면 `src/App.tsx`(주소와 화면), `src/pages/TodoAppPage.tsx`(기능이 모이는 곳),
`firestore.rules`(데이터 모양과 권한) 순서를 권합니다.
