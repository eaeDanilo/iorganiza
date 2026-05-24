import { AlertCircle, ArrowDownToLine, HandCoins, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import type { ResumoDashboard } from "@/lib/icobra/types";

const CARDS: Array<{
  key: keyof Omit<ResumoDashboard, "numero_inadimplentes">;
  label: string;
  icon: typeof HandCoins;
  className: string;
}> = [
  { key: "total_emprestado", label: "Total emprestado", icon: HandCoins, className: "bg-primary/10 text-primary" },
  { key: "total_recebido", label: "Total recebido", icon: ArrowDownToLine, className: "bg-success/10 text-success" },
  { key: "total_a_receber", label: "Total a receber", icon: TrendingUp, className: "bg-yellow-500/10 text-yellow-400" },
  { key: "total_em_atraso", label: "Total em atraso", icon: AlertCircle, className: "bg-destructive/10 text-destructive" },
];

export function ResumoCards({ resumo }: { resumo: ResumoDashboard }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.key}>
            <CardContent className="flex items-start justify-between gap-3 p-4 sm:p-6">
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{c.label}</p>
                <p className="mt-2 text-xl font-bold tabular-nums sm:text-2xl">{formatCurrency(resumo[c.key])}</p>
                {c.key === "total_em_atraso" && resumo.numero_inadimplentes > 0 && (
                  <p className="mt-1 text-sm text-destructive">
                    {resumo.numero_inadimplentes}{" "}
                    {resumo.numero_inadimplentes === 1 ? "parcela atrasada" : "parcelas atrasadas"}
                  </p>
                )}
              </div>
              <div className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", c.className)}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
