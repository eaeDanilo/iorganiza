import Link from 'next/link';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import {
  webhookProviderLabel,
  webhookStatusLabel,
  paymentStatusLabel,
  paymentMethodLabel,
} from '@/lib/labels';
import type { WebhookLog, Payment } from '@/types/database';

const TABS = [
  { key: 'webhooks', label: 'Webhooks' },
  { key: 'pagamentos', label: 'Pagamentos com falha' },
  { key: 'rate-limits', label: 'Rate Limits' },
];

type PaymentWithUser = Payment & { users: { email: string; full_name: string | null } | null };
type RateLimitLog = { id: string; user_id: string; endpoint: string; created_at: string; users: { email: string } | null };

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = 'webhooks' } = await searchParams;
  const supabase = createSupabaseServiceClient();

  let webhooks: WebhookLog[] = [];
  let payments: PaymentWithUser[] = [];
  let rateLimits: RateLimitLog[] = [];

  if (tab === 'webhooks') {
    const { data } = await supabase
      .from('webhook_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    webhooks = (data ?? []) as WebhookLog[];
  } else if (tab === 'pagamentos') {
    const { data } = await supabase
      .from('payments')
      .select('*, users(email, full_name)')
      .in('status', ['failed', 'refunded'])
      .order('created_at', { ascending: false })
      .limit(200);
    payments = (data ?? []) as PaymentWithUser[];
  } else if (tab === 'rate-limits') {
    const { data } = await supabase
      .from('rate_limit_logs')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(200);
    rateLimits = (data ?? []) as RateLimitLog[];
  }

  const failedWebhooks = webhooks.filter((w) => w.status !== 'success').length;
  const total = tab === 'webhooks' ? webhooks.length : tab === 'pagamentos' ? payments.length : rateLimits.length;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Logs</h1>
          <p className="mt-1 text-muted-foreground">Eventos e erros do sistema em tempo real.</p>
        </div>
        {tab === 'webhooks' && failedWebhooks > 0 && (
          <Badge variant="destructive" className="mt-1">
            {failedWebhooks} com erro
          </Badge>
        )}
      </div>

      <div className="mt-6 flex gap-0 border-b border-border">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/logs?tab=${t.key}`}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base">
            {TABS.find((t) => t.key === tab)?.label}
          </CardTitle>
          <span className="text-xs text-muted-foreground">{total} registros</span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {tab === 'webhooks' && <WebhooksTable logs={webhooks} />}
          {tab === 'pagamentos' && <PagamentosTable payments={payments} />}
          {tab === 'rate-limits' && <RateLimitsTable logs={rateLimits} />}
        </CardContent>
      </Card>
    </div>
  );
}

function WebhooksTable({ logs }: { logs: WebhookLog[] }) {
  if (!logs.length) return <Empty />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Provedor</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Erro</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((l) => (
          <TableRow key={l.id} className={l.status === 'failed' ? 'bg-destructive/5' : undefined}>
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(l.created_at, true)}
            </TableCell>
            <TableCell>
              <span className="font-medium">{webhookProviderLabel[l.provider]}</span>
            </TableCell>
            <TableCell className="font-mono text-xs">{l.event_type ?? '—'}</TableCell>
            <TableCell>
              <Badge
                variant={
                  l.status === 'success'
                    ? 'success'
                    : l.status === 'failed'
                      ? 'destructive'
                      : 'outline'
                }
              >
                {webhookStatusLabel[l.status]}
              </Badge>
            </TableCell>
            <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
              {l.error_message ? (
                <span className="text-destructive">{l.error_message}</span>
              ) : (
                '—'
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function PagamentosTable({ payments }: { payments: PaymentWithUser[] }) {
  if (!payments.length) return <Empty label="Nenhum pagamento com falha." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Método</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(p.created_at, true)}
            </TableCell>
            <TableCell>
              <div className="text-sm font-medium">{p.users?.full_name ?? '—'}</div>
              <div className="text-xs text-muted-foreground">{p.users?.email}</div>
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(p.amount / 100, p.currency?.toUpperCase() ?? 'BRL')}
            </TableCell>
            <TableCell>{paymentMethodLabel[p.payment_method]}</TableCell>
            <TableCell>
              <Badge variant={p.status === 'refunded' ? 'outline' : 'destructive'}>
                {paymentStatusLabel[p.status]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function RateLimitsTable({ logs }: { logs: RateLimitLog[] }) {
  if (!logs.length) return <Empty label="Nenhum rate limit registrado." />;
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Usuário</TableHead>
          <TableHead>Endpoint</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((l) => (
          <TableRow key={l.id}>
            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
              {formatDate(l.created_at, true)}
            </TableCell>
            <TableCell className="text-xs text-muted-foreground">{l.users?.email ?? l.user_id}</TableCell>
            <TableCell className="font-mono text-xs">{l.endpoint}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Empty({ label = 'Nenhum registro encontrado.' }: { label?: string }) {
  return (
    <div className="py-12 text-center text-sm text-muted-foreground">{label}</div>
  );
}
