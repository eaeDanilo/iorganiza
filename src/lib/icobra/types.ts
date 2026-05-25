export type TipoRetorno = "valor_fixo" | "percentual";
export type Frequencia = "diario" | "semanal" | "mensal";
export type DiasPagamento = "todos_dias" | "dias_uteis";
export type EmprestimoStatus = "ativo" | "quitado";
export type ParcelaStatus = "pendente" | "pago" | "atrasado";

export interface Emprestimo {
  id: string;
  user_id: string;
  nome_pessoa: string;
  valor_emprestado: number;
  tipo_retorno: TipoRetorno;
  percentual: number | null;
  frequencia: Frequencia;
  numero_parcelas: number;
  data_primeiro_pagamento: string;
  dias_pagamento: DiasPagamento;
  valor_parcela: number;
  total_a_receber: number;
  lucro: number;
  status: EmprestimoStatus;
  created_at: string;
  deleted_at: string | null;
}

export interface Parcela {
  id: string;
  emprestimo_id: string;
  user_id: string;
  numero: number;
  data_vencimento: string;
  data_pagamento: string | null;
  valor: number;
  status: ParcelaStatus;
  created_at: string;
}

export interface EmprestimoComParcelas extends Emprestimo {
  parcelas: Parcela[];
}

export interface EmprestimoFormData {
  nome_pessoa: string;
  valor_emprestado: number;
  tipo_retorno: TipoRetorno;
  percentual?: number;
  valor_parcela_input?: number;
  frequencia: Frequencia;
  numero_parcelas: number;
  data_primeiro_pagamento: string;
  dias_pagamento: DiasPagamento;
}

export interface CalculoResultado {
  valor_parcela: number;
  total_a_receber: number;
  lucro: number;
  datas_vencimento: string[];
}

export interface ResumoDashboard {
  total_emprestado: number;
  total_recebido: number;
  total_a_receber: number;
  total_em_atraso: number;
  numero_inadimplentes: number;
}

export interface InadimplenteItem {
  parcela_id: string;
  emprestimo_id: string;
  nome_pessoa: string;
  valor: number;
  data_vencimento: string;
  dias_atraso: number;
}
