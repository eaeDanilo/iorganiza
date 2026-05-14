import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const integrations = [
  { name: 'Stripe', env: 'STRIPE_SECRET_KEY', webhookEnv: 'STRIPE_WEBHOOK_SECRET' },
  { name: 'Kiwify', env: 'KIWIFY_API_KEY', webhookEnv: 'KIWIFY_WEBHOOK_SECRET' },
  { name: 'Hotmart', env: 'HOTMART_CLIENT_SECRET', webhookEnv: 'HOTMART_WEBHOOK_SECRET' },
  { name: 'Kirvano', env: 'KIRVANO_API_KEY', webhookEnv: 'KIRVANO_WEBHOOK_SECRET' },
  { name: 'Resend', env: 'RESEND_API_KEY', webhookEnv: '' },
  { name: 'Supabase', env: 'SUPABASE_SERVICE_ROLE_KEY', webhookEnv: '' },
];

export default function ConfiguracoesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold">Configurações</h1>
      <p className="mt-1 text-muted-foreground">Status das integrações. Configure via variáveis de ambiente (.env).</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Status calculado em runtime baseado nas envs presentes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integrations.map((i) => {
            const hasKey = !!process.env[i.env];
            const hasWebhook = i.webhookEnv ? !!process.env[i.webhookEnv] : true;
            return (
              <div key={i.name} className="flex items-center justify-between rounded-md border border-border bg-background p-4">
                <div>
                  <p className="font-medium">{i.name}</p>
                  <p className="text-xs text-muted-foreground">
                    API key: <code>{i.env}</code> {i.webhookEnv && <>· Webhook: <code>{i.webhookEnv}</code></>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={hasKey ? 'success' : 'destructive'}>API {hasKey ? 'OK' : 'Faltando'}</Badge>
                  {i.webhookEnv && <Badge variant={hasWebhook ? 'success' : 'destructive'}>Webhook {hasWebhook ? 'OK' : 'Faltando'}</Badge>}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>URLs de webhook</CardTitle>
          <CardDescription>Configure essas URLs nos dashboards das plataformas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { name: 'Stripe', path: '/api/webhooks/stripe' },
            { name: 'Kiwify', path: '/api/webhooks/kiwify' },
            { name: 'Hotmart', path: '/api/webhooks/hotmart' },
            { name: 'Kirvano', path: '/api/webhooks/kirvano' },
          ].map((w) => (
            <div key={w.name} className="flex items-center justify-between rounded border border-border bg-background p-3">
              <span className="font-medium">{w.name}</span>
              <code className="text-xs text-primary">{process.env.NEXT_PUBLIC_APP_URL || ''}{w.path}</code>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
