-- Sessões de execução de fluxo por contato/telefone
create table public.flow_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  flow_id         uuid not null references public.flows(id) on delete cascade,
  debtor_id       uuid references public.debtors(id) on delete set null,
  phone           text not null,
  current_node_id text not null,
  variables       jsonb not null default '{}',
  status          text not null default 'active'
                    check (status in ('active', 'completed', 'handed_off')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.flow_sessions enable row level security;

create policy "own sessions" on public.flow_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Apenas uma sessão ativa por tenant+telefone ao mesmo tempo
create unique index flow_sessions_active_phone_idx
  on public.flow_sessions(user_id, phone)
  where status = 'active';

create index flow_sessions_user_id_idx on public.flow_sessions(user_id);

create trigger flow_sessions_updated_at before update on public.flow_sessions
  for each row execute function public.set_updated_at();
