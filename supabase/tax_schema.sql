
-- 4. Tax Applications Table (Year-End Tax Adjustment)
create table public.tax_applications (
  id uuid default gen_random_uuid() primary key,
  type text check (type in ('personal', 'corporate')) not null,
  name text not null,
  phone text not null,
  email text not null,
  
  -- Personal only
  resident_id text, -- Resident Registration Number (Consider encryption in production)
  address text,
  
  -- Corporate only
  corporate_name text,
  business_license_url text, -- URL to file in storage
  
  status text default 'pending' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tax_applications enable row level security;

-- Policies for Tax Applications
create policy "Anyone can insert applications." on public.tax_applications
  for insert with check (true);

create policy "Only admins can view applications." on public.tax_applications
  for select using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
  
-- Note: Create storage bucket 'tax-documents' manually in Dashboard
