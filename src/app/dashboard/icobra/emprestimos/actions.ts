"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createICobraServiceClient } from "@/lib/icobra/supabase";
import { calcularEmprestimo } from "@/lib/icobra/calculos";
import { assertEmprestimoLimit } from "@/lib/limits";
import type { EmprestimoFormData } from "@/lib/icobra/types";

async function getUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

export async function criarEmprestimo(data: EmprestimoFormData) {
  const userId = await getUserId();
  await assertEmprestimoLimit(userId);
  const supabase = createICobraServiceClient();
  const calculo = calcularEmprestimo(data);

  const { data: emprestimo, error } = await supabase
    .from("emprestimos")
    .insert({
      user_id: userId,
      nome_pessoa: data.nome_pessoa.trim(),
      valor_emprestado: data.valor_emprestado,
      tipo_retorno: data.tipo_retorno,
      percentual: data.tipo_retorno === "percentual" ? data.percentual : null,
      frequencia: data.frequencia,
      numero_parcelas: data.numero_parcelas,
      data_primeiro_pagamento: data.data_primeiro_pagamento,
      dias_pagamento: data.dias_pagamento,
      valor_parcela: calculo.valor_parcela,
      total_a_receber: calculo.total_a_receber,
      lucro: calculo.lucro,
      status: "ativo",
    })
    .select()
    .single();

  if (error || !emprestimo) {
    throw new Error("Não foi possível salvar o empréstimo: " + (error?.message ?? "erro desconhecido"));
  }

  const parcelas = calculo.datas_vencimento.map((dataVenc, i) => ({
    emprestimo_id: emprestimo.id,
    user_id: userId,
    numero: i + 1,
    data_vencimento: dataVenc,
    valor: calculo.valor_parcela,
    status: "pendente" as const,
  }));

  const { error: errParcelas } = await supabase.from("parcelas").insert(parcelas);
  if (errParcelas) {
    await supabase.from("emprestimos").delete().eq("id", emprestimo.id);
    throw new Error("Não foi possível gerar as parcelas: " + errParcelas.message);
  }

  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  return emprestimo.id;
}

export async function editarEmprestimo(id: string, data: EmprestimoFormData) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const calculo = calcularEmprestimo(data);

  const { error: errUpdate } = await supabase
    .from("emprestimos")
    .update({
      nome_pessoa: data.nome_pessoa.trim(),
      valor_emprestado: data.valor_emprestado,
      tipo_retorno: data.tipo_retorno,
      percentual: data.tipo_retorno === "percentual" ? data.percentual : null,
      frequencia: data.frequencia,
      numero_parcelas: data.numero_parcelas,
      data_primeiro_pagamento: data.data_primeiro_pagamento,
      dias_pagamento: data.dias_pagamento,
      valor_parcela: calculo.valor_parcela,
      total_a_receber: calculo.total_a_receber,
      lucro: calculo.lucro,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (errUpdate) throw new Error("Não foi possível atualizar: " + errUpdate.message);

  const { data: parcelasExistentes } = await supabase
    .from("parcelas")
    .select("*")
    .eq("emprestimo_id", id)
    .order("numero");

  const pagas = (parcelasExistentes ?? []).filter((p) => p.data_pagamento);
  const numerosPagos = new Set(pagas.map((p) => p.numero));

  await supabase.from("parcelas").delete().eq("emprestimo_id", id).is("data_pagamento", null);

  const novasParcelas = calculo.datas_vencimento
    .map((dataVenc, i) => {
      const numero = i + 1;
      if (numerosPagos.has(numero)) return null;
      return {
        emprestimo_id: id,
        user_id: userId,
        numero,
        data_vencimento: dataVenc,
        valor: calculo.valor_parcela,
        status: "pendente" as const,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  if (novasParcelas.length > 0) {
    const { error: errIns } = await supabase.from("parcelas").insert(novasParcelas);
    if (errIns) throw new Error("Não foi possível regerar as parcelas: " + errIns.message);
  }

  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath(`/dashboard/icobra/emprestimos/${id}`);
}

export async function deletarEmprestimo(id: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const { error } = await supabase.from("emprestimos").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error("Não foi possível excluir: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
}

export async function marcarParcelaPaga(parcelaId: string, dataPagamento: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const { error } = await supabase
    .from("parcelas")
    .update({ data_pagamento: dataPagamento, status: "pago" })
    .eq("id", parcelaId)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível registrar o pagamento: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath("/dashboard/icobra/inadimplencia");
}

export async function desmarcarParcelaPaga(parcelaId: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const { error } = await supabase
    .from("parcelas")
    .update({ data_pagamento: null, status: "pendente" })
    .eq("id", parcelaId)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível desmarcar: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
}
