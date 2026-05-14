# @iorganiza/brand

Pacote portável com o visual, componentes e SDK do iOrganiza Hub. Use em qualquer SaaS filho (iCobra, iCalc, etc.) para herdar:

- Tema escuro Netflix-style (preto + azul + coral)
- Componentes UI prontos (Button, Card, Input, Label, Badge)
- Tailwind preset
- SDK Supabase compartilhado (mesma auth do Hub)
- Helpers de entitlement (checa se usuário pagou)
- Paywall plug-and-play
- Navbar com link de volta ao Hub

## Instalar em novo SaaS

### 1. Copiar pasta
```bash
# Copie o diretório iorganiza-brand/ para a raiz do seu novo projeto SaaS
cp -r ../iorganiza-hub/iorganiza-brand ./iorganiza-brand
```

Estrutura recomendada do projeto filho:
```
my-saas/
├── iorganiza-brand/      ← copiado aqui
├── src/
├── package.json
└── tailwind.config.ts
```

### 2. Instalar peer deps
```bash
npm install @supabase/supabase-js @supabase/ssr next react react-dom \
  tailwindcss clsx tailwind-merge lucide-react \
  class-variance-authority @radix-ui/react-slot @radix-ui/react-label
```

### 3. Tailwind preset
Em `tailwind.config.ts` do SaaS filho:
```ts
import preset from './iorganiza-brand/tailwind-preset';

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    './iorganiza-brand/**/*.{ts,tsx}',
  ],
};
```

### 4. CSS global
Em `app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import '../iorganiza-brand/theme.css';
```

### 5. Variáveis de ambiente
`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<MESMA URL do Hub>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<MESMA key do Hub>
SUPABASE_SERVICE_ROLE_KEY=<service_role>
IORGANIZA_HUB_URL=https://iorganiza.com   # ou http://localhost:3000
IORGANIZA_SAAS_SLUG=icobra                 # slug deste SaaS (cadastrado no Hub)
```

⚠️ Use **o mesmo projeto Supabase** do Hub para que auth seja compartilhada (SSO).

### 6. Usar componentes
```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '../iorganiza-brand/components';

export default function Page() {
  return (
    <Card>
      <CardHeader><CardTitle>Olá</CardTitle></CardHeader>
      <CardContent>
        <Button>Clique</Button>
      </CardContent>
    </Card>
  );
}
```

### 7. Proteger páginas com entitlement
```tsx
// app/protected/page.tsx
import { cookies } from 'next/headers';
import { createIorganizaServerClient, checkEntitlement } from '../iorganiza-brand/sdk';
import { Paywall } from '../iorganiza-brand/Paywall';

export default async function ProtectedPage() {
  const cookieStore = cookies();
  const supabase = createIorganizaServerClient({
    get: (n) => cookieStore.get(n)?.value,
    set: (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
    remove: (n, o) => { try { cookieStore.set({ name: n, value: '', ...o }); } catch {} },
  });

  const ent = await checkEntitlement(supabase, process.env.IORGANIZA_SAAS_SLUG!);
  if (!ent.active) {
    // pega saasId do Hub via uma chamada ou hardcode
    return <Paywall saasName="iCobra" saasId="<uuid-do-saas>" status={ent.status ?? undefined} />;
  }

  return <div>Conteúdo protegido aqui.</div>;
}
```

### 8. Login compartilhado
Não precisa criar páginas de login no SaaS filho. Redirecione ao Hub:
```ts
import { loginRedirect } from '../iorganiza-brand/sdk';

// em middleware ou route handler
if (!user) redirect(loginRedirect('/sua/url/atual'));
```

Após login no Hub, cookie de sessão Supabase é compartilhado (mesmo domínio raiz necessário em prod — ex: `app.iorganiza.com` e `icobra.iorganiza.com` com `cookie domain: .iorganiza.com`).

### 9. Compartilhar dados entre SaaS
```ts
import { canIntegrateWith } from '../iorganiza-brand/sdk';

const { allowed, enabled } = await canIntegrateWith(supabase, 'icobra', 'icalc');
if (allowed && enabled) {
  // pode ler dados de iCalc neste contexto
}
```

## Cookies cross-subdomain (produção)

Pra SSO funcionar entre `iorganiza.com` e subdomínios (`icobra.iorganiza.com`):

1. Supabase Dashboard → Auth → URL Configuration
2. Adicione todos os subdomínios em **Redirect URLs**
3. No projeto filho, configure cookie do Supabase com `domain: '.iorganiza.com'` ao criar client

```ts
createIorganizaServerClient({
  get: ...,
  set: (n, v, o) => cookieStore.set({ name: n, value: v, ...o, domain: '.iorganiza.com' }),
  remove: ...,
});
```

## Build do brand kit como pacote npm (opcional)

Para distribuir como npm package privado em vez de copiar pasta:

```bash
cd iorganiza-brand
npm publish --access restricted
```

Versionamento: bump `version` em package.json antes de publicar.

## Atualizar tema globalmente

Edite `tailwind-preset.ts` no Hub. Re-distribua aos SaaS filhos (cp ou npm publish). Eles rebuild para herdar mudanças.

## Lista de exports

- `Button`, `Input`, `Label`, `Card*`, `Badge` — primitives
- `IorganizaNavbar` — header pronto
- `Paywall` — bloqueio de acesso
- `createIorganizaBrowserClient`, `createIorganizaServerClient`, `createIorganizaServiceClient` — Supabase clients
- `checkEntitlement(supabase, slug)` — valida assinatura
- `canIntegrateWith(supabase, source, target)` — valida integração
- `hubUrl`, `loginRedirect`, `checkoutRedirect` — URL helpers
- `tailwindPreset` — preset Tailwind
- `cn` — utility classNames
