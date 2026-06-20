# 🌱 Groo · AI 습관 트래커

> 매일의 **습관·일기·기분**을 기록하고, **AI 코치**가 회고와 동기를 부여하는 개인 생산성 웹앱

[![Live Demo](https://img.shields.io/badge/Live-Demo-8b5cf6?style=flat-square)](https://wonderful-mud-022954f00.7.azurestaticapps.net)
[![Azure](https://img.shields.io/badge/Azure-Static_Web_Apps-0078d4?style=flat-square&logo=microsoftazure)](https://wonderful-mud-022954f00.7.azurestaticapps.net)
[![Cost](https://img.shields.io/badge/Cost-%240%20Free%20Tier-22c55e?style=flat-square)](#-비용-전부-무료)

**🔗 배포 주소:** https://wonderful-mud-022954f00.7.azurestaticapps.net

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| ✅ **습관 관리** | 체크/해제, 연속 달성(스트릭 🔥), 100% 달성 시 컨페티 |
| ➕ **습관 추가** | 이모지 15종 · 색상 5종, 실시간 미리보기 |
| 📊 **통계 대시보드** | 달성률·스트릭 요약, 7일 차트, **12주 잔디 히트맵**, 기분 추이 |
| 📔 **일기 + 기분** | 날짜별 일기 저장, 5단계 기분 기록 |
| 🤖 **AI 코치** | 내 습관·일기 데이터를 기반으로 대화하는 생산성 코치 |
| 🪄 **AI 일기 도우미** | 일기를 AI가 풍부하게 **확장**하거나 핵심만 **요약** |
| 📈 **AI 주간 리포트** | 한 주 데이터를 분석해 회고 + 다음 주 제안 자동 생성 |
| 🎤 **음성 입력(STT)** | 말로 일기·질문 작성 (브라우저 내장 Web Speech API) |

---

## 🧠 AI 연동

- **모델:** GitHub Models의 `gpt-4o-mini` (무료)
- **SDK:** `openai` SDK + `@copilot-extensions/preview-sdk` (Copilot 호환 이벤트 포맷)
- **보안 구조:** 토큰은 **서버(Azure Functions)에서만** 사용 — 클라이언트 번들·저장소에 노출 없음

### API 엔드포인트
| 엔드포인트 | 용도 |
|-----------|------|
| `POST /api/chat` | AI 코치 대화 |
| `POST /api/ai` | 일기 확장 / 요약 |
| `POST /api/report` | AI 주간 리포트 |

---

## 🛠 기술 스택

- **프론트엔드:** React 19 · Vite 8 · Tailwind CSS 4 · Framer Motion · Lucide
- **백엔드(API):** Azure Functions (Node.js v4 모델)
- **AI:** GitHub Models (`gpt-4o-mini`) · OpenAI SDK · Copilot Extensions SDK
- **음성:** Web Speech API (`ko-KR`)
- **데이터:** 브라우저 localStorage
- **배포:** Azure Static Web Apps (Free) + GitHub Actions CI/CD

---

## 🚀 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local)
echo "GITHUB_TOKEN=ghp_여기에_본인_토큰" > .env.local

# 3. 개발 서버 실행
npm run dev   # http://localhost:5173
```

> `GITHUB_TOKEN`은 https://github.com/settings/tokens 에서 발급 (권한 불필요).
> 토큰이 없으면 데모 응답으로 동작합니다.

### 빌드

```bash
npm run build   # dist/ 생성
```

---

## 💰 비용 (전부 무료)

| 서비스 | 티어 | 비용 |
|--------|------|------|
| Azure Static Web Apps | Free | **$0** |
| Azure Functions (내장) | 월 100만 요청 | **$0** |
| GitHub Actions | 월 2,000분 | **$0** |
| GitHub Models (`gpt-4o-mini`) | 무료 | **$0** |

---

## 📂 프로젝트 구조

```
habit-tracker/
├── api/                        # Azure Functions (서버리스 API)
│   ├── host.json
│   └── src/functions/
│       ├── chat.js             # AI 코치
│       ├── ai.js               # 일기 확장/요약
│       └── report.js           # AI 주간 리포트
├── src/
│   ├── components/             # Header, HabitList, AddHabit, Stats, Journal, Coach
│   ├── hooks/useVoiceInput.js  # 음성 입력 훅
│   ├── App.jsx
│   └── index.css
├── staticwebapp.config.json    # SWA 라우팅
├── vite.config.js              # Vite + 로컬 API 미들웨어
├── PRD.md                      # 제품 요구사항 문서
└── README.md
```

---

## 📋 문서

- 제품 상세 기획은 [PRD.md](./PRD.md) 참고

