import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatCurrency, formatDate } from '@/lib/utils';
import { saasStatusLabel } from '@/lib/labels';
import type { Saas } from '@/types/database';

export default async function AdminSaasListPage() {
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.from('saas').select('*').is('deleted_at', null).order('name');
  const list = (data ?? []) as Saas[];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SaaS</h1>
          <p className="mt-1 text-muted-foreground">Gerencie todos os SaaS da plataforma.</p>
        </div>
        <Button asChild>
          <Link href="/admin/saas/novo">+ Novo SaaS</Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Todos os SaaS</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.slug}</TableCell>
                  <TableCell>{formatCurrency(s.price_monthly)}</TableCell>
                  <TableCell>
                    <Badge variant={s.status === 'active' ? 'success' : 'outline'}>{saasStatusLabel[s.status]}</Badge>
                  </TableCell>
                  <TableCell>{formatDate(s.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/saas/${s.id}/editar`}>Editar</Link>
                    </Button>
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
