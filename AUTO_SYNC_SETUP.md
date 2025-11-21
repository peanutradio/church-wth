# Church Website - Auto Sync Setup Guide

이 가이드는 자동 동기화 설정 방법을 안내합니다.

## 1. GitHub 저장소 생성

1. [GitHub](https://github.com)에 로그인
2. 새 저장소 생성 (public 또는 private)
3. 저장소 이름: `church-website` (원하는 이름으로 변경 가능)

## 2. 프로젝트 업로드

```bash
cd /Users/lsports_chan/church-website

# Git 초기화
git init
git add .
git commit -m "Initial commit with auto-sync setup"

# GitHub 저장소 연결 (아래 URL을 본인의 저장소 URL로 변경)
git remote add origin https://github.com/YOUR_USERNAME/church-website.git
git branch -M main
git push -u origin main
```

## 3. Supabase Edge Functions 배포

### Supabase CLI 설치 (아직 설치 안 했다면)
```bash
brew install supabase/tap/supabase
```

### Supabase 프로젝트 연결 및 배포
```bash
cd /Users/lsports_chan/church-website

# Supabase 로그인
supabase login

# 프로젝트 연결 (Supabase 대시보드에서 Project Reference ID 복사)
supabase link --project-ref YOUR_PROJECT_REF

# Edge Functions 배포
supabase functions deploy sync-youtube
supabase functions deploy sync-drive
```

### 환경 변수 설정
```bash
# YouTube sync function에 환경 변수 설정
supabase secrets set YOUTUBE_API_KEY=YOUR_API_KEY
supabase secrets set YOUTUBE_PLAYLIST_SUNDAY=YOUR_SUNDAY_PLAYLIST_ID
supabase secrets set YOUTUBE_PLAYLIST_MORNING=YOUR_MORNING_PLAYLIST_ID

# Google Drive sync function에 환경 변수 설정
supabase secrets set GOOGLE_API_KEY=YOUR_GOOGLE_API_KEY
supabase secrets set GOOGLE_DRIVE_FOLDER_ID=YOUR_FOLDER_ID
```

## 4. GitHub Secrets 설정

GitHub 저장소 페이지에서:
1. Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 secrets 추가:

| Name | Value | 설명 |
|------|-------|------|
| `SUPABASE_URL` | https://xxxxx.supabase.co | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGc... | Supabase Service Role Key (⚠️ 절대 공개 금지) |

**Service Role Key 찾는 방법:**
- Supabase 대시보드 → Settings → API → Service Role Key (secret)

## 5. 테스트

### 수동으로 워크플로우 실행
1. GitHub 저장소 → Actions 탭
2. "Daily Content Sync" 워크플로우 선택
3. "Run workflow" 클릭

### 동기화 확인
- Supabase 대시보드에서 `posts_sermons` 및 `posts_news` 테이블 확인

## 6. 자동 실행 스케줄

이제 모든 설정이 완료되었습니다!
- **오전 6:05 (KST)**: YouTube 영상 및 구글 드라이브 주보 자동 동기화
- **오후 8:00 (KST)**: YouTube 영상 및 구글 드라이브 주보 자동 동기화

수동 동기화 버튼도 여전히 `/admin` 페이지에서 사용 가능합니다.

## 문제 해결

### Edge Function 호출 실패
- Supabase 대시보드 → Functions → Logs에서 에러 확인
- 환경 변수가 올바르게 설정되었는지 확인

### GitHub Actions 실패
- GitHub 저장소 → Actions → 실패한 워크플로우 클릭
- 로그 확인 및 Secrets 설정 재확인

## 참고

- Edge Functions는 Deno 런타임을 사용합니다
- GitHub Actions는 무료 플랜에서 월 2,000분 제공
- Supabase Edge Functions는 무료 플랜에서 월 500K 호출 제공
