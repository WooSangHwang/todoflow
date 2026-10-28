🎸 **TodoFlow 프로젝트 전체 태스크 목록**

📊 **프로젝트 개요**

- 제품명: TodoFlow (React + Firebase To-Do 앱)
- 기간: 5주 (주차별 마일스톤)
- 기술스택: React, Vite, Firebase, Tailwind CSS
- 총 태스크: 12개 주요 태스크

---

🏗️ 1단계: 프로젝트 기반 설정 (1주차)

**1. 프로젝트 초기 설정**

- Vite + React + TypeScript 프로젝트 생성
- 폴더 구조 설계 (/src/pages, /components, /hooks, /stores)
- 기본 패키지 설치 및 설정

**2. 개발 환경 구축**

- Tailwind CSS 설치 및 설정
- ESLint + Prettier 규칙 설정
- Vite 빌드 설정 최적화

**3. Firebase 프로젝트 설정**

- Firebase 콘솔에서 새 프로젝트 생성
- Authentication 서비스 활성화
- Firestore Database 생성
- 환경 변수 (.env) 설정

---

🔐 2단계: 인증 시스템 구축 (1-2주차)

**4. React Router 및 기본 페이지 생성**

- React Router 설치 및 설정
- /signin - 로그인/회원가입 페이지
- /app - 메인 Todo 앱 페이지
- /account - 사용자 프로필 페이지
- 보호된 라우트 (PrivateRoute) 컴포넌트

**5. Firebase Authentication 구현**

- Google 로그인 기능 구현
- 이메일/패스워드 로그인 구현
- 회원가입 기능 구현
- 비밀번호 재설정 기능
- 로그아웃 기능
- 인증 상태 관리 (useAuth hook)

---

💾 3단계: 데이터 관리 시스템 (2주차)

**6. Firestore 데이터 모델 설계**

- 보안 규칙 (Security Rules) 작성
- 데이터 스키마 설계: users/{uid}/todos/{todoId}
- 인덱스 설정 (복합 인덱스 포함)
- 데이터 유효성 검증 로직

**7. Todo CRUD 기능 구현**

- 생성: 새 할일 추가 (title, description, priority, dueDate, tags)
- 읽기: 사용자별 할일 목록 조회
- 수정: 할일 내용 업데이트
- 삭제: 할일 삭제 (3초 실행취소 기능)
- 완료 토글: completed 상태 변경
- 실시간 동기화: onSnapshot으로 자동 업데이트

---

⚡ 4단계: 사용자 경험 향상 (3주차)

**8. 필터링 및 정렬 기능**

- 필터: 완료/미완료, 우선순위별, 태그별, 마감일별
- 정렬: 생성일, 수정일, 마감일, 우선순위 기준
- 검색: 제목/내용 텍스트 검색
- 필터 상태 저장 (로컬 스토리지)

**9. 반응형 UI 컴포넌트 구현**

- TodoItem: 개별 할일 카드 컴포넌트
- TodoEditor: 할일 생성/수정 폼
- Filters: 필터링 UI 컴포넌트
- 모바일 최적화: ≤640px 브레이크포인트
- 태블릿 대응: 641px~1024px
- 데스크톱 UI: >1024px
- 다크모드 지원 (선택사항)

---

🎨 5단계: 품질 및 접근성 (4주차)

**10. 접근성 (a11y) 구현**

- 키보드 탐색 지원 (Tab, Enter, Space, Arrow keys)
- ARIA 라벨 및 역할 설정
- 포커스 관리 및 시각적 표시
- 색상 대비 AAA 등급 달성
- 스크린 리더 지원

**11. 국제화 및 UX 개선**

- 한국어/영어 언어 지원
- 로딩 상태 표시
- 에러 상태 처리 및 사용자 친화적 메시지
- 빈 상태 (Empty State) UI
- 성능 최적화 (지연 로딩, 메모이제이션)

---

🧪 6단계: 테스트 및 배포 (5주차)

**12. 테스트 프레임워크 구축**

- Vitest 설정 및 기본 테스트
- @testing-library/react로 컴포넌트 테스트
- Firebase 에뮬레이터 테스트 환경
- 핵심 사용자 시나리오 5개 테스트:
  - 로그인/로그아웃
  - 할일 생성/완료
  - 필터링/정렬
  - 실시간 동기화
  - 권한 검증

**13. CI/CD 파이프라인 구축**

- GitHub Actions 워크플로우 설정
- 자동 린트/테스트 실행
- 빌드 자동화
- 테스트 커버리지 리포트

**14. Firebase Hosting 배포**

- 프로덕션 환경 설정
- dev/prod 환경 분리
- 도메인 설정 (선택사항)
- 성능 모니터링 설정

---

📈 추가 개선사항 (선택)

**15. 분석 및 모니터링**

- Firebase Analytics 이벤트 추가
- 에러 로깅 (Sentry 등)
- 성능 지표 수집

**16. 고급 기능**

- 오프라인 지원 강화
- PWA 기능 추가
- 리스트 가상화 (500개+ 할일)
- 데이터 내보내기/가져오기
