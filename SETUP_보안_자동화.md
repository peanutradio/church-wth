# 위더처치 — 보안 강화 & 자동화 설정 가이드

이 문서는 코드 수정 이후 **관리자가 직접 해야 하는 설정 작업**을 순서대로 안내합니다.
코드는 이미 수정되어 있고, 아래 설정을 마쳐야 실제로 동작합니다.

> 💡 막히는 단계가 있으면 그 단계 번호를 알려주세요. 함께 진행해 드립니다.

---

## ✅ 전체 체크리스트

- [ ] 1. 유출된 구글/유튜브 API 키 **폐기 후 재발급** + 사용 제한
- [ ] 2. 회원정보 보호 SQL 실행 (`fix_profiles_privacy.sql`)
- [ ] 3. 주민번호 암호화 설정 (Vault 키 + `secure_tax_resident_id.sql`)
- [ ] 4. 사업자등록증 버킷을 **비공개(private)** 로 전환
- [ ] 5. 자동화 함수 재배포 + 비밀키 등록
- [ ] 6. 새 코드 빌드 & 배포
- [ ] 7. 동작 테스트

---

## 1. 🔴 (가장 급함) 구글/유튜브 API 키 재발급

기존 키(`AIzaSyC0lJS...`)는 GitHub과 배포된 사이트 파일에 노출되어 **이미 외부에 알려진 상태**입니다. 반드시 교체하세요.

