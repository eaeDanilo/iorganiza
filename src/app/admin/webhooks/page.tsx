import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { webhookProviderLabel, webhookStatusLabel } from '@/lib/labels';
import type { WebhookLog } from '@/types/database';
import { RetryButton } from './RetryButton';

export default async function WebhooksPage() {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('webhook_logs').select('*').order('created_at', { ascending: false }).limit(100);
  const logs = (data ?? []) as WebhookLog[];

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Webhooks</h1>
      <p className="mt-1 text-muted-foreground">Últimos 100 webhooks recebidos.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Logs</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Provedor</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Erro</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>{formatDate(l.created_at, true)}</TableCell>
                  <TableCell>{webhookProviderLabel[l.provider]}</TableCell>
                  <TableCell className="font-mono text-xs">{l.event_type}</TableCell>
                  <TableCell>
                    <Badge variant={l.status === 'success' ? 'success' : l.status === 'failed' ? 'destructive' : 'outline'}>
                      {webhookStatusLabel[l.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {l.error_message || '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {l.status !== 'success' && <RetryButton id={l.id} />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
