-- ============================================================
-- 2026 위더처치 패밀리 캠프 참가 신청 (참가자 1명 = 1행)
-- 실행: Supabase 대시보드 → SQL Editor → 붙여넣기 → Run
--
-- ⚠️ 기존 camp_applications 테이블과 데이터를 삭제하고 새로 만듭니다.
-- ============================================================

drop table if exists public.camp_applications cascade;

create table public.camp_applications (
  id uuid default gen_random_uuid() primary key,

  -- 같은 신청(한 가족)을 묶는 키. 관리자 페이지에서 가족 단위로 묶을 때 사용
  application_id uuid not null,

  -- 사람 정보
  applicant_name   text not null,  -- 신청자(대표자) 이름
  participant_name text not null,  -- 참가자 이름
  relation  text not null check (relation  in ('본인', '가족')),
  age_group text not null check (age_group in ('성인', '중고등', '초등', '미취학')),
  fee       integer not null default 0,

  -- 신청 정보 (같은 가족이면 행마다 동일하게 반복 저장 — 명부에서 바로 보이도록)
  phone     text not null,
  transport text not null check (transport in ('개인차량', '대중교통')),
  pickup_needed boolean not null default false,  -- 가평역 픽업 요청
  allergy text,   -- 알레르기 / 특이 체질
  request text,   -- 기타 요청 사항

  privacy_agreed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index camp_applications_application_id_idx on public.camp_applications (application_id);
create index camp_applications_created_at_idx     on public.camp_applications (created_at desc);

-- ── 보안 (RLS): 누구나 신청 가능 / 관리자만 조회 ──
alter table public.camp_applications enable row level security;

create policy "Anyone can insert camp applications."
  on public.camp_applications for insert
  with check (true);

create policy "Only admins can view camp applications."
  on public.camp_applications for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
