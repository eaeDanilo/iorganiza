-- iCobra — schema icobra dentro do projeto único iOrganiza.
-- Rodar inteiro no SQL Editor do projeto iOrganiza.

-- Expõe o schema icobra via PostgREST (equivale ao Dashboard → API → Exposed schemas)
alter role authenticator set pgrst.db_schemas = 'public, icobra';
notify pgrst, 'reload config';

create schema if not exists icobra;

grant usage on schema icobra to authenticated, service_role, anon;
grant select, insert, update, delete on all tables in schema icobra to authenticated;
grant all on all tables in schema icobra to service_role;
grant all on all sequences in schema icobra to service_role;

alter default privileges in schema icobra
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema icobra
  grant all on tables to service_role;
alter default privileges in schema icobra
  grant all on sequences to service_role;

-- =========== ENUMS ===========
do $$ begin
  create type icobra.tipo_retorno as enum ('valor_fixo', 'percentual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type icobra.frequencia as enum ('diario', 'semanal', 'mensal');
exception when duplicate_object then null; end $$;

do $$ begin
  create type icobra.dias_pagamento as enum ('todos_dias', 'dias_uteis');
exception when duplicate_object then null; end $$;

do $$ begin
  create type icobra.emprestimo_status as enum ('ativo', 'quitado');
exception when duplicate_object then null; end $$;

do $$ begin
  create type icobra.parcela_status as enum ('pendente', 'pago', 'atrasado');
exception when duplicate_object then null; end $$;

-- =========== EMPRESTIMOS ===========
create table if not exists icobra.emprestimos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  nome_pessoa text not null,
  valor_emprestado numeric(12,2) not null,
  tipo_retorno icobra.tipo_retorno not null,
  percentual numeric(6,2),
  frequencia icobra.frequencia not null,
  numero_parcelas integer not null check (numero_parcelas > 0),
  data_primeiro_pagamento date not null,
  dias_pagamento icobra.dias_pagamento not null,
  valor_parcela numeric(12,2) not null,
  total_a_receber numeric(12,2) not null,
  lucro numeric(12,2) not null,
  status icobra.emprestimo_status not null default 'ativo',
  created_at timestamptz not null default now()
);
create index if not exists emp_user_idx on icobra.emprestimos(user_id);
create index if not exists emp_status_idx on icobra.emprestimos(status);

-- =========== PARCELAS ===========
create table if not exists icobra.parcelas (
  id uuid primary key default gen_random_uuid(),
  emprestimo_id uuid not null references icobra.emprestimos(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  numero integer not null,
  data_vencimento date not null,
  data_pagamento date,
  valor numeric(12,2) not null,
  status icobra.parcela_status not null default 'pendente',
  created_at timestamptz not null default now(),
  unique(emprestimo_id, numero)
);
create index if not exists parc_emp_idx on icobra.parcelas(emprestimo_id);
create index if not exists parc_user_idx on icobra.parcelas(user_id);
create index if not exists parc_venc_idx on icobra.parcelas(data_vencimento);

-- =========== ROW LEVEL SECURITY ===========
alter table icobra.emprestimos enable row level security;
alter table icobra.parcelas enable row level security;

-- Helper: verifica assinatura ativa do iCobra para o usuário autenticado.
-- SECURITY DEFINER para acessar public.subscriptions mesmo com RLS ativa.
create or replace function icobra.has_active_subscription(p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public, icobra, pg_temp
stable
as $$
  select exists (
    select 1
    from public.subscriptions s
    join public.saas sa on sa.id = s.saas_id
    where s.user_id = p_user_id
      and sa.slug = 'icobra'
      and s.status = 'active'
  )
$$;

revoke execute on function icobra.has_active_subscription(uuid) from anon, public;
grant execute on function icobra.has_active_subscription(uuid) to authenticated, service_role;

drop policy if exists emp_subscriber on icobra.emprestimos;
create policy emp_subscriber on icobra.emprestimos for all
  using (
    auth.uid() = user_id
    and icobra.has_active_subscription(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and icobra.has_active_subscription(auth.uid())
  );

drop policy if exists parc_subscriber on icobra.parcelas;
create policy parc_subscriber on icobra.parcelas for all
  using (
    auth.uid() = user_id
    and icobra.has_active_subscription(auth.uid())
  )
  with check (
    auth.uid() = user_id
    and icobra.has_active_subscription(auth.uid())
  );

-- =========== SEED: iCobra na tabela saas ===========
-- insert into public.saas (name, slug, description, price_monthly, features, status)
-- values (
--   'iCobra',
--   'icobra',
--   'Controle completo de empréstimos e cobranças com assistente de IA.',
--   49.00,
--   '["Empréstimos ilimitados","Controle de parcelas","Inadimplência em destaque","Assistente IA","5 empréstimos grátis"]'::jsonb,
--   'active'
-- );
