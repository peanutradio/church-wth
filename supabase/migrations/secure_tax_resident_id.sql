-- =============================================================================
-- 연말정산 신청서 보안: 주민등록번호 서버측 암호화 저장
-- =============================================================================
-- 배경: 기존에는 클라이언트가 tax_applications 테이블에 주민번호를 "평문"으로
--       직접 insert 했습니다. 본 마이그레이션은 주민번호를 서버(DB)에서 암호화하여
--       저장하고, 관리자만 복호화해 열람할 수 있도록 바꿉니다.
--
-- ▶ 실행 전 준비 (Supabase 대시보드에서 1번만):
--   1) Project Settings → Vault → "New secret" 클릭 후 아래 한 건 등록
--        Name   : tax_encryption_key
--        Secret : (영문/숫자 섞인 32자 이상 무작위 문자열 — 안전한 곳에 백업)
--   2) 이 파일 전체를 SQL Editor 에 붙여넣고 RUN
--
-- ※ Vault 키를 분실하면 기존 암호문은 복호화할 수 없으니 반드시 백업하세요.
-- =============================================================================

-- 암호화 함수(pgp_sym_encrypt 등)를 제공하는 확장
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- 1) 신청서 제출: 주민번호를 서버에서 암호화하여 저장 (익명 사용자도 호출 가능)
-- -----------------------------------------------------------------------------
create or replace function public.submit_tax_application(
  p_type                 text,
  p_name                 text,
  p_phone                text,
  p_email                text,
  p_resident_id          text default null,
  p_address              text default null,
  p_corporate_name       text default null,
  p_business_license_url text default null
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  if p_type not in ('personal', 'corporate') then
    raise exception 'invalid application type';
  end if;

  -- Vault 에서 암호화 키 읽기
  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'tax_encryption_key'
  limit 1;

  if v_key is null then
    raise exception 'encryption key (tax_encryption_key) is not configured in Vault';
  end if;

  insert into public.tax_applications (
    type, name, phone, email,
    resident_id, address, corporate_name, business_license_url, privacy_agreed
  ) values (
    p_type, p_name, p_phone, p_email,
    case
      when p_resident_id is not null and length(p_resident_id) > 0
        then encode(pgp_sym_encrypt(p_resident_id, v_key), 'base64')  -- 암호문(base64) 저장
      else null
    end,
    p_address, p_corporate_name, p_business_license_url, true
  );
end;
$$;

-- 폼은 비로그인 상태에서도 제출되므로 anon 에게 실행 권한 부여
revoke all on function public.submit_tax_application(text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_tax_application(text,text,text,text,text,text,text,text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 2) 관리자 전용: 주민번호를 복호화하여 신청 목록 조회
-- -----------------------------------------------------------------------------
create or replace function public.get_tax_applications()
returns table (
  id                   uuid,
  type                 text,
  name                 text,
  phone                text,
  email                text,
  resident_id          text,   -- 복호화된 평문 (관리자에게만 반환)
  address              text,
  corporate_name       text,
  business_license_url text,
  status               text,
  created_at           timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_key text;
begin
  -- 관리자 권한 확인
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  ) then
    raise exception 'unauthorized: admin only';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'tax_encryption_key'
  limit 1;

  return query
  select
    t.id, t.type, t.name, t.phone, t.email,
    case
      when t.resident_id is not null and v_key is not null
        then pgp_sym_decrypt(decode(t.resident_id, 'base64'), v_key)
      else null
    end,
    t.address, t.corporate_name, t.business_license_url, t.status, t.created_at
  from public.tax_applications t
  order by t.created_at desc;
end;
$$;

revoke all on function public.get_tax_applications() from public, anon;
grant execute on function public.get_tax_applications() to authenticated;

-- =============================================================================
-- (선택) 이미 평문으로 저장된 기존 신청건이 있다면, 아래를 "딱 한 번만" 실행해
--        평문을 암호문으로 일괄 전환하세요. 두 번 실행하면 이중 암호화되니 주의!
--        실행 전 tax_applications 백업을 권장합니다.
-- =============================================================================
-- do $$
-- declare v_key text;
-- begin
--   select decrypted_secret into v_key from vault.decrypted_secrets where name='tax_encryption_key' limit 1;
--   update public.tax_applications
--   set resident_id = encode(pgp_sym_encrypt(resident_id, v_key), 'base64')
--   where resident_id is not null
--     and resident_id ~ '^[0-9]{6}-?[0-9]{7}$';  -- 평문(주민번호 형식)인 행만
-- end $$;
