"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcularEmprestimo } from "@/lib/icobra/calculos";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { EmprestimoFormData } from "@/lib/icobra/types";

const FREQUENCIA_LABEL: Record<string, string> = {
  diario: "Diário",
  semanal: "Semanal",
  mensal: "Mensal",
};

const DIAS_PAGAMENTO_LABEL: Record<string, string> = {
  todos_dias: "Todos os dias",
  dias_uteis: "Apenas dias úteis",
};

interface EmprestimoRevisaoProps {
  data: EmprestimoFormData;
  onConfirm: () => Promise<void>;
  onVoltar: () => void;
}

export function EmprestimoRevisao({ data, onConfirm, onVoltar }: EmprestimoRevisaoProps) {
  const [salvando, setSalvando] = useState(false);
  const calculo = calcularEmprestimo(data);

  async function handleConfirm() {
    setSalvando(true);
    try {
      await onConfirm();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Confira os dados antes de salvar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Section titulo="Devedor">
            <Linha label="Nome" value={data.nome_pessoa} />
          </Section>

          <Section titulo="Valores">
            <Linha label="Valor emprestado" value={formatCurrency(data.valor_emprestado)} />
            <Linha
              label="Tipo de retorno"
              value={data.tipo_retorno === "valor_fixo" ? "Valor fixo da parcela" : `${data.percentual}% sobre o valor`}
            />
            <Linha label="Valor de cada parcela" value={formatCurrency(calculo.valor_parcela)} destaque />
            <Linha label="Total a receber" value={formatCurrency(calculo.total_a_receber)} />
            <Linha label="Lucro" value={formatCurrency(calculo.lucro)} className="text-success" />
          </Section>

          <Section titulo="Parcelamento">
            <Linha label="Frequência" value={FREQUENCIA_LABEL[data.frequencia]} />
            <Linha label="Quantidade de parcelas" value={String(data.numero_parcelas)} />
            <Linha label="Primeiro pagamento" value={formatDate(data.data_primeiro_pagamento)} />
            <Linha label="Dias permitidos" value={DIAS_PAGAMENTO_LABEL[data.dias_pagamento]} />
            <Linha
              label="Último pagamento"
              value={formatDate(calculo.datas_vencimento[calculo.datas_vencimento.length - 1])}
            />
          </Section>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" size="lg" className="flex-1" onClick={onVoltar} disabled={salvando}>
          Voltar e editar
        </Button>
        <Button size="lg" className="flex-1" onClick={handleConfirm} disabled={salvando}>
          {salvando ? "Salvando..." : "Confirmar e salvar"}
        </Button>
      </div>
    </div>
  );
}

function Section({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-base font-semibold uppercase tracking-wide text-muted-foreground">{titulo}</h3>
      <div className="space-y-2 rounded-md border bg-muted/30 p-4">{children}</div>
    </div>
  );
}

function Linha({ label, value, destaque, className }: { label: string; value: string; destaque?: boolean; className?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-right tabular-nums ${destaque ? "text-lg font-bold text-primary" : "font-medium"} ${className ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
