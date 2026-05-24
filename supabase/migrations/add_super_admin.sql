-- Migration: add is_super_admin column and set initial super admin
-- Run this in Supabase SQL editor (with service role).

alter table public.users
  add column if not exists is_super_admin boolean not null default false;

create index if not exists users_is_super_admin_idx on public.users(is_super_admin);

-- Update trigger to also block is_super_admin self-escalation via client
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

-- Set initial super admin
update public.users
  set is_admin = true, is_super_admin = true
  where email = 'eaedanilo1@gmail.com';
