-- LGPD: consent timestamps and hard-delete purge schedule
-- Run in Supabase SQL editor with service role.

-- 1. Consent columns
alter table public.users
  add column if not exists consented_at timestamptz,
  add column if not exists icobra_ai_consented_at timestamptz;

-- 2. Update auth trigger to capture consented_at from signup metadata
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.users (id, email, full_name, consented_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    (new.raw_user_meta_data->>'consented_at')::timestamptz
  )
  on conflict (id) do nothing;
  return new;
end $$;

revoke execute on function public.handle_new_auth_user() from anon, authenticated, public;

-- 3. pg_cron: hard-delete users soft-deleted > 90 days ago
-- Requires pg_cron extension enabled in Supabase dashboard (Database > Extensions > pg_cron).
-- If pg_cron is not enabled, use the Vercel cron route /api/cron/purge-users instead.
do $$ begin
  perform cron.schedule(
    'lgpd-purge-deleted-users',
    '0 3 * * *', -- daily at 03:00 UTC
    $$
      delete from public.users
      where deleted_at is not null
        and deleted_at < now() - interval '90 days';
    $$
  );
exception when others then
  raise notice 'pg_cron not available — use Vercel cron instead: %', sqlerrm;
end $$;