1. [Google Cloud Console → 사용자 인증 정보](https://console.cloud.google.com/apis/credentials) 접속
2. 기존 API 키 **삭제(또는 비활성화)**
3. **사용자 인증 정보 만들기 → API 키** 로 새 키 발급
4. 새 키를 클릭 → **키 제한** 설정 (중요!)
   - **애플리케이션 제한**: HTTP 리퍼러 → `https://www.wethechurch.or.kr/*` 추가
   - **API 제한**: `YouTube Data API v3`, `Google Drive API` 만 선택
5. 새 키를 아래 3곳에 모두 반영
   - 로컬 `.env` 파일의 `VITE_YOUTUBE_API_KEY`
   - Supabase Edge Function 비밀키 `YOUTUBE_API_KEY` (아래 5번 참고)
   - (드라이브용으로 별도 키를 쓴다면 `GOOGLE_API_KEY` 도)

> ℹ️ 참고: `VITE_` 로 시작하는 키는 웹사이트 특성상 브라우저에 포함될 수밖에 없습니다.
> 그래서 위 **4단계의 "키 제한"이 핵심 방어선**입니다. 꼭 설정하세요.

---

## 2. 🔴 회원정보 보호 (누구나 이메일 조회 가능 문제 차단)

Supabase 대시보드 → **SQL Editor** → New query 에
`supabase/migrations/fix_profiles_privacy.sql` 파일 내용을 붙여넣고 **RUN**.

→ 이제 회원 목록은 **본인 또는 관리자만** 조회할 수 있습니다.

---

## 3. 🔴 주민등록번호 암호화 저장

### 3-1. 암호화 키 등록 (Vault)
Supabase 대시보드 → **Project Settings → Vault → New secret**
- **Name**: `tax_encryption_key`
- **Secret**: 영문+숫자 섞인 **32자 이상 무작위 문자열** (예: 비밀번호 생성기 사용)
- ⚠️ 이 키를 **안전한 곳에 백업**하세요. 분실하면 기존 주민번호를 복호화할 수 없습니다.

### 3-2. 암호화 함수 설치
SQL Editor 에 `supabase/migrations/secure_tax_resident_id.sql` 내용을 붙여넣고 **RUN**.

→ 이제 신청서의 주민번호는 **서버에서 암호화되어 저장**되고,
   관리자 페이지의 **"연말정산 관리" 탭**에서 복호화하여 볼 수 있습니다.

### 3-3. (해당 시) 기존 신청 데이터 암호화
이미 접수된 신청건(평문 주민번호)이 있다면, `secure_tax_resident_id.sql` 맨 아래
주석 처리된 `do $$ ... $$` 블록을 **딱 한 번만** 실행해 일괄 암호화하세요.
(실행 전 테이블 백업 권장. 두 번 실행하면 이중 암호화되니 주의)

---

## 4. 🔴 사업자등록증 비공개 전환

Supabase 대시보드 → **Storage → tax-documents 버킷**
1. 버킷 설정에서 **Public 끄기** (Private 으로)
2. **Policies** 에서 아래 두 정책 추가 (SQL Editor 에서 실행해도 됩니다):

```sql
-- 누구나 신청 시 업로드 가능
create policy "anyone can upload tax docs"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'tax-documents');

-- 관리자만 열람 가능
create policy "admins can read tax docs"
  on storage.objects for select
  using (bucket_id = 'tax-documents' and public.is_admin());
```

> `news-images` 버킷(주보/소식 이미지)은 **계속 Public** 으로 두세요. 홈페이지에 보여줘야 합니다.

---

## 5. ⚙️ 자동화 (유튜브 매일 6:05 / 주보 일요일 12:00)

### 5-1. Edge Function 재배포
수정된 함수를 Supabase에 다시 올립니다. (터미널에서)

```bash
cd church-wth
supabase functions deploy sync-youtube
supabase functions deploy sync-drive
```

### 5-2. Edge Function 비밀키 등록
```bash
supabase secrets set YOUTUBE_API_KEY=새로_발급한_키
supabase secrets set YOUTUBE_PLAYLIST_SUNDAY=주일설교_재생목록ID
supabase secrets set YOUTUBE_PLAYLIST_MORNING=새벽설교_재생목록ID
supabase secrets set GOOGLE_DRIVE_FOLDER_ID=주보_드라이브_폴더ID
# (드라이브용 키가 따로면) supabase secrets set GOOGLE_API_KEY=...
```
> 재생목록 ID / 폴더 ID 는 로컬 `.env` 의 `VITE_...` 값과 동일합니다.

### 5-3. GitHub 비밀키 등록
GitHub 저장소(`peanutradio/church-wth`) → **Settings → Secrets and variables → Actions** 에서:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://<프로젝트>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role 키 (⚠️ 절대 공개 금지) |

### 5-4. 동작 확인 (수동 실행)
GitHub 저장소 → **Actions → Auto Content Sync → Run workflow** 클릭 →
초록색 체크가 뜨면 성공. 사이트 "말씀/교회소식" 에 반영됐는지 확인하세요.

이후 자동 실행 스케줄:
- **유튜브**: 매일 오전 **06:05** (KST)
- **주보**: 매주 일요일 낮 **12:00** (KST)

> ⏱️ GitHub Actions 스케줄은 서버 사정으로 몇 분~수십 분 늦을 수 있습니다(정상).
> 또한 저장소에 60일간 커밋이 없으면 스케줄이 자동 중지되니, 가끔 코드 갱신이 있으면 좋습니다.

---

## 6. 새 코드 빌드 & 배포

위 설정(특히 2~4번 SQL)을 **먼저** 마친 뒤 새 코드를 배포하세요.
(설정 전에 코드만 배포하면 신청 폼이 일시적으로 동작하지 않을 수 있습니다.)

```bash
cd church-wth
npm run build
```
→ Vercel 등 호스팅에 배포 (기존 배포 방식과 동일).

---

## 7. 동작 테스트

- [ ] 로그아웃 상태에서 회원 이메일이 조회되지 않는지
- [ ] 연말정산 신청 → 관리자 "연말정산 관리" 탭에서 복호화 열람 되는지
- [ ] 사업자등록증 "파일 보기"가 관리자에게만 열리는지
- [ ] GitHub Actions 수동 실행 → 영상/주보 동기화 확인

---

## 📌 추가로 개선하면 좋은 것 (선택 사항)

- 관리자 권한 확인 코드가 여러 화면에 중복 → 공통 함수로 정리 (동작 검증 필요해 별도 진행 권장)
- 자바스크립트 번들 용량이 큼(엑셀 라이브러리) → 페이지별 코드 분할로 첫 로딩 속도 개선 가능
- 현재 Node.js 22.2.0 → Vite 권장 버전(22.12+)으로 업그레이드 권장
