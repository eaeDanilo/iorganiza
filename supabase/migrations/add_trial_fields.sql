alter table public.subscriptions
  add column if not exists is_trial boolean not null default false,
  add column if not exists trial_uses_remaining integer not null default 0;

create index if not exists subs_trial_idx on public.subscriptions(is_trial) where is_trial = true;
