import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { InadimplenteItem } from "@/lib/icobra/types";

export function InadimplentesDestaque({ itens }: { itens: InadimplenteItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Top inadimplentes</CardTitle>
        {itens.length > 0 && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/icobra/inadimplencia">
              Ver todos
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {itens.length === 0 ? (
          <div className="rounded-md bg-success/10 p-6 text-center text-success">
            <p className="text-base font-medium">Nenhuma parcela em atraso!</p>
          </div>
        ) : (
          <ul className="divide-y">
            {itens.map((item) => (
              <li key={item.parcela_id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/icobra/emprestimos/${item.emprestimo_id}`}
                    className="block truncate text-base font-medium hover:underline"
                  >
                    {item.nome_pessoa}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {item.dias_atraso} {item.dias_atraso === 1 ? "dia" : "dias"} de atraso
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-base font-bold text-destructive tabular-nums">
                    {formatCurrency(item.valor)}
                  </span>
                  <Badge variant={item.dias_atraso > 7 ? "destructive" : "warning"}>
                    {item.dias_atraso > 7 ? "Crítico" : "Recente"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
