'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Shield, ShieldOff, ShieldCheck, ShieldMinus, Trash2 } from 'lucide-react';

interface Props {
  userId: string;
  targetEmail: string;
  targetIsAdmin: boolean;
  targetIsSuperAdmin: boolean;
  currentUserId: string;
}

export function UserRowActions({ userId, targetEmail, targetIsAdmin, targetIsSuperAdmin, currentUserId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isSelf = userId === currentUserId;

  async function patch(body: Record<string, unknown>) {
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? 'Erro ao atualizar usuário');
    }
  }

  async function remove() {
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw new Error(json.error ?? 'Erro ao remover usuário');
    }
  }

  function run(key: string, action: () => Promise<void>) {
    setLoading(key);
    action()
      .then(() => startTransition(() => router.refresh()))
      .catch((e) => alert(e.message))
      .finally(() => setLoading(null));
  }

  const busy = isPending || loading !== null;

  return (
    <div className="flex items-center gap-1">
      {!targetIsAdmin && !isSelf && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          title="Tornar admin"
          onClick={() => run('promote', () => patch({ is_admin: true }))}
        >
          <Shield className="h-3.5 w-3.5" />
        </Button>
      )}
      {targetIsAdmin && !targetIsSuperAdmin && !isSelf && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          title="Remover admin"
          onClick={() => run('demote', () => patch({ is_admin: false }))}
        >
          <ShieldOff className="h-3.5 w-3.5" />
        </Button>
      )}
      {targetIsAdmin && !targetIsSuperAdmin && !isSelf && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          title="Tornar super admin"
          onClick={() => run('super', () => patch({ is_admin: true, is_super_admin: true }))}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
        </Button>
      )}
      {targetIsSuperAdmin && !isSelf && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          title="Remover super admin"
          onClick={() => run('unsuper', () => patch({ is_super_admin: false }))}
        >
          <ShieldMinus className="h-3.5 w-3.5" />
        </Button>
      )}
      {!isSelf && !confirmDelete && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          title={`Remover usuário ${targetEmail}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmDelete(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      )}
      {!isSelf && confirmDelete && (
        <div className="flex items-center gap-1 rounded border border-destructive/40 bg-destructive/5 px-2 py-1">
          <span className="text-xs text-muted-foreground">Remover?</span>
          <Button
            size="sm"
            variant="destructive"
            disabled={busy}
            className="h-6 px-2 text-xs"
            onClick={() => { setConfirmDelete(false); run('delete', remove); }}
          >
            Sim
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            className="h-6 px-2 text-xs"
            onClick={() => setConfirmDelete(false)}
          >
            Não
          </Button>
        </div>
      )}
    </div>
  );
}
