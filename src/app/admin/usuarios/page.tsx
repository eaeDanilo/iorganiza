import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { formatDate } from '@/lib/utils';
import { UserRowActions } from '@/components/admin/UserRowActions';

type UserRow = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  subscriptions: { id: string; status: string; saas: { name: string } | null }[];
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: qParam } = await searchParams;
  const currentUser = await getCurrentUser();
  const isSuperAdmin = currentUser?.is_super_admin ?? false;
  const supabase = createSupabaseServiceClient();

  let q = supabase
    .from('users')
    .select('id, email, full_name, is_admin, is_super_admin, created_at, subscriptions:subscriptions(id, status, saas:saas(name))')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(100);
  if (qParam) q = q.ilike('email', `%${qParam}%`);
  const { data } = await q;
  const users = (data ?? []) as unknown as UserRow[];

  return (
    <div>
      <h1 className="text-2xl font-bold sm:text-3xl">Usuários</h1>
      <p className="mt-1 text-muted-foreground">
        Todos os usuários e assinaturas.
        {isSuperAdmin && (
          <span className="ml-2 text-xs text-secondary">
            Super admin — você pode gerenciar cargos e remover usuários.
          </span>
        )}
      </p>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={qParam ?? ''}
          placeholder="Buscar por e-mail..."
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 text-sm md:w-80"
        />
      </form>

      <Card className="mt-6">
        <CardHeader><CardTitle>Usuários ({users.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>E-mail</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Sistemas ativos</TableHead>
                <TableHead>Criado</TableHead>
                {isSuperAdmin && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const active = u.subscriptions?.filter((s) => s.status === 'active') ?? [];
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-mono text-xs">{u.email}</TableCell>
                    <TableCell>{u.full_name || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {u.is_super_admin && <Badge className="bg-secondary text-white text-xs">Super Admin</Badge>}
                        {u.is_admin && !u.is_super_admin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                        {!u.is_admin && <span className="text-xs text-muted-foreground">Usuário</span>}
                      </div>
                    </TableCell>
                    <TableCell>
                      {active.length > 0 ? active.map((a) => a.saas?.name).filter(Boolean).join(', ') : '—'}
                    </TableCell>
                    <TableCell>{formatDate(u.created_at)}</TableCell>
                    {isSuperAdmin && (
                      <TableCell>
                        <UserRowActions
                          userId={u.id}
                          targetEmail={u.email}
                          targetIsAdmin={u.is_admin}
                          targetIsSuperAdmin={u.is_super_admin}
                          currentUserId={currentUser!.id}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isSuperAdmin && (
        <div className="mt-4 rounded-lg border border-border bg-surface p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-2">Ações disponíveis:</p>
          <ul className="space-y-1">
            <li>🛡 <strong>Tornar Admin</strong> — dá acesso ao painel admin</li>
            <li>🛡✕ <strong>Remover Admin</strong> — volta a usuário comum</li>
            <li>🛡✓ <strong>Tornar Super Admin</strong> — pode gerenciar outros admins</li>
            <li>🛡— <strong>Rebaixar Super Admin</strong> — mantém admin mas sem gerência de cargos</li>
            <li>🗑 <strong>Remover Usuário</strong> — soft delete (irreversível via UI)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
