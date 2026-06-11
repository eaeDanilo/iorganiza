'use client';
import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth-errors';
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button';
import { Turnstile, turnstileEnabled, type TurnstileHandle } from '@/components/auth/Turnstile';

function SignupForm() {
  const search = useSearchParams();
  const raw = search.get('redirect') || '/dashboard';
  const safeRedirect = raw.startsWith('/') && !raw.startsWith('//') ? raw : '/dashboard';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get('email'));
    const password = String(fd.get('password'));
    const fullName = String(fd.get('full_name'));

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Informe um e-mail válido (ex: nome@dominio.com).');
      return;
    }
    if (turnstileEnabled && !captchaToken) {
      setError('Confirme que você não é um robô.');
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, consented_at: new Date().toISOString() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`,
        captchaToken: captchaToken ?? undefined,
      },
    });
    setLoading(false);
    if (error) {
      setError(translateAuthError(error.message));
      setCaptchaToken(null);
      captchaRef.current?.reset();
      return;
    }
    trackEvent('sign_up', { method: 'email' });
    setRegisteredEmail(email);
    setDone(true);
  }

  async function onResend() {
    if (!registeredEmail) return;
    setResending(true);
    setResent(false);
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}` },
    });
    setResending(false);
    setResent(true);
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Confira seu e-mail</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para <strong>{registeredEmail}</strong>. Clique nele para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full"><Link href="/auth/login">Voltar ao login</Link></Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onResend}
            disabled={resending || resent}
          >
            {resending ? 'Reenviando...' : resent ? 'E-mail reenviado!' : 'Reenviar e-mail de confirmação'}
          </Button>
          {resent && (
            <p className="text-center text-sm text-muted-foreground">
              Verifique também a pasta de spam.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Comece a usar iOrganiza Hub em segundos.</CardDescription>
      </CardHeader>
      <CardContent>
        <GoogleSignInButton redirectTo={safeRedirect} />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Ao continuar com Google, você concorda com nossa{' '}
          <Link href="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link>
          {' '}e os{' '}
          <Link href="/termos" target="_blank" className="text-primary underline">Termos de Uso</Link>.
        </p>
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">ou cadastre com e-mail</span>
          </div>
        </div>
        <form onSubmit={onSubmit} method="post" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome completo</Label>
            <Input id="full_name" name="full_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" minLength={8} required />
          </div>
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="consent"
              name="consent"
              required
              className="mt-0.5 h-4 w-4 shrink-0 rounded border border-input accent-primary"
            />
            <label htmlFor="consent" className="text-sm text-muted-foreground leading-snug">
              Li e concordo com a{' '}
              <Link href="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link>
              {' '}e os{' '}
              <Link href="/termos" target="_blank" className="text-primary underline">Termos de Uso</Link>
            </label>
          </div>
          <Turnstile
            ref={captchaRef}
            onVerify={setCaptchaToken}
            onExpire={() => setCaptchaToken(null)}
            className="flex justify-center"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || (turnstileEnabled && !captchaToken)}>
            {loading ? 'Criando...' : 'Criar conta'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <Link
            href={safeRedirect !== '/dashboard' ? `/auth/login?redirect=${encodeURIComponent(safeRedirect)}` : '/auth/login'}
            className="text-primary hover:underline"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}
