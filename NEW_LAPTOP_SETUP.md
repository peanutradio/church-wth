# 새 노트북 개발 환경 설정 가이드

이 가이드는 새 노트북에서 교회 웹사이트 개발 환경을 설정하는 방법을 안내합니다.

## 📋 사전 준비사항

### 1. 필수 소프트웨어 설치

#### Node.js 설치
1. [Node.js 공식 웹사이트](https://nodejs.org/) 방문
2. LTS 버전 다운로드 및 설치 (현재 v18 이상 권장)
3. 설치 확인:
   ```bash
   node --version
   npm --version
   ```

#### Git 설치
1. [Git 공식 웹사이트](https://git-scm.com/) 방문
2. macOS용 Git 다운로드 및 설치
3. 설치 확인:
   ```bash
   git --version
   ```

#### Git 사용자 정보 설정
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 2. GitHub 계정 연결

#### SSH 키 생성 (권장)
```bash
# SSH 키 생성
ssh-keygen -t ed25519 -C "your.email@example.com"

# SSH 에이전트 시작
eval "$(ssh-agent -s)"

# SSH 키 추가
ssh-add ~/.ssh/id_ed25519

# 공개 키 복사 (GitHub에 등록)
cat ~/.ssh/id_ed25519.pub
```

GitHub 설정:
1. GitHub.com → Settings → SSH and GPG keys
2. "New SSH key" 클릭
3. 복사한 공개 키 붙여넣기

## 🚀 프로젝트 설정

### 1. 프로젝트 클론
```bash
# 원하는 디렉토리로 이동
cd ~/Documents

# 프로젝트 클론
git clone git@github.com:peanutradio/church-wth.git

# 프로젝트 디렉토리로 이동
cd church-wth
```

### 2. 의존성 패키지 설치
```bash
npm install
```

### 3. 환경 변수 파일 설정 ⚠️ **중요!**

`.env` 파일은 GitHub에 업로드되지 않으므로 **반드시 백업**해야 합니다!

#### 현재 노트북에서 백업
```bash
# .env 파일을 안전한 곳에 복사 (예: USB, 클라우드)
cp .env ~/Desktop/.env.backup
```

#### 새 노트북에서 설정
```bash
# .env.example을 .env로 복사
cp .env.example .env

# .env 파일 편집
nano .env
# 또는
code .env
```

`.env` 파일에 다음 정보를 입력:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# YouTube API
VITE_YOUTUBE_API_KEY=your_actual_youtube_api_key
VITE_YOUTUBE_PLAYLIST_SUNDAY=your_actual_sunday_playlist_id
VITE_YOUTUBE_PLAYLIST_MORNING=your_actual_morning_playlist_id

# Google Drive
VITE_GOOGLE_DRIVE_FOLDER_ID=your_actual_drive_folder_id

# YouTube Channel
VITE_YOUTUBE_CHANNEL_URL=https://www.youtube.com/@your_channel_name

# Google Analytics 4
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 4. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속하여 확인

## 📁 GitHub에 없는 파일 (백업 필수!)

다음 파일들은 `.gitignore`에 포함되어 GitHub에 업로드되지 않습니다:

### 1. `.env` 파일 ⚠️ **가장 중요!**
- **위치**: `/church-website/.env`
- **내용**: API 키, Supabase URL 등 민감한 정보
- **백업 방법**: 
  - USB 드라이브에 복사
  - 암호화된 클라우드 저장소 (1Password, LastPass 등)
  - 안전한 이메일로 자신에게 전송

### 2. `node_modules` 디렉토리
- **백업 불필요**: `npm install`로 자동 생성됨

### 3. `dist` 디렉토리
- **백업 불필요**: 빌드 시 자동 생성됨

## 🔐 중요한 정보 확인 방법

### 현재 노트북에서 확인할 정보

#### 1. Supabase 정보
```bash
# .env 파일에서 확인
cat .env | grep SUPABASE
```

또는 [Supabase Dashboard](https://supabase.com/dashboard)에서 확인:
- Project Settings → API → URL
- Project Settings → API → anon public key

#### 2. YouTube API 키
[Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

#### 3. Google Analytics ID
[Google Analytics](https://analytics.google.com/) → Admin → Data Streams

## 📝 추천 에디터 및 확장 프로그램

### VS Code (권장)
1. [VS Code 다운로드](https://code.visualstudio.com/)
2. 추천 확장 프로그램:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - ES7+ React/Redux/React-Native snippets

## ✅ 설정 완료 확인

다음 명령어들이 정상 작동하는지 확인:

```bash
# 개발 서버 실행
npm run dev

# 빌드 테스트
npm run build

# Git 상태 확인
git status
```

## 🆘 문제 해결

### npm install 오류
```bash
# npm 캐시 정리
npm cache clean --force

# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### Git 권한 오류
```bash
# SSH 연결 테스트
ssh -T git@github.com

# HTTPS 대신 SSH 사용하도록 변경
git remote set-url origin git@github.com:peanutradio/church-wth.git
```

## 📞 추가 도움이 필요하면

- GitHub Issues: 프로젝트 저장소에서 이슈 생성
- 관리자 문서: `ADMIN_HANDOVER_GUIDE.md` 참고

---

**마지막 업데이트**: 2025-12-18
