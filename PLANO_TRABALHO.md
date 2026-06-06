# 📋 Plano de Trabalho — iOrganiza Hub
> Gerado em: 05/06/2026 | Branch: `main` (up to date com origin)

---

## 🔴 URGENTE — Commits pendentes

**Há 19 arquivos modificados que NÃO foram commitados.**
A maioria parece ser atualização de dependências (Next.js 15) + diferenças de line-endings (CRLF→LF), mas inclui mudanças reais em rotas de API e pages.

Arquivos modificados sem commit:
```
next.config.js
package.json / package-lock.json     ← Next.js atualizado para ^15.5.18
src/app/api/auth/send-email/route.ts
src/app/api/cron/purge-users/route.ts
src/app/api/icobra/assistente/route.ts
src/app/api/users/me/export/route.ts
src/app/auth/forgot-password/page.tsx
src/app/auth/login/page.tsx
src/app/auth/reset-password/page.tsx
src/app/auth/signup/page.tsx
src/app/dashboard/catalogo/page.tsx
src/app/dashboard/icobra/layout.tsx
src/app/dashboard/imaleta/layout.tsx
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/components/CookieConsent.tsx
tailwind.config.ts
```

**Ação:** Revisar o diff, separar por contexto e commitar em grupos lógicos.

---

## ✅ O que foi feito recentemente (últimos commits)

| Commit | Feature |
|--------|---------|
| `4739114` | Trial banner persistente para acesso sem assinatura |
| `3885545` | Módulo iMaleta completo |
| `6145fe9` | Scripts create-icobra no .gitignore |
| `4e11e9c` | LGPD: redact + purge de webhook_logs |
| `1b62cb4` | ICobraBanner no catálogo público e dashboard |
| `e342456` | Estado "canceling" + diálogo de confirmação no cancelamento |
| `cb4aa03` | Vercel Speed Insights |
| `fe32961` | Correção do fluxo de login + splash screen + hardening de segurança |
| `07743bc` | HTTP security headers |
| `cf7fc32` | Google OAuth + logo iOrganiza |

---

## ⚠️ Problemas encontrados (verificados agora)

### 1. Rate Limiting em memória — NÃO é global em produção
**Arquivo:** `src/app/api/icobra/assistente/route.ts`

O rate limiter do assistente IA usa `Map` em memória com limite de 10 req/min **por instância de servidor**. No Vercel (serverless), cada cold start cria uma instância nova — o limite é ignorado entre instâncias.

```ts
// Comentário no código já reconhece o problema:
// "Para rate limit global e preciso, use Upstash Redis + @upstash/ratelimit."
```

**Risco:** Usuário pode abusar do assistente IA fazendo muitas requisições em paralelo.
**Solução:** Implementar Upstash Redis + `@upstash/ratelimit`.

---

### 2. `check_rate_limit` RPC — precisa verificar se existe no Supabase
**Arquivo:** `src/lib/limits.ts` — função `assertApiRateLimit()`

A função chama `supabase.rpc('check_rate_limit', {...})` mas **não foi verificado** se essa função SQL existe no `supabase/schema.sql`. Se não existir, qualquer endpoint que use `assertApiRateLimit` vai quebrar silenciosamente em produção.

**Ação:** Abrir `supabase/schema.sql` e confirmar que a função `check_rate_limit` está definida. Se não estiver, criar a migration.

---

### 3. Next.js 15 — mudança de versão major não commitada
O `package.json` foi atualizado para `"next": "^15.5.18"` mas as mudanças não foram commitadas. Next.js 15 tem breaking changes em relação ao 14, especialmente em:
- `params` em Server Components agora é uma Promise (async)
- Comportamento de cache mudou (`force-dynamic` default)
- `cookies()` e `headers()` agora são async

**Ação:** Rodar `npm run type-check` e `npm run build` localmente antes de commitar. Verificar se algum componente que usa `params` quebrou.

---

### 4. iMaleta — módulo novo, sem testes visíveis
O módulo iMaleta foi adicionado no último grande commit. É um sistema de conferência de maletas com:
- Produtos + barcode scanner (`@zxing/browser`)
- Vendedores
- Conferência
- Server Actions

