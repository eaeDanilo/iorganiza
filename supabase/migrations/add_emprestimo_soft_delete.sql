-- Soft delete para empréstimos: permite lixeira e recuperação.
alter table icobra.emprestimos
  add column if not exists deleted_at timestamptz;

create index if not exists emp_deleted_idx on icobra.emprestimos(deleted_at)
  where deleted_at is not null;
