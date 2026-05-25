import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/icobra/PageHeader";
import { EmprestimoStatusBadge } from "@/components/icobra/StatusBadge";
import { ParcelaTabelaWrapper } from "./ParcelaTabelaWrapper";
import { ExcluirBotao } from "./ExcluirBotao";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { calcularStatusParcela } from "@/lib/icobra/calculos";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Emprestimo, Parcela } from "@/lib/icobra/types";

export const dynamic = "force-dynamic";

const FREQUENCIA_LABEL: Record<string, string> = {
  diario: "Diário",
  semanal: "Semanal",
  mensal: "Mensal",
};

export default async function EmprestimoDetalhesPage({ params }: { params: { id: string } }) {
  const user = (await getCurrentUser())!;
  const supabase = createICobraServiceClient();

  const { data: emprestimo } = await supabase
    .from("emprestimos")
    .select("*, parcelas(*)")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single();

  if (!emprestimo) notFound();

  const e = emprestimo as Emprestimo & { parcelas: Parcela[] };
  const parcelas = e.parcelas ?? [];
  const pagas = parcelas.filter((p) => p.data_pagamento);
  const totalRecebido = pagas.reduce((acc, p) => acc + Number(p.valor), 0);
  const temAtraso = parcelas.some(
    (p) => calcularStatusParcela(p.data_vencimento, p.data_pagamento) === "atrasado"
  );

  return (
    <div>
      <PageHeader
        title={e.nome_pessoa}
        description={`Cadastrado em ${formatDate(e.created_at.slice(0, 10))}`}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/dashboard/icobra/emprestimos/${e.id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <ExcluirBotao id={e.id} nome={e.nome_pessoa} />
          </div>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Valor emprestado" value={formatCurrency(Number(e.valor_emprestado))} />
        <InfoCard label="Total a receber" value={formatCurrency(Number(e.total_a_receber))} />
        <InfoCard label="Recebido até agora" value={formatCurrency(totalRecebido)} color="text-success" />
        <InfoCard label="Lucro previsto" value={formatCurrency(Number(e.lucro))} color="text-success" />
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Detalhes do empréstimo
            <EmprestimoStatusBadge status={e.status} temAtraso={temAtraso} />
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Linha label="Tipo de retorno" value={e.tipo_retorno === "valor_fixo" ? "Valor fixo" : `${e.percentual}% sobre o valor`} />
          <Linha label="Valor da parcela" value={formatCurrency(Number(e.valor_parcela))} />
          <Linha label="Frequência" value={FREQUENCIA_LABEL[e.frequencia]} />
          <Linha label="Total de parcelas" value={`${pagas.length} de ${e.numero_parcelas} pagas`} />
          <Linha label="Primeiro pagamento" value={formatDate(e.data_primeiro_pagamento)} />
          <Linha label="Dias permitidos" value={e.dias_pagamento === "todos_dias" ? "Todos os dias" : "Apenas dias úteis"} />
        </CardContent>
      </Card>

      <h2 className="mb-4 text-2xl font-semibold">Parcelas</h2>
      <ParcelaTabelaWrapper parcelas={parcelas} />
    </div>
  );
}

function InfoCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`mt-2 text-xl font-bold tabular-nums ${color ?? ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}

function Linha({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b pb-2 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
