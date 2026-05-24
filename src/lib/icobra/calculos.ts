import { addDays, addMonths, format } from "date-fns";
import type {
  CalculoResultado,
  DiasPagamento,
  EmprestimoFormData,
  Frequencia,
  TipoRetorno,
} from "./types";

export function hoje(): string {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

export function diasEntreDatas(de: string | Date, ate: string | Date): number {
  const d1 = typeof de === "string" ? new Date(de + "T00:00:00") : de;
  const d2 = typeof ate === "string" ? new Date(ate + "T00:00:00") : ate;
  const diff = d2.getTime() - d1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function ajustarParaDiaUtil(date: Date): Date {
  const day = date.getDay();
  if (day === 6) return addDays(date, 2);
  if (day === 0) return addDays(date, 1);
  return date;
}

export function gerarDatasVencimento(
  dataPrimeiroPagamento: string,
  frequencia: Frequencia,
  numeroParcelas: number,
  diasPagamento: DiasPagamento
): string[] {
  const datas: string[] = [];
  const baseDate = new Date(dataPrimeiroPagamento + "T00:00:00");

  for (let i = 0; i < numeroParcelas; i++) {
    let proxima: Date;
    if (frequencia === "diario") {
      proxima = addDays(baseDate, i);
    } else if (frequencia === "semanal") {
      proxima = addDays(baseDate, i * 7);
    } else {
      proxima = addMonths(baseDate, i);
    }

    if (diasPagamento === "dias_uteis") {
      proxima = ajustarParaDiaUtil(proxima);
    }

    datas.push(format(proxima, "yyyy-MM-dd"));
  }

  return datas;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcularValorParcela(
  tipo: TipoRetorno,
  valorEmprestado: number,
  numeroParcelas: number,
  percentual?: number,
  valorParcelaInput?: number
): number {
  if (tipo === "valor_fixo") {
    return round2(valorParcelaInput ?? 0);
  }
  const pct = percentual ?? 0;
  const total = valorEmprestado * (1 + pct / 100);
  return round2(total / numeroParcelas);
}

export function calcularEmprestimo(data: EmprestimoFormData): CalculoResultado {
  const valorParcela = calcularValorParcela(
    data.tipo_retorno,
    data.valor_emprestado,
    data.numero_parcelas,
    data.percentual,
    data.valor_parcela_input
  );

  const totalAReceber = round2(valorParcela * data.numero_parcelas);
  const lucro = round2(totalAReceber - data.valor_emprestado);

  const datas =
    data.data_primeiro_pagamento && data.numero_parcelas > 0
      ? gerarDatasVencimento(
          data.data_primeiro_pagamento,
          data.frequencia,
          data.numero_parcelas,
          data.dias_pagamento
        )
      : [];

  return { valor_parcela: valorParcela, total_a_receber: totalAReceber, lucro, datas_vencimento: datas };
}

export function calcularStatusParcela(
  dataVencimento: string,
  dataPagamento: string | null
): "pendente" | "pago" | "atrasado" {
  if (dataPagamento) return "pago";
  const dataHoje = hoje();
  if (dataVencimento < dataHoje) return "atrasado";
  return "pendente";
}
