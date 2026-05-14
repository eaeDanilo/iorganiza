'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';

export default function PerfilPage() {
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      <h1 className="text-3xl font-bold">Perfil</h1>
      <p className="mt-1 text-muted-foreground">Atualize seus dados e senha.</p>

      <Card className="mt-6">
        <CardHeader><CardTitle>Dados pessoais</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
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
          <form onSubmit={changePassword} className="space-y-4">
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

      {msg && <p className="mt-4 text-sm text-success">{msg}</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
    </div>
  );
}
