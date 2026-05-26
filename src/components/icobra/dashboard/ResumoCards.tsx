import { AlertCircle, ArrowDownToLine, HandCoins, TrendingUp } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { ResumoDashboard } from "@/lib/icobra/types";

const CARDS: Array<{
  key: keyof Omit<ResumoDashboard, "numero_inadimplentes">;
  label: string;
  icon: typeof HandCoins;
  iconClass: string;
  accent?: boolean;
}> = [
  { key: "total_emprestado", label: "Total emprestado", icon: HandCoins, iconClass: "text-[#00C853]" },
  { key: "total_recebido", label: "Total recebido", icon: ArrowDownToLine, iconClass: "text-[#00C853]" },
  { key: "total_a_receber", label: "A receber", icon: TrendingUp, iconClass: "text-yellow-400" },
  { key: "total_em_atraso", label: "Em atraso", icon: AlertCircle, iconClass: "text-red-400", accent: true },
];

export function ResumoCards({ resumo }: { resumo: ResumoDashboard }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {CARDS.map((c) => {
        const Icon = c.icon;
        const isAtraso = c.key === "total_em_atraso";
        const hasAtraso = isAtraso && resumo.numero_inadimplentes > 0;
        return (
          <div
            key={c.key}
            className={cn(
              "rounded-xl p-5 ring-1",
              hasAtraso
                ? "bg-red-500/[0.06] ring-red-500/20"
                : "bg-white/[0.04] ring-white/[0.07]",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-white/40">{c.label}</p>
              <Icon className={cn("h-4 w-4 shrink-0", c.iconClass)} />
            </div>
            <p className={cn(
              "mt-3 text-2xl font-bold tabular-nums",
              hasAtraso ? "text-red-400" : "text-white"
            )}>
              {formatCurrency(resumo[c.key])}
            </p>
            {isAtraso && resumo.numero_inadimplentes > 0 && (
              <p className="mt-1 text-xs text-red-400/70">
                {resumo.numero_inadimplentes}{" "}
                {resumo.numero_inadimplentes === 1 ? "parcela atrasada" : "parcelas atrasadas"}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