**Ação:** Testar fluxo completo: cadastrar maleta → adicionar produtos → conferir → fechar. Verificar se as RLS policies do Supabase estão corretas para as tabelas do iMaleta.

---

### 5. Trial banner — lógica de acesso a verificar
**Arquivo:** `src/components/shared/TrialBanner.tsx` + `src/app/trial/[slug]/page.tsx`

O trial foi implementado mas é preciso verificar:
- Por quanto tempo o trial dura?
- O banner some automaticamente quando assina?
- A rota `/trial/[slug]` está protegida corretamente no middleware?

---

### 6. `.claude/skills/` com I/O errors
O `git status` mostra erros de I/O nas skills do Stripe:
```
.claude/skills/stripe-best-practices/SKILL.md: Input/output error
.claude/skills/stripe-projects/SKILL.md: Input/output error
.claude/skills/upgrade-stripe/SKILL.md: Input/output error
```
Esses arquivos aparecem como "Untracked" mas com erro de leitura. Provavelmente são symlinks quebrados ou arquivos de sessão do Claude Code.

**Ação:** Adicionar `.claude/skills/` ao `.gitignore` se ainda não estiver.

---

## 🔧 Melhorias que você deve fazer (priorizadas)

### PRIORIDADE ALTA

- [ ] **Commitar os 19 arquivos pendentes** — separar em commits semânticos
- [ ] **Verificar `check_rate_limit` RPC** no schema do Supabase
- [ ] **Rodar `npm run build`** após atualização do Next.js 15 para garantir que não há erros de compilação
- [ ] **Testar fluxo completo do iMaleta** em staging/produção

### PRIORIDADE MÉDIA

- [ ] **Substituir rate limiter in-memory** por Upstash Redis no assistente IA
  - `npm install @upstash/ratelimit @upstash/redis`
  - Criar KV store no Vercel ou Upstash dashboard
  - Adicionar `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` ao `.env.local`

- [ ] **Adicionar `.claude/skills/` ao `.gitignore`** para evitar poluição

- [ ] **Verificar fluxo de trial** — duração, expiração automática, middleware

- [ ] **Testar webhooks externos** (Kiwify, Hotmart, Kirvano) com payload real após mudanças de LGPD/purge

### PRIORIDADE BAIXA

- [ ] **Adicionar página de onboarding** para novos usuários (pós-signup antes do dashboard)
- [ ] **Adicionar mais módulos SaaS** no catálogo além de iCobra e iMaleta
- [ ] **Dashboard admin: relatórios** — as rotas `/api/reports/churn`, `/api/reports/revenue`, `/api/reports/users` existem mas verificar se a UI está completa
- [ ] **Internacionalização dos emails** via Resend — atualmente só PT-BR
- [ ] **Testes automatizados** — o projeto não tem nenhum arquivo de teste (`.test.`, `.spec.`)

---

## 📌 Checklist rápido para quando voltar a trabalhar

```
[ ] git status — ver o que mudou
[ ] npm run type-check — checar erros TypeScript
[ ] npm run build — garantir que o build não quebrou
[ ] Verificar supabase/schema.sql para check_rate_limit RPC
[ ] Abrir .gitignore e adicionar .claude/skills/
[ ] Commitar arquivos pendentes em grupos semânticos:
      - "chore: upgrade Next.js to 15.5.18"
      - "fix: normalize line endings"
      - (o que mais tiver de conteúdo real)
[ ] Testar fluxo iMaleta localmente
[ ] Testar fluxo trial (signup → trial → upgrade → cancel)
```

---

## 📁 Estrutura resumida do projeto

```
iOrganiza Hub (Next.js 15 + Supabase + Stripe)
├── Módulos ativos:
│   ├── iCobra — gestão de empréstimos (com assistente IA Claude Haiku)
│   └── iMaleta — gestão de maletas e conferência (novo)
├── Plataformas de pagamento:
│   ├── Stripe (checkout nativo)
│   ├── Kiwify, Hotmart, Kirvano (webhooks externos)
├── Auth: Supabase (email + Google OAuth)
├── Emails: Resend
├── Deploy: Vercel
└── Features recentes: Trial, LGPD cookie consent, Speed Insights, security headers
```

---

*Arquivo gerado automaticamente pelo Claude. Atualize conforme avançar.*
