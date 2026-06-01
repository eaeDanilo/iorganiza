-- Migration: criar tabela saas_plans e adicionar plan_id em subscriptions

-- Tabela de planos por produto
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

-- Adicionar plan_id em subscriptions (nullable — assinaturas antigas ficam sem plano)
alter table public.subscriptions
  add column if not exists plan_id uuid references public.saas_plans(id) on delete set null;

-- Trigger updated_at
do $$ begin
  create trigger trg_plans_updated before update on public.saas_plans
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- RLS
alter table public.saas_plans enable row level security;

drop policy if exists plans_public_read on public.saas_plans;
create policy plans_public_read on public.saas_plans for select using (true);
