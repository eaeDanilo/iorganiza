-- Add imagem_url to produtos and create storage bucket

ALTER TABLE imaleta.produtos ADD COLUMN IF NOT EXISTS imagem_url TEXT NULL;

-- Create storage bucket for product images (public read)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'imaleta-imagens',
  'imaleta-imagens',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow service role full access (service role bypasses RLS, but explicit policies help)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Service role full access imaleta'
  ) THEN
    CREATE POLICY "Service role full access imaleta" ON storage.objects
      FOR ALL TO service_role USING (bucket_id = 'imaleta-imagens');
  END IF;
END $$;

-- Allow public read of images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read imaleta-imagens'
  ) THEN
    CREATE POLICY "Public read imaleta-imagens" ON storage.objects
      FOR SELECT TO public USING (bucket_id = 'imaleta-imagens');
  END IF;
END $$;
