-- LGPD: adiciona soft delete em conferencias para suportar direito ao apagamento
ALTER TABLE imaleta.conferencias ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
