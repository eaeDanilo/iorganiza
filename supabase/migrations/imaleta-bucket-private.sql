-- iMaleta: tornar o bucket de imagens PRIVADO e servir via signed URL.
-- Fase 2 do hardening de segurança. Rodar no SQL editor do Supabase.

-- 1. Bucket privado (leitura passa a exigir URL assinada)
update storage.buckets set public = false where id = 'imaleta-imagens';

-- 2. Remover política de leitura pública
drop policy if exists "Public read imaleta-imagens" on storage.objects;
-- (mantém a política "Service role full access imaleta" — uploads e signing usam service role)

-- 3. Converter URLs públicas legadas já gravadas em paths puros (idempotente)
update imaleta.produtos
set imagem_url = split_part(imagem_url, '/imaleta-imagens/', 2)
where imagem_url like '%/imaleta-imagens/%';
