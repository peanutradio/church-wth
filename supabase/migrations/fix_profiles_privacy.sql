-- =============================================================================
-- 회원정보(profiles) 접근 권한 강화
-- =============================================================================
-- 문제: 기존 정책 "Public profiles are viewable by everyone" 때문에
--       로그인하지 않은 사람도 모든 회원의 이름/이메일을 조회할 수 있었습니다.
-- 변경: 본인 프로필 또는 관리자만 조회할 수 있도록 제한합니다.
--
-- 이 파일 전체를 Supabase SQL Editor 에 붙여넣고 RUN 하세요.
-- =============================================================================

-- 관리자 여부 확인 함수 (SECURITY DEFINER 로 RLS 무한재귀 방지)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- 기존의 "전체 공개" 조회 정책 제거
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;

-- 본인 프로필은 본인이 조회 가능
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 관리자는 모든 프로필 조회 가능 (회원 관리/통계 화면용)
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles
  for select
  using (public.is_admin());

-- 참고: insert/update 정책은 기존 설정을 그대로 둡니다.
--       (본인 프로필 생성/수정 정책은 supabase_schema.sql 에 정의되어 있음)
