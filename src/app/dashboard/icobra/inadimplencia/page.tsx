import { PageHeader } from "@/components/icobra/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { InadimplenciaCliente } from "./InadimplenciaCliente";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { calcularStatusParcela, diasEntreDatas, hoje } from "@/lib/icobra/calculos";
import { formatCurrency } from "@/lib/utils";
import type { InadimplenteItem, Parcela } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

export default async function InadimplenciaPage() {
  const user = (await getCurrentUser())!;
  const supabase = createICobraServiceClient();

  const { data: parcelas } = await supabase
    .from("parcelas")
    .select("*, emprestimos(nome_pessoa, deleted_at)")
    .eq("user_id", user.id)
    .is("data_pagamento", null);

  const dataHoje = hoje();
  const items: InadimplenteItem[] = [];

  type ParcelaComEmp = Parcela & { emprestimos: { nome_pessoa: string; deleted_at: string | null } };
  const parcelasAtivas = ((parcelas as ParcelaComEmp[]) ?? []).filter((p) => !p.emprestimos?.deleted_at);

  for (const p of parcelasAtivas) {
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

  items.sort((a, b) => b.dias_atraso - a.dias_atraso);

  const totalAtraso = items.reduce((acc, i) => acc + i.valor, 0);
  const numDevedores = new Set(items.map((i) => i.emprestimo_id)).size;

  return (
    <div>
      <PageHeader title="Inadimplência" description="Parcelas que passaram da data de vencimento." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total inadimplente</p>
            <p className="mt-2 text-3xl font-bold tabular-nums text-destructive">{formatCurrency(totalAtraso)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Devedores em atraso</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{numDevedores}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "parcela" : "parcelas"} em atraso
            </p>
          </CardContent>
        </Card>
      </div>

      <InadimplenciaCliente items={items} />
    </div>
  );
}
