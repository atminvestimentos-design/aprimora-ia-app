create table public.business_profiles (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null unique references auth.users(id) on delete cascade,
  company_name      text,
  industry          text,
  stage             text,
  employees_count   text,
  sectors           jsonb,
  products          text,
  website_url       text,
  social_media      jsonb,
  automation_needs  jsonb,
  summary           text,
  raw_conversation  jsonb,
  status            text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "own profile" on public.business_profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index business_profiles_user_id_idx on public.business_profiles(user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger business_profiles_updated_at
  before update on public.business_profiles
  for each row execute function public.set_updated_at();
