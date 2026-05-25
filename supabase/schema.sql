-- iOrganiza Hub schema. Run no SQL editor do Supabase.
-- Drop everything (cuidado em prod).
-- drop table if exists webhook_logs, payments, saas_integrations, subscriptions, saas, users cascade;

create extension if not exists "pgcrypto";

-- =========== TIPOS ENUM ===========
do $$ begin
  create type subscription_status as enum ('active', 'canceled', 'pending', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('stripe', 'kiwify', 'hotmart', 'kirvano', 'manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('succeeded', 'pending', 'failed', 'refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type saas_status as enum ('active', 'inactive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type webhook_provider as enum ('stripe', 'kiwify', 'hotmart', 'kirvano');
exception when duplicate_object then null; end $$;

do $$ begin
  create type webhook_status as enum ('success', 'failed', 'pending_retry');
exception when duplicate_object then null; end $$;

-- =========== USERS ===========
-- Linked to auth.users by id. Senha gerenciada pelo Supabase Auth.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email varchar(255) unique not null,
  full_name varchar(255),
  avatar_url text,
  is_admin boolean not null default false,
  is_super_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists users_email_idx on public.users(email);
create index if not exists users_is_admin_idx on public.users(is_admin);
create index if not exists users_is_super_admin_idx on public.users(is_super_admin);

-- =========== SAAS ===========
create table if not exists public.saas (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  slug varchar(255) unique not null,
  description text,
  logo_url text,
  banner_url text,
  price_monthly numeric(10,2) not null,
  features jsonb not null default '[]'::jsonb,
  status saas_status not null default 'active',
  stripe_product_id varchar(255),
  stripe_price_id varchar(255),
  external_url text,
  trial_enabled boolean not null default false,
  trial_max_uses integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists saas_slug_idx on public.saas(slug);
create index if not exists saas_status_idx on public.saas(status);

-- =========== SAAS PLANS ===========
-- Planos por produto (ex: Básico sem IA, Pro com IA).
create table if not exists public.saas_plans (
  id uuid primary key default gen_random_uuid(),
  saas_id uuid not null references public.saas(id) on delete cascade,
  name varchar(255) not null,
  slug varchar(100) not null,
  description text,
  price_monthly numeric(10,2) not null,
  features jsonb not null default '[]'::jsonb,
  stripe_price_id varchar(255),
  has_ai_chat boolean not null default false,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(saas_id, slug)
);
create index if not exists plans_saas_idx on public.saas_plans(saas_id);
create index if not exists plans_sort_idx on public.saas_plans(saas_id, sort_order);

-- =========== SUBSCRIPTIONS ===========
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  saas_id uuid not null references public.saas(id) on delete restrict,
  plan_id uuid references public.saas_plans(id) on delete set null,
  status subscription_status not null default 'pending',
  stripe_subscription_id varchar(255),
  stripe_customer_id varchar(255),
  kiwify_purchase_id varchar(255),
  hotmart_purchase_id varchar(255),
  kirvano_purchase_id varchar(255),
  price_paid numeric(10,2),
  payment_method payment_method not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, saas_id)
);
create index if not exists subs_user_idx on public.subscriptions(user_id);
create index if not exists subs_saas_idx on public.subscriptions(saas_id);
create index if not exists subs_status_idx on public.subscriptions(status);
create index if not exists subs_stripe_idx on public.subscriptions(stripe_subscription_id);

-- =========== SAAS INTEGRATIONS ===========
create table if not exists public.saas_integrations (
  id uuid primary key default gen_random_uuid(),
  source_saas_id uuid not null references public.saas(id) on delete cascade,
  target_saas_id uuid not null references public.saas(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_saas_id, target_saas_id, user_id),
  check (source_saas_id <> target_saas_id)
);
create index if not exists integ_user_idx on public.saas_integrations(user_id);

-- =========== PAYMENTS ===========
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  amount numeric(10,2) not null,
  currency varchar(3) not null default 'BRL',
  status payment_status not null default 'pending',
  payment_method payment_method not null,
  stripe_transaction_id varchar(255),
  external_transaction_id varchar(255),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists pay_user_idx on public.payments(user_id);
create index if not exists pay_sub_idx on public.payments(subscription_id);
create index if not exists pay_status_idx on public.payments(status);
create index if not exists pay_created_idx on public.payments(created_at desc);

-- =========== WEBHOOK LOGS ===========
create table if not exists public.webhook_logs (
  id uuid primary key default gen_random_uuid(),
  provider webhook_provider not null,
  event_type varchar(255),
  payload jsonb,
  status webhook_status not null default 'pending_retry',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists wh_provider_idx on public.webhook_logs(provider);
create index if not exists wh_status_idx on public.webhook_logs(status);
create index if not exists wh_created_idx on public.webhook_logs(created_at desc);

-- =========== TRIGGER updated_at ===========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin new.updated_at = now(); return new; end $$;

do $$ begin
  create trigger trg_users_updated before update on public.users
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_saas_updated before update on public.saas
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_plans_updated before update on public.saas_plans
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_subs_updated before update on public.subscriptions
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_integ_updated before update on public.saas_integrations
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;
do $$ begin
  create trigger trg_pay_updated before update on public.payments
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- =========== TRIGGER: bloquear self-escalation a admin ===========
-- Apenas service_role pode mudar is_admin (writes via admin API).
create or replace function public.prevent_admin_escalation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if (new.is_admin <> old.is_admin or new.is_super_admin <> old.is_super_admin)
     and auth.role() <> 'service_role' then
    raise exception 'cannot change admin roles via client';
  end if;
  return new;
end $$;

do $$ begin
  create trigger trg_users_no_escalation before update on public.users
    for each row execute function public.prevent_admin_escalation();
exception when duplicate_object then null; end $$;

-- =========== TRIGGER: sync auth.users -> public.users ===========
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

-- Revogar EXECUTE — só trigger interno deve invocar, nunca via RPC público.
revoke execute on function public.handle_new_auth_user() from anon, authenticated, public;

do $$ begin
  create trigger trg_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_auth_user();
exception when duplicate_object then null; end $$;

-- =========== ROW LEVEL SECURITY ===========
alter table public.users enable row level security;
alter table public.saas enable row level security;
alter table public.saas_plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.saas_integrations enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_logs enable row level security;

-- users: ler proprio registro. Admin acessa via service_role (bypassa RLS).
-- Importante: NUNCA referenciar public.users dentro da própria policy (recursão).
drop policy if exists users_self_read on public.users;
create policy users_self_read on public.users for select
  using (auth.uid() = id);
drop policy if exists users_self_update on public.users;
-- Usuario pode editar próprios dados, mas not promover-se a admin.
-- (writes que mudem is_admin precisam usar service role; client can't escalate)
create policy users_self_update on public.users for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- saas_plans: leitura publica (planos de produtos ativos). Admin gerencia via service_role.
drop policy if exists plans_public_read on public.saas_plans;
create policy plans_public_read on public.saas_plans for select using (true);

-- saas: leitura publica para status active. Admin gerencia.
drop policy if exists saas_public_read on public.saas;
create policy saas_public_read on public.saas for select
  using (status = 'active' or exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- subscriptions: usuario le proprias. Admin via service_role.
drop policy if exists subs_self_read on public.subscriptions;
create policy subs_self_read on public.subscriptions for select
  using (auth.uid() = user_id);

-- saas_integrations: usuario gerencia proprias.
drop policy if exists integ_self_all on public.saas_integrations;
create policy integ_self_all on public.saas_integrations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- payments: usuario le proprios. Admin via service_role.
drop policy if exists pay_self_read on public.payments;
create policy pay_self_read on public.payments for select
  using (auth.uid() = user_id);

-- webhook_logs: somente admin.
drop policy if exists wh_admin_read on public.webhook_logs;
create policy wh_admin_read on public.webhook_logs for select
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.is_admin));

-- =========== RATE LIMITS ===========
create table if not exists public.rate_limit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  endpoint text not null,
  created_at timestamptz not null default now()
);
create index if not exists rl_user_endpoint_time_idx
  on public.rate_limit_logs (user_id, endpoint, created_at);

alter table public.rate_limit_logs enable row level security;

-- check_rate_limit: retorna true se dentro do limite, false se excedido.
-- SECURITY DEFINER: executa como owner para bypass de RLS no insert.
create or replace function public.check_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_limit int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
begin
  select count(*) into v_count
  from rate_limit_logs
  where user_id = p_user_id
    and endpoint = p_endpoint
    and created_at >= now() - (p_window_seconds || ' seconds')::interval;

  if v_count >= p_limit then
    return false;
  end if;

  insert into rate_limit_logs (user_id, endpoint) values (p_user_id, p_endpoint);

  -- limpeza oportunística de logs antigos (mantém tabela enxuta)
  delete from rate_limit_logs
  where created_at < now() - interval '2 hours';

  return true;
end $$;

-- Somente service role pode chamar — clientes não têm acesso direto.
revoke execute on function public.check_rate_limit(uuid, text, integer, integer) from anon, authenticated;

-- =========== MIGRATION: aplicar em BD existente ===========
-- Se o banco já existia antes dos planos, rodar:
-- alter table public.subscriptions add column if not exists plan_id uuid references public.saas_plans(id) on delete set null;

-- =========== SEED OPCIONAL ===========
-- Inserir um SaaS de exemplo para teste.
-- insert into public.saas (name, slug, description, price_monthly, features, status)
-- values ('iCobra', 'icobra', 'CRM completo para gestao de contatos e vendas.', 49.00,
--   '["Contatos ilimitados","Pipeline de vendas","Automacoes","Relatorios"]'::jsonb, 'active');
