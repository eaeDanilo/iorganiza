'use client';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { Saas } from '@/types/database';

export function SaasCard({ saas, hasAccess = false }: { saas: Saas; hasAccess?: boolean }) {
  const router = useRouter();
  const isActive = saas.status === 'active';

  function goDetail(e?: React.MouseEvent) {
    e?.stopPropagation();
    router.push(`/saas/${saas.slug}`);
  }

  function goCheckout(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isActive) return;
    router.push(`/checkout/${saas.id}`);
  }

  return (
    <Card
      onClick={() => goDetail()}
      className="group flex cursor-pointer flex-col overflow-hidden border-border bg-card transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-lg hover:shadow-primary/20"
    >
      <div
        className="h-32 bg-gradient-to-br from-primary/40 to-secondary/40"
        style={saas.banner_url ? { backgroundImage: `url(${saas.banner_url})`, backgroundSize: 'cover' } : undefined}
      />
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{saas.name}</CardTitle>
          {!isActive && <Badge variant="outline">Indisponível</Badge>}
        </div>
        <CardDescription className="line-clamp-2">{saas.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {Array.isArray(saas.features) && saas.features.length > 0 && (
          <ul className="space-y-1 text-sm text-muted-foreground">
            {saas.features.slice(0, 3).map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-success">✓</span>
                <span className="line-clamp-1">{f}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(saas.price_monthly)}</p>
          <p className="text-xs text-muted-foreground">/mês</p>
        </div>
        <div className="flex items-center gap-2">
          {saas.trial_enabled && !hasAccess && (
            <a
              href={`/trial/${saas.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Testar
            </a>
          )}
          <Button variant="outline" size="sm" onClick={goDetail}>
            Detalhes
          </Button>
          <Button size="sm" disabled={!isActive} onClick={goCheckout}>
            Assinar
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
