import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  subscriptions: { id: string; status: string; saas: { name: string } | null }[];
};

export default async function AdminUsersPage({ searchParams }: { searchParams: { q?: string } }) {
  const supabase = createSupabaseServiceClient();
  let q = supabase
    .from('users')
    .select('id, email, full_name, is_admin, created_at, subscriptions:subscriptions(id, status, saas:saas(name))')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (searchParams.q) q = q.ilike('email', `%${searchParams.q}%`);
  const { data } = await q;
  const users = (data ?? []) as unknown as UserRow[];

  return (
    <div>
      <h1 className="text-3xl font-bold">Usuários</h1>
      <p className="mt-1 text-muted-foreground">Todos os usuários e assinaturas.</p>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="Buscar por email..."
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm md:w-80"
        />
      </form>

      <Card className="mt-6">
        <CardHeader><CardTitle>Usuários ({users.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>SaaS ativos</TableHead>
                <TableHead>Criado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const active = u.subscriptions?.filter((s) => s.status === 'active') ?? [];
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.email}</TableCell>
                    <TableCell>{u.full_name || '—'}</TableCell>
                    <TableCell>{u.is_admin && <Badge variant="secondary">Admin</Badge>}</TableCell>
                    <TableCell>
                      {active.length > 0 ? active.map((a) => a.saas?.name).filter(Boolean).join(', ') : '—'}
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
