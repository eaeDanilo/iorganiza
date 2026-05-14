# iOrganiza Hub

Plataforma centralizadora de múltiplos SaaS — SSO via Supabase, checkout direto via Stripe, distribuição via Kiwify/Hotmart/Kirvano, dashboard administrativo completo.

## Stack
- Next.js 14 (App Router, TypeScript)
- Supabase (Postgres + Auth)
- Stripe (Checkout + Billing)
- Resend (emails transacionais)
- Tailwind + componentes shadcn customizados

## Estrutura
```
src/
  app/                # rotas (App Router)
    page.tsx          # landing
    catalogo/         # catálogo público
    saas/[slug]/      # detalhe SaaS
    auth/             # signup, login, forgot, reset, callback
    dashboard/        # área usuário
    admin/            # área admin
    checkout/[saasId] # checkout Stripe
    api/              # routes (REST + webhooks)
  components/         # UI (shadcn-style) + landing/catalog/dashboard/admin
  lib/                # supabase, stripe, resend, auth, webhooks helpers
  types/              # TypeScript types do DB
  middleware.ts       # gate de rotas + sessão
supabase/schema.sql   # schema completo + RLS + triggers
```

## Setup

### 1. Instalar
```bash
cd iorganiza-hub
npm install
cp .env.example .env.local
```

### 2. Supabase
1. Criar projeto em https://supabase.com
2. Copiar `Project URL`, `anon key`, `service_role key` para `.env.local`
3. SQL editor → colar conteúdo de `supabase/schema.sql` → Run
4. Auth → URL Configuration → adicionar `http://localhost:3000/auth/callback` em Redirect URLs
5. Auth → Providers → Email → habilitar "Confirm email"
6. Para promover um usuário a admin: depois do primeiro signup, no SQL editor:
   ```sql
   update public.users set is_admin = true where email = 'seu@email.com';
   ```

### 3. Stripe
1. Criar conta em https://stripe.com
2. Em test mode: Developers → API keys → copiar `Publishable` e `Secret` para `.env.local`
3. Para cada SaaS:
   - Products → Add product → criar com preço recorrente mensal
   - Copiar `price_id` e cadastrar via `/admin/saas/novo` (campo Stripe Price ID)
4. Webhook local (CLI): `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
   - Copiar `whsec_...` para `STRIPE_WEBHOOK_SECRET`
5. Em produção: Developers → Webhooks → Add endpoint
   - URL: `https://seu-dominio.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `invoice.payment_succeeded`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`

### 4. Resend
1. Criar conta em https://resend.com
2. API Keys → copiar para `RESEND_API_KEY`
3. Configurar domínio em Domains (ou usar `onboarding@resend.dev` para teste)
4. Definir `RESEND_FROM_EMAIL`

### 5. Kiwify / Hotmart / Kirvano
1. Em cada dashboard, cadastrar webhook apontando para:
   - `https://seu-dominio.com/api/webhooks/kiwify`
   - `https://seu-dominio.com/api/webhooks/hotmart`
   - `https://seu-dominio.com/api/webhooks/kirvano`
2. Pegar segredo de assinatura em cada e popular `.env`
3. **Importante:** o webhook tenta casar `product.name` do payload com `saas.slug` ou `saas.name` no banco. Garanta que o nome do produto nas plataformas externas bata com o cadastrado no admin.

### 6. Rodar
```bash
npm run dev
```
Acessar http://localhost:3000

## Fluxos críticos

- **Cadastro:** `/auth/signup` → email de confirmação → `/auth/callback` cria registro em `public.users` (via trigger) e envia email de boas-vindas.
- **Checkout Stripe:** usuário em `/checkout/[saasId]` → server action gera Checkout Session → redirect para Stripe → webhook `checkout.session.completed` ativa `subscription`.
- **Checkout externo:** plataforma envia webhook → helper `findOrCreateUser` cria conta se não existe → upsert em `subscriptions`.
- **Integração entre SaaS:** `POST /api/integrations` cria registro em `saas_integrations` apenas se usuário tem ambas assinaturas ativas. Consumir via `GET /api/integrations/check?source=&target=`.

## Como adicionar novo SaaS
1. Admin → SaaS → Novo
2. Preencher `name`, `slug`, `price_monthly`, `features`
3. Criar produto no Stripe e colar `price_id` no campo correspondente
4. Se SaaS é hospedado fora do hub, preencher `external_url`
5. Cadastrar mesmo produto em Kiwify/Hotmart/Kirvano com o nome batendo

## Deploy
1. Push para GitHub
2. Importar repo na Vercel
3. Settings → Environment Variables → colar todo o `.env.local` (com chaves de produção)
4. Deploy
5. DNS: CNAME apontando para Vercel
6. Reconfigurar webhooks com URL de produção

## Checklist pós-instalação
- [ ] `.env.local` preenchido
- [ ] `supabase/schema.sql` executado
- [ ] Email confirmation habilitado no Supabase
- [ ] Primeiro usuário promovido a admin via SQL
- [ ] Pelo menos 1 SaaS cadastrado no admin
- [ ] Stripe webhook funcionando (testar com `stripe trigger checkout.session.completed`)
- [ ] Resend enviando emails (testar signup)
