-- LGPD Fix: atualizar o trigger handle_new_auth_user() no schema base para capturar consented_at.
-- A migration add_lgpd_consent_fields.sql já adicionou os campos, mas o schema.sql base
-- estava com a versão antiga do trigger (sem consented_at).
-- Este arquivo sincroniza o trigger com a versão correta para BDs criados do zero.

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, consented_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    (NEW.raw_user_meta_data->>'consented_at')::TIMESTAMPTZ
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

-- Manter revoke: apenas o trigger interno deve invocar esta função.
REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM anon, authenticated, public;
