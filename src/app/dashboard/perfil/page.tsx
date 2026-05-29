'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';

export default function PerfilPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setEmail(data.user.email || '');
        const { data: profile } = await supabase.from('users').select('full_name').eq('id', data.user.id).maybeSingle();
        setFullName(profile?.full_name || '');
      }
    })();
  }, [supabase]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setError(null);
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      const { error: err } = await supabase.from('users').update({ full_name: fullName }).eq('id', auth.user.id);
      if (err) setError(err.message);
      else setMsg('Perfil atualizado.');
    }
    setLoading(false);
  }

  async function exportarDados() {
    setExporting(true);
    try {
      const res = await fetch('/api/users/me/export');
      if (!res.ok) throw new Error('Falha na exportação');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `iorganiza-meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Erro ao exportar dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }

  async function excluirConta() {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/users/me/delete', { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir conta');
      await supabase.auth.signOut();
      router.push('/');
    } catch {
      setError('Erro ao excluir conta. Contate eaedanilo1@gmail.com.');
      setDeleting(false);
      setDeleteConfirm(false);
    }
  }

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const pw = String(fd.get('new_password'));
    const confirm = String(fd.get('confirm_password'));

    if (pw.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (pw !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);
    if (err) setError(translateAuthError(err.message));
    else {
      setMsg('Senha alterada com sucesso.');
      e.currentTarget.reset();
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold sm:text-3xl">Perfil</h1>
      <p className="mt-1 text-muted-foreground">Atualize seus dados e senha.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Dados pessoais</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome completo</Label>
              <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>Salvar</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>Mínimo 8 caracteres. Deve ser diferente da atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} method="post" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nova senha</Label>
              <Input id="new_password" name="new_password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar senha</Label>
              <Input id="confirm_password" name="confirm_password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={loading}>Alterar senha</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Seus dados (LGPD)</CardTitle>
          <CardDescription>
            Exporte ou exclua seus dados conforme a Lei nº 13.709/2018.{' '}
            <Link href="/privacidade" className="underline">Ver política de privacidade</Link>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={exportarDados} disabled={exporting}>
              {exporting ? 'Exportando...' : 'Exportar meus dados (JSON)'}
            </Button>
          </div>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <p className="text-sm font-medium text-destructive">Zona de perigo</p>
            <p className="text-sm text-muted-foreground">
              A exclusão de conta cancela suas assinaturas ativas e agenda a remoção permanente
              de todos os seus dados em 90 dias. Esta ação não pode ser desfeita.
            </p>
            {deleteConfirm ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button variant="destructive" onClick={excluirConta} disabled={deleting}>
                  {deleting ? 'Excluindo...' : 'Confirmar exclusão permanente'}
                </Button>
                <Button variant="outline" onClick={() => setDeleteConfirm(false)} disabled={deleting}>
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button variant="destructive" onClick={excluirConta}>
                Excluir minha conta
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {msg && <p className="mt-4 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
