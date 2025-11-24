# We, the Church - 웹사이트 프로젝트

이 프로젝트는 React + Vite + Supabase로 구축된 교회 웹사이트입니다.

## 🚀 시작하기 (Getting Started)

이 프로젝트를 처음 다운로드받은 개발자를 위한 설정 가이드입니다.

### 1. 필수 요구사항
- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [Git](https://git-scm.com/)

### 2. 설치 (Installation)
터미널을 열고 프로젝트 폴더에서 다음 명령어를 실행하여 의존성 라이브러리를 설치합니다.

```bash
npm install
```

### 3. 환경 변수 설정 (Environment Setup)
이 프로젝트는 Supabase, YouTube API, Google Drive API와 연동되어 있어 **환경 변수 설정이 필수**입니다.

1. 프로젝트 루트에 있는 `.env.example` 파일을 복사하여 `.env` 파일을 생성합니다.
   ```bash
   cp .env.example .env
   ```
2. `.env` 파일을 열고, 관리자에게 전달받은 실제 API 키 값들을 입력합니다.

| 변수명 | 설명 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 익명(Anon) 키 |
| `VITE_YOUTUBE_API_KEY` | Google Cloud Console에서 발급받은 YouTube Data API 키 |
| `VITE_YOUTUBE_PLAYLIST_SUNDAY` | 주일예배 재생목록 ID |
| `VITE_YOUTUBE_PLAYLIST_MORNING` | 새벽예배 재생목록 ID |
| `VITE_GOOGLE_DRIVE_FOLDER_ID` | 주보 PDF가 저장된 구글 드라이브 폴더 ID |
| `VITE_YOUTUBE_CHANNEL_URL` | 교회 유튜브 채널 URL |

> **⚠️ 주의:** `.env` 파일은 보안상 Git에 업로드되지 않습니다. 반드시 로컬에서 직접 생성해야 합니다.

### 4. 실행 (Run)
개발 서버를 실행합니다.

```bash
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속하면 사이트를 볼 수 있습니다.

---

## 📂 프로젝트 구조

```
src/
├── components/      # 재사용 가능한 UI 컴포넌트
│   ├── layout/      # Header, Footer 등 레이아웃
│   ├── sections/    # 메인 페이지의 각 섹션 (예배, 장소 등)
│   └── admin/       # 관리자 페이지 전용 컴포넌트
├── pages/           # 페이지 단위 컴포넌트 (Home, Admin, Login 등)
├── lib/             # 라이브러리 설정 (supabaseClient.js 등)
└── App.jsx          # 메인 앱 컴포넌트 및 라우팅 설정
```

## 🛠 기술 스택
- **Frontend:** React, Vite, Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL, Auth)
- **Deployment:** Vercel

## 🤝 기여하기
1. `main` 브랜치에서 작업하지 않고, 새로운 브랜치를 따서 작업합니다.
2. 작업 완료 후 Pull Request를 생성합니다.
