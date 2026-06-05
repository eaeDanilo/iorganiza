-- iMaleta — Gestão de maletas de vendedores externos
-- Execute no Supabase SQL Editor

CREATE SCHEMA IF NOT EXISTS imaleta;

CREATE OR REPLACE FUNCTION imaleta.has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    JOIN public.saas ss ON ss.id = s.saas_id
    WHERE s.user_id = p_user_id AND s.status = 'active' AND ss.slug = 'imaleta'
  );
$$;

CREATE TABLE IF NOT EXISTS imaleta.produtos (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome          TEXT         NOT NULL,
  descricao     TEXT,
  codigo_barras TEXT         NOT NULL,
  preco         NUMERIC(10,2),
  status        TEXT         NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  UNIQUE (user_id, codigo_barras)
);

CREATE TABLE IF NOT EXISTS imaleta.vendedores (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome       TEXT         NOT NULL,
  telefone   TEXT,
  email      TEXT,
  status     TEXT         NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS imaleta.maletas (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendedor_id    UUID         NOT NULL REFERENCES imaleta.vendedores(id),
  nome           TEXT         NOT NULL,
  periodo_inicio DATE         NOT NULL DEFAULT CURRENT_DATE,
  periodo_fim    DATE,
  status         TEXT         NOT NULL DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_conferencia', 'conferida')),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS imaleta.maleta_items (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  maleta_id  UUID         NOT NULL REFERENCES imaleta.maletas(id) ON DELETE CASCADE,
  produto_id UUID         NOT NULL REFERENCES imaleta.produtos(id),
  quantidade INTEGER      NOT NULL DEFAULT 1 CHECK (quantidade > 0),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS imaleta.conferencias (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  maleta_id     UUID         NOT NULL REFERENCES imaleta.maletas(id),
  user_id       UUID         NOT NULL REFERENCES auth.users(id),
  observacoes   TEXT,
  status        TEXT         NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'finalizada')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  finalizada_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS imaleta.conferencia_items (
  id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  conferencia_id       UUID         NOT NULL REFERENCES imaleta.conferencias(id) ON DELETE CASCADE,
  produto_id           UUID         NOT NULL REFERENCES imaleta.produtos(id),
  quantidade_retornada INTEGER      NOT NULL DEFAULT 1 CHECK (quantidade_retornada > 0),
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

ALTER TABLE imaleta.produtos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaleta.vendedores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaleta.maletas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaleta.maleta_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaleta.conferencias      ENABLE ROW LEVEL SECURITY;
ALTER TABLE imaleta.conferencia_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner"           ON imaleta.produtos;
DROP POLICY IF EXISTS "owner"           ON imaleta.vendedores;
DROP POLICY IF EXISTS "owner"           ON imaleta.maletas;
DROP POLICY IF EXISTS "owner_via_maleta" ON imaleta.maleta_items;
DROP POLICY IF EXISTS "owner"           ON imaleta.conferencias;
DROP POLICY IF EXISTS "owner_via_conf"  ON imaleta.conferencia_items;

CREATE POLICY "owner" ON imaleta.produtos         FOR ALL USING (user_id = auth.uid());
CREATE POLICY "owner" ON imaleta.vendedores       FOR ALL USING (user_id = auth.uid());
CREATE POLICY "owner" ON imaleta.maletas          FOR ALL USING (user_id = auth.uid());
CREATE POLICY "owner_via_maleta" ON imaleta.maleta_items FOR ALL
  USING (EXISTS (SELECT 1 FROM imaleta.maletas m WHERE m.id = maleta_id AND m.user_id = auth.uid()));
CREATE POLICY "owner" ON imaleta.conferencias     FOR ALL USING (user_id = auth.uid());
CREATE POLICY "owner_via_conf" ON imaleta.conferencia_items FOR ALL
  USING (EXISTS (SELECT 1 FROM imaleta.conferencias c WHERE c.id = conferencia_id AND c.user_id = auth.uid()));

-- =========== SEED: iMaleta na tabela saas ===========
INSERT INTO public.saas (name, slug, description, price_monthly, features, status)
VALUES (
  'iMaleta',
  'imaleta',
  'Gerencie maletas de vendedores externos com código de barras. Monte maletas, envie com o vendedor e na conferência de retorno bipe os produtos para calcular automaticamente o que foi vendido no período.',
  29.00,
  '["Maletas por vendedor","Geração de código de barras Code 128","Conferência por câmera ou leitor USB","Cálculo automático de vendas","Impressão via impressora mobile","Histórico de conferências"]'::jsonb,
  'active'
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  features    = EXCLUDED.features,
  updated_at  = NOW();
