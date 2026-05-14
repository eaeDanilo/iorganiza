# Starter para novo SaaS filho

Cópia mínima pra começar do zero. 5 arquivos.

## Estrutura

```
meu-saas/
├── iorganiza-brand/         ← copiar inteiro de iorganiza-hub
├── src/app/
│   ├── layout.tsx
│   ├── globals.css
│   ├── page.tsx             ← landing pública do SaaS
│   └── app/page.tsx         ← área logada (paywall + conteúdo)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

## Arquivos

### package.json
```json
{
  "name": "icobra",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.45.4",
    "@supabase/ssr": "^0.5.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.451.0",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^2.5.3"
  },
  "devDependencies": {
    "@types/node": "^22.7.5",
    "@types/react": "^18.3.11",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.6.3"
  }
}
```

### tailwind.config.ts
```ts
import type { Config } from 'tailwindcss';
import preset from './iorganiza-brand/tailwind-preset';

const config: Config = {
  presets: [preset as any],
  content: [
    './src/**/*.{ts,tsx}',
    './iorganiza-brand/**/*.{ts,tsx}',
  ],
  plugins: [require('tailwindcss-animate')],
};
export default config;
```

### src/app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
@import '../../iorganiza-brand/theme.css';
```

### src/app/layout.tsx
```tsx
import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background text-foreground">{children}</body>
    </html>
  );
}
```

### src/app/page.tsx (landing pública do SaaS)
```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../iorganiza-brand/components';
import { hubUrl } from '../../iorganiza-brand/sdk';

export default function Home() {
  return (
    <main className="container py-20">
      <h1 className="text-5xl font-bold">iCobra</h1>
      <p className="mt-4 text-muted-foreground">CRM completo. Assine no iOrganiza Hub.</p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <a href={hubUrl('/catalogo')}>Ver no Hub</a>
        </Button>
        <Button asChild variant="outline">
          <a href={hubUrl('/auth/login?redirect=/dashboard')}>Entrar</a>
        </Button>
      </div>
    </main>
  );
}
```

### src/app/app/page.tsx (conteúdo protegido)
```tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createIorganizaServerClient, checkEntitlement, loginRedirect } from '../../../iorganiza-brand/sdk';
import { Paywall } from '../../../iorganiza-brand/Paywall';

export default async function AppPage() {
  const cookieStore = cookies();
  const supabase = createIorganizaServerClient({
    get: (n) => cookieStore.get(n)?.value,
    set: (n, v, o) => { try { cookieStore.set({ name: n, value: v, ...o }); } catch {} },
    remove: (n, o) => { try { cookieStore.set({ name: n, value: '', ...o }); } catch {} },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(loginRedirect('/app'));

  const ent = await checkEntitlement(supabase, process.env.IORGANIZA_SAAS_SLUG!);
  if (!ent.active) {
    return <Paywall saasName="iCobra" saasId="<UUID-do-iCobra-no-Hub>" status={ent.status ?? undefined} />;
  }

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">App iCobra</h1>
      <p className="text-muted-foreground">Bem-vindo, {user.email}!</p>
      {/* sua aplicação aqui */}
    </div>
  );
}
```

### .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...
IORGANIZA_HUB_URL=http://localhost:3000
IORGANIZA_SAAS_SLUG=icobra
```

### tsconfig.json
Igual ao do Hub (copiar de `iorganiza-hub/tsconfig.json`).

## Rodar
```bash
npm install
npm run dev   # porta 3001 (3000 fica pro Hub)
```

Browser: http://localhost:3001

## Pegando o UUID do SaaS

No SQL editor do Supabase:
```sql
select id, name, slug from public.saas;
```
Copiar `id` correspondente ao slug. Substituir `<UUID-do-iCobra-no-Hub>` no código.
