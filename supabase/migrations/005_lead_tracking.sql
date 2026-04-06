-- Lead tracking tables
create table public.lead_tracked_urls (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  url         text not null,
  label       text,
  created_at  timestamptz not null default now()
);

alter table public.lead_tracked_urls enable row level security;

create policy "own tracked urls" on public.lead_tracked_urls
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index lead_tracked_urls_user_id_idx on public.lead_tracked_urls(user_id);

-- Lead visitors table
create table public.lead_visitors (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  tracked_url_id  uuid not null references public.lead_tracked_urls(id) on delete cascade,
  url_visited     text,
  ip              text,
  country         text,
  city            text,
  device          text,
  browser         text,
  os              text,
  referrer        text,
  duration_seconds int,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  created_at      timestamptz not null default now()
);

alter table public.lead_visitors enable row level security;

-- RLS: Users can only read their own visitors
create policy "read own visitors" on public.lead_visitors
  for select
  using (auth.uid() = user_id);

-- RLS: Service key can insert (for tracking endpoint)
create policy "service insert visitors" on public.lead_visitors
  for insert
  with check (true);

create index lead_visitors_user_id_idx on public.lead_visitors(user_id);
create index lead_visitors_tracked_url_id_idx on public.lead_visitors(tracked_url_id);
create index lead_visitors_created_at_idx on public.lead_visitors(created_at desc);
