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

  // Verifica ownership antes de qualquer operação em parcelas
  const { data: owner } = await supabase
    .from("emprestimos")
    .select("id")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!owner) throw new Error("Empréstimo não encontrado.");

  const calculo = calcularEmprestimo(data);

  const { data: parcelasExistentes } = await supabase
    .from("parcelas")
    .select("*")
    .eq("emprestimo_id", id)
    .eq("user_id", userId)
    .order("numero");

  const pagas = (parcelasExistentes ?? []).filter((p) => p.data_pagamento);
  const totalPago = pagas.reduce((acc, p) => acc + Number(p.valor), 0);
  const parcelasNaoPageasCount = data.numero_parcelas - pagas.length;
  const totalAReceber = totalPago + Math.max(0, parcelasNaoPageasCount) * calculo.valor_parcela;
  const lucro = totalAReceber - data.valor_emprestado;

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
      total_a_receber: totalAReceber,
      lucro,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (errUpdate) throw new Error("Não foi possível atualizar: " + errUpdate.message);
  const numerosPagos = new Set(pagas.map((p) => p.numero));

  await supabase.from("parcelas").delete().eq("emprestimo_id", id).eq("user_id", userId).is("data_pagamento", null);

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
  const { error } = await supabase
    .from("emprestimos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível excluir: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath("/dashboard/icobra/lixeira");
}

export async function restaurarEmprestimo(id: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const { error } = await supabase
    .from("emprestimos")
    .update({ deleted_at: null })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível restaurar: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath("/dashboard/icobra/lixeira");
}

export async function deletarEmprestimoPermanente(id: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();
  const { error } = await supabase.from("emprestimos").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error("Não foi possível excluir permanentemente: " + error.message);
  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath("/dashboard/icobra/lixeira");
}

export async function marcarParcelaPaga(parcelaId: string, dataPagamento: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();

  const { data: parcela } = await supabase
    .from("parcelas")
    .select("emprestimo_id")
    .eq("id", parcelaId)
    .eq("user_id", userId)
    .single();
  if (!parcela) throw new Error("Parcela não encontrada.");

  const { error } = await supabase
    .from("parcelas")
    .update({ data_pagamento: dataPagamento, status: "pago" })
    .eq("id", parcelaId)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível registrar o pagamento: " + error.message);

  const [{ count: total }, { count: pagas }] = await Promise.all([
    supabase
      .from("parcelas")
      .select("id", { count: "exact", head: true })
      .eq("emprestimo_id", parcela.emprestimo_id),
    supabase
      .from("parcelas")
      .select("id", { count: "exact", head: true })
      .eq("emprestimo_id", parcela.emprestimo_id)
      .not("data_pagamento", "is", null),
  ]);

  if (total !== null && pagas !== null && pagas >= total) {
    await supabase
      .from("emprestimos")
      .update({ status: "quitado" })
      .eq("id", parcela.emprestimo_id)
      .eq("user_id", userId);
  }

  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath(`/dashboard/icobra/emprestimos/${parcela.emprestimo_id}`);
  revalidatePath("/dashboard/icobra/inadimplencia");
}

export async function desmarcarParcelaPaga(parcelaId: string) {
  const userId = await getUserId();
  const supabase = createICobraServiceClient();

  const { data: parcela } = await supabase
    .from("parcelas")
    .select("emprestimo_id")
    .eq("id", parcelaId)
    .eq("user_id", userId)
    .single();
  if (!parcela) throw new Error("Parcela não encontrada.");

  const { error } = await supabase
    .from("parcelas")
    .update({ data_pagamento: null, status: "pendente" })
    .eq("id", parcelaId)
    .eq("user_id", userId);
  if (error) throw new Error("Não foi possível desmarcar: " + error.message);

  await supabase
    .from("emprestimos")
    .update({ status: "ativo" })
    .eq("id", parcela.emprestimo_id)
    .eq("user_id", userId)
    .eq("status", "quitado");

  revalidatePath("/dashboard/icobra");
  revalidatePath("/dashboard/icobra/emprestimos");
  revalidatePath(`/dashboard/icobra/emprestimos/${parcela.emprestimo_id}`);
  revalidatePath("/dashboard/icobra/inadimplencia");
}
