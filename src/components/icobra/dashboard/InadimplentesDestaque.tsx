import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { InadimplenteItem } from "@/lib/icobra/types";

export function InadimplentesDestaque({ itens }: { itens: InadimplenteItem[] }) {
  return (
    <div className="rounded-xl bg-white/[0.04] ring-1 ring-white/[0.07]">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Inadimplentes</h2>
        {itens.length > 0 && (
          <Link
            href="/dashboard/icobra/inadimplencia"
            className="flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-[#00C853]"
          >
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="border-t border-white/[0.06]">
        {itens.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#00C853]">Nenhuma parcela em atraso</p>
            <p className="mt-1 text-xs text-white/30">Tudo em dia.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.05]">
            {itens.map((item) => (
              <li key={item.parcela_id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/icobra/emprestimos/${item.emprestimo_id}`}
                    className="block truncate text-sm font-medium text-white hover:text-[#00C853] transition-colors"
                  >
                    {item.nome_pessoa}
                  </Link>
                  <p className="text-xs text-white/35">
                    {item.dias_atraso} {item.dias_atraso === 1 ? "dia" : "dias"} em atraso
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-red-400">
                    {formatCurrency(item.valor)}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                    item.dias_atraso > 7
                      ? "bg-red-500/15 text-red-400"
                      : "bg-yellow-500/15 text-yellow-400"
                  }`}>
                    {item.dias_atraso > 7 ? "Crítico" : "Recente"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
