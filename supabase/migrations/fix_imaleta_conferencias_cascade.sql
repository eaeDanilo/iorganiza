-- LGPD Fix: imaleta.conferencias e maleta_items não tinham ON DELETE CASCADE em auth.users.
-- Sem isso, dados de conferências permaneciam no banco após exclusão do usuário (violação LGPD Art. 18, IV).

-- 1. Recriar FK de conferencias.user_id com ON DELETE CASCADE
ALTER TABLE imaleta.conferencias
  DROP CONSTRAINT IF EXISTS conferencias_user_id_fkey;

ALTER TABLE imaleta.conferencias
  ADD CONSTRAINT conferencias_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Recriar FK de maleta_items: não tem user_id direto, mas maletas já tem cascade.
--    Garantir que maleta_items cascade via maletas (já existe ON DELETE CASCADE na FK maleta_id).
-- Nenhuma alteração necessária em maleta_items.

-- 3. Verificação: listar FKs ativas nas tabelas imaleta
-- SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table,
--        rc.delete_rule
-- FROM information_schema.table_constraints AS tc
-- JOIN information_schema.key_column_usage AS kcu USING (constraint_name, table_schema)
-- JOIN information_schema.constraint_column_usage AS ccu USING (constraint_name, table_schema)
-- JOIN information_schema.referential_constraints AS rc USING (constraint_name, table_schema)
-- WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'imaleta';
