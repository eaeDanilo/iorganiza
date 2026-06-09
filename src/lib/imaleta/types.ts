export interface Produto {
  id: string;
  user_id: string;
  nome: string;
  descricao: string | null;
  codigo_barras: string;
  preco: number | null;
  imagem_url: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Vendedor {
  id: string;
  user_id: string;
  nome: string;
  telefone: string | null;
  email: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Maleta {
  id: string;
  user_id: string;
  vendedor_id: string;
  nome: string;
  periodo_inicio: string;
  periodo_fim: string | null;
  status: "aberta" | "em_conferencia" | "conferida";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  vendedores?: { nome: string };
}

export interface MaletaItem {
  id: string;
  maleta_id: string;
  produto_id: string;
  quantidade: number;
  created_at: string;
  produtos?: { nome: string; codigo_barras: string; preco: number | null };
}

export interface Conferencia {
  id: string;
  maleta_id: string;
  user_id: string;
  observacoes: string | null;
  status: "em_andamento" | "finalizada";
  created_at: string;
  finalizada_at: string | null;
  deleted_at: string | null;
  maletas?: {
    nome: string;
    periodo_inicio: string;
    periodo_fim: string | null;
    vendedores?: { nome: string };
  };
}

export interface ConferenciaItem {
  id: string;
  conferencia_id: string;
  produto_id: string;
  quantidade_retornada: number;
  created_at: string;
  produtos?: { nome: string; codigo_barras: string; preco: number | null };
}
