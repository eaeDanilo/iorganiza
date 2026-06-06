update public.saas
set trial_enabled  = true,
    trial_max_uses = 3,
    updated_at     = now()
where slug in ('icobra', 'imaleta')
  and deleted_at is null;
