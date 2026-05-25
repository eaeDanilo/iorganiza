import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/icobra/PageHeader";
import { ResumoCards } from "@/components/icobra/dashboard/ResumoCards";
import { InadimplentesDestaque } from "@/components/icobra/dashboard/InadimplentesDestaque";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { calcularStatusParcela, diasEntreDatas, hoje } from "@/lib/icobra/calculos";
import type { Emprestimo, InadimplenteItem, Parcela, ResumoDashboard } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

export default async function ICobraPage() {
  const user = (await getCurrentUser())!;
  const userId = user.id;
  const supabase = createICobraServiceClient();

  const [{ data: emprestimos }, { data: parcelas }] = await Promise.all([
    supabase.from("emprestimos").select("*").eq("user_id", userId).is("deleted_at", null),
    supabase.from("parcelas").select("*, emprestimos(nome_pessoa, deleted_at)").eq("user_id", userId),
  ]);

  type ParcelaComEmp = Parcela & { emprestimos: { nome_pessoa: string; deleted_at: string | null } };
  const parcelasAtivas = ((parcelas as ParcelaComEmp[]) ?? []).filter((p) => !p.emprestimos?.deleted_at);

  const resumo = calcularResumo(
    (emprestimos as Emprestimo[]) ?? [],
    parcelasAtivas
  );

  const topInadimplentes = montarInadimplentes(parcelasAtivas).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="iCobra"
        description="Painel de controle de empréstimos e cobranças."
        action={
          <Button asChild>
            <Link href="/dashboard/icobra/emprestimos/novo">
              <Plus className="mr-2 h-5 w-5" />
              Novo empréstimo
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        <ResumoCards resumo={resumo} />
        <InadimplentesDestaque itens={topInadimplentes} />
      </div>
    </div>
  );
}

function calcularResumo(
  emprestimos: Emprestimo[],
  parcelas: (Parcela & { emprestimos: { nome_pessoa: string } })[]
): ResumoDashboard {
  const totalEmprestado = emprestimos.reduce((acc, e) => acc + Number(e.valor_emprestado), 0);
  let totalRecebido = 0, totalAReceber = 0, totalEmAtraso = 0, numeroInadimplentes = 0;

  for (const p of parcelas) {
    const valor = Number(p.valor);
    const status = calcularStatusParcela(p.data_vencimento, p.data_pagamento);
    if (status === "pago") {
      totalRecebido += valor;
    } else {
      totalAReceber += valor;
      if (status === "atrasado") {
        totalEmAtraso += valor;
        numeroInadimplentes += 1;
      }
    }
  }

  return { total_emprestado: totalEmprestado, total_recebido: totalRecebido, total_a_receber: totalAReceber, total_em_atraso: totalEmAtraso, numero_inadimplentes: numeroInadimplentes };
}

function montarInadimplentes(
  parcelas: (Parcela & { emprestimos: { nome_pessoa: string } })[]
): InadimplenteItem[] {
  const dataHoje = hoje();
  const items: InadimplenteItem[] = [];

  for (const p of parcelas) {
    if (calcularStatusParcela(p.data_vencimento, p.data_pagamento) !== "atrasado") continue;
    items.push({
      parcela_id: p.id,
      emprestimo_id: p.emprestimo_id,
      nome_pessoa: p.emprestimos.nome_pessoa,
      valor: Number(p.valor),
      data_vencimento: p.data_vencimento,
      dias_atraso: diasEntreDatas(p.data_vencimento, dataHoje),
    });
  }

  return items.sort((a, b) => b.dias_atraso - a.dias_atraso);
}
