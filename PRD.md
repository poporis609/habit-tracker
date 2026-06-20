# PRD — AI 습관 트래커 (Habit Tracker)

## 1. 개요

| 항목 | 내용 |
|------|------|
| 제품명 | AI 습관 트래커 (Habit Tracker) |
| 한 줄 소개 | 매일의 습관·일기·기분을 기록하고, AI 코치가 동기를 부여하는 개인 생산성 웹앱 |
| 배포 URL | https://wonderful-mud-022954f00.7.azurestaticapps.net |
| 저장소 | https://github.com/poporis609/habit-tracker |
| 운영 비용 | $0 (전 구성 요소 무료 티어) |

## 2. 문제 정의 & 목표

- **문제**: 습관 형성은 꾸준함이 핵심이지만, 동기 부여와 회고가 부족해 중도 포기하기 쉽다.
- **목표**: 습관 체크 → 기록(일기·기분) → AI 회고/코칭의 선순환을 한 화면에서 제공해 지속 가능한 습관 형성을 돕는다.
- **타깃 사용자**: 자기계발·루틴 관리를 원하는 개인 사용자.

## 3. 핵심 기능

### 3.1 습관 관리 (오늘 탭)
- 습관 체크/해제, 연속 달성(스트릭 🔥) 카운트
- 이모지·색상으로 커스터마이즈된 습관 카드
- 하루 100% 달성 시 컨페티(축하 효과)

### 3.2 습관 추가 (+ 탭)
- 이모지 15종 / 색상 5종 선택, 실시간 미리보기

### 3.3 통계 (통계 탭)
- 오늘 달성률·최장 스트릭·총 완료 요약 카드
- 최근 7일 막대 차트
- **최근 12주 잔디 히트맵** (GitHub 스타일 기여도 시각화)
- **최근 7일 기분 추이** 그래프
- **AI 주간 리포트**: 한 주 습관·기분 데이터를 AI가 분석해 회고 + 다음 주 제안 생성

### 3.4 일기 (일기 탭)
- 날짜별 일기 작성·저장(로컬), 사이드바에서 과거 일기 열람
- **기분 트래커**: 5단계 기분(😄🙂😐😔😣) 기록
- **AI 확장 / AI 요약**: 일기 내용을 AI가 풍부하게 확장하거나 핵심 요약
- **음성 입력(STT)**: 말로 일기 작성 (Web Speech API)

### 3.5 AI 코치 (🤖 탭)
- 사용자의 습관·일기 데이터를 컨텍스트로 한 대화형 AI 코치
- 빠른 질문 버튼, 음성 입력 지원

## 4. 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, Vite 8, Tailwind CSS 4, Framer Motion, Lucide |
| AI | GitHub Models (`gpt-4o-mini`) + OpenAI SDK + `@copilot-extensions/preview-sdk` |
| 백엔드(API) | Azure Functions (Node.js v4 모델) — `/api/chat`, `/api/ai`, `/api/report` |
| 음성 | Web Speech API (브라우저 내장, `ko-KR`) |
| 데이터 | 브라우저 localStorage (습관·일기·기분) |
| 배포 | Azure Static Web Apps (Free) + GitHub Actions CI/CD |

## 5. AI 연동 구조

- 프론트엔드는 토큰을 절대 보유하지 않음 → API 요청만 전송
- 서버(Azure Functions)에서 `GITHUB_TOKEN` 환경변수로 GitHub Models 호출
- `@copilot-extensions/preview-sdk`로 Copilot 호환 이벤트(SSE) 포맷 생성

### API 엔드포인트
| 엔드포인트 | 용도 | 입력 | 출력 |
|-----------|------|------|------|
| `POST /api/chat` | AI 코치 대화 | `messages`, `habitContext` | `reply`, `events` |
| `POST /api/ai` | 일기 확장/요약 | `text`, `action` | `result` |
| `POST /api/report` | AI 주간 리포트 | `summary`, `moodSummary` | `result` |

## 6. 보안

- `GITHUB_TOKEN`은 `.env.local`(gitignore) 및 Azure 앱 설정에만 저장, 코드/빌드물/저장소에 노출 없음
- 토큰은 서버 측에서만 사용, 클라이언트 번들에 미포함

## 7. 비용 (전부 무료)

| 서비스 | 티어 | 비용 |
|--------|------|------|
| Azure Static Web Apps | Free | $0 |
| Azure Functions (내장) | 월 100만 요청 | $0 |
| GitHub Actions | 월 2,000분 | $0 |
| GitHub Models (gpt-4o-mini) | 무료 | $0 |

## 8. 향후 개선 아이디어

- 브라우저 푸시 리마인더 알림
- 목표 설정 & 달성 배지(게이미피케이션)
- 데이터 백업/복원(JSON 내보내기·가져오기)
