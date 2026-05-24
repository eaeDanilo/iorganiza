"use client";

import { useMemo } from "react";
import { calcularEmprestimo } from "@/lib/icobra/calculos";
import type { CalculoResultado, EmprestimoFormData } from "@/lib/icobra/types";

export function useCalculoEmprestimo(
  data: Partial<EmprestimoFormData>
): CalculoResultado | null {
  return useMemo(() => {
    if (
      !data.valor_emprestado ||
      !data.numero_parcelas ||
      !data.tipo_retorno ||
      !data.frequencia ||
      !data.dias_pagamento ||
      !data.data_primeiro_pagamento
    ) {
      return null;
    }

    if (data.tipo_retorno === "valor_fixo" && !data.valor_parcela_input) return null;
    if (data.tipo_retorno === "percentual" && data.percentual === undefined) return null;

    return calcularEmprestimo(data as EmprestimoFormData);
  }, [data]);
}
