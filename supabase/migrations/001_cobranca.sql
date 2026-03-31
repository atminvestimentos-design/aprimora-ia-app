-- Execute no Supabase SQL Editor (https://supabase.com/dashboard/project/mptgrxfwzqiybrzqijdq/sql)

-- ─── tenant_whatsapp_config ───────────────────────────────────────────────────
create table if not exists tenant_whatsapp_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  evolution_api_url text,
  evolution_api_key text,
  evolution_instance text,
  meta_phone_number_id text,
  meta_access_token text,
  meta_waba_id text,
  provider text default 'EVOLUTION',
  is_connected boolean default false,
  connected_phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_twc_evolution_instance on tenant_whatsapp_config(evolution_instance);
create index if not exists idx_twc_meta_phone on tenant_whatsapp_config(meta_phone_number_id);

-- RLS: cada tenant acessa apenas seus próprios dados
alter table tenant_whatsapp_config enable row level security;
create policy "own config" on tenant_whatsapp_config for all using (user_id = auth.uid());

-- ─── debtors ─────────────────────────────────────────────────────────────────
create table if not exists debtors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  whatsapp_phone text,
  document text,
  debt_amount numeric,
  debt_description text,
  status text default 'ATIVO',
  notes text,
  last_contact_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_debtors_user on debtors(user_id);
create index if not exists idx_debtors_phone on debtors(user_id, whatsapp_phone);

alter table debtors enable row level security;
create policy "own debtors" on debtors for all using (user_id = auth.uid());

-- ─── debt_messages ────────────────────────────────────────────────────────────
create table if not exists debt_messages (
  id uuid primary key default gen_random_uuid(),
  debtor_id uuid references debtors(id) on delete cascade not null,
  user_id uuid references auth.users(id) not null,
  direction text not null,
  content text,
  status text default 'PENDING',
  media_type text,
  media_url text,
  whatsapp_message_id text unique,
  response_time_minutes numeric,
  created_at timestamptz default now()
);
create index if not exists idx_dm_debtor on debt_messages(debtor_id);
create index if not exists idx_dm_user on debt_messages(user_id, created_at desc);

alter table debt_messages enable row level security;
create policy "own messages" on debt_messages for all using (user_id = auth.uid());
