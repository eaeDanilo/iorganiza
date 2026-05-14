// Paywall — bloco que aparece quando usuário não tem entitlement.
// SaaS filho renderiza no lugar do conteúdo protegido.

'use client';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './components';

export interface PaywallProps {
  saasName: string;
  saasId: string;
  hubUrl?: string;
  status?: 'canceled' | 'pending' | 'expired' | null;
}

export function Paywall({ saasName, saasId, hubUrl = 'http://localhost:3000', status }: PaywallProps) {
  const message =
    status === 'canceled' ? 'Sua assinatura foi cancelada.' :
    status === 'expired' ? 'Sua assinatura expirou.' :
    status === 'pending' ? 'Pagamento ainda em processamento.' :
    'Você ainda não assina este SaaS.';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Acesso bloqueado</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assine <strong>{saasName}</strong> no iOrganiza Hub para liberar o acesso.
          </p>
          <Button asChild className="w-full">
            <a href={`${hubUrl}/checkout/${saasId}`}>Assinar {saasName}</a>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <a href={`${hubUrl}/dashboard`}>Voltar ao Hub</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
