-- ============================================================
-- 2026 위더처치 패밀리 캠프 참가 신청 테이블
-- 실행 방법: Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
-- ============================================================

create table if not exists public.camp_applications (
  id uuid default gen_random_uuid() primary key,

  -- 1. 신청자(대표자) 기본 정보
  name  text not null,
  phone text not null,

  -- 2. 참가 인원 및 동반 가족
  --    members 예시: [{"name":"홍길동","age_group":"adult"}, {"name":"홍아이","age_group":"elementary"}]
  total_count      integer not null default 1,
  members          jsonb   not null default '[]'::jsonb,
  adult_count      integer not null default 0,  -- 성인   30,000원
  youth_count      integer not null default 0,  -- 중고등 20,000원
  elementary_count integer not null default 0,  -- 초등   10,000원
  preschool_count  integer not null default 0,  -- 미취학 10,000원
  total_fee        integer not null default 0,  -- 자동 계산된 총 참가비

  -- 3. 교통편 및 이동
  transport     text    not null check (transport in ('car', 'public')),
  pickup_needed boolean not null default false, -- 가평역 픽업 요청

  -- 4. 안전 및 편의를 위한 사전 고지
  allergy text, -- 알레르기 / 특이 체질
  request text, -- 기타 요청 사항

  -- 5. 동의 및 처리 상태
  privacy_agreed boolean not null default false,
  payment_status text    not null default 'pending' check (payment_status in ('pending', 'paid')),
  status         text    not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists camp_applications_created_at_idx
  on public.camp_applications (created_at desc);

-- ── 보안 (RLS): 누구나 신청 가능 / 관리자만 조회·수정 ──
alter table public.camp_applications enable row level security;

drop policy if exists "Anyone can insert camp applications." on public.camp_applications;
create policy "Anyone can insert camp applications."
  on public.camp_applications for insert
  with check (true);

drop policy if exists "Only admins can view camp applications." on public.camp_applications;
create policy "Only admins can view camp applications."
  on public.camp_applications for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 관리자가 입금 확인(payment_status) 등을 변경하기 위한 정책
drop policy if exists "Only admins can update camp applications." on public.camp_applications;
create policy "Only admins can update camp applications."
  on public.camp_applications for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
