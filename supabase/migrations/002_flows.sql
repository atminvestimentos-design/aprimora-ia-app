create table public.flows (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null default 'Novo Fluxo',
  description text,
  nodes       jsonb not null default '[]'::jsonb,
  edges       jsonb not null default '[]'::jsonb,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.flows enable row level security;

create policy "own flows"
  on public.flows for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index flows_user_id_idx on public.flows(user_id);

-- set_updated_at function may already exist from 001_cobranca.sql; use create or replace
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger flows_updated_at
  before update on public.flows
  for each row execute function public.set_updated_at();
