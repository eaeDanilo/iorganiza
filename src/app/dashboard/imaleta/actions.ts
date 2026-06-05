"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";

async function getUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

function gerarCodigoBarras(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IML";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ─── Vendedores ──────────────────────────────────────────────────────────────

export async function criarVendedor(data: {
  nome: string;
  telefone?: string;
  email?: string;
}) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase.from("vendedores").insert({
    user_id: userId,
    nome: data.nome.trim(),
    telefone: data.telefone?.trim() || null,
    email: data.email?.trim() || null,
  });
  if (error) throw new Error("Erro ao criar vendedor: " + error.message);
  revalidatePath("/dashboard/imaleta/vendedores");
}

export async function atualizarVendedor(
  id: string,
  data: { nome: string; telefone?: string; email?: string }
) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("vendedores")
    .update({
      nome: data.nome.trim(),
      telefone: data.telefone?.trim() || null,
      email: data.email?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao atualizar vendedor: " + error.message);
  revalidatePath("/dashboard/imaleta/vendedores");
}

export async function excluirVendedor(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("vendedores")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao excluir vendedor: " + error.message);
  revalidatePath("/dashboard/imaleta/vendedores");
}

// ─── Produtos ────────────────────────────────────────────────────────────────

export async function criarProduto(data: {
  nome: string;
  descricao?: string;
  preco?: number;
  codigo_barras?: string;
}) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const codigo = data.codigo_barras?.trim() || gerarCodigoBarras();
  const { error } = await supabase.from("produtos").insert({
    user_id: userId,
    nome: data.nome.trim(),
    descricao: data.descricao?.trim() || null,
    preco: data.preco ?? null,
    codigo_barras: codigo,
  });
  if (error) throw new Error("Erro ao criar produto: " + error.message);
  revalidatePath("/dashboard/imaleta/produtos");
}

export async function atualizarProduto(
  id: string,
  data: { nome: string; descricao?: string; preco?: number }
) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("produtos")
    .update({
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() || null,
      preco: data.preco ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao atualizar produto: " + error.message);
  revalidatePath("/dashboard/imaleta/produtos");
}

export async function excluirProduto(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("produtos")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao excluir produto: " + error.message);
  revalidatePath("/dashboard/imaleta/produtos");
}

// ─── Maletas ─────────────────────────────────────────────────────────────────

export async function criarMaleta(data: {
  nome: string;
  vendedor_id: string;
  periodo_inicio: string;
  items: { produto_id: string; quantidade: number }[];
}) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();

  const { data: maleta, error } = await supabase
    .from("maletas")
    .insert({
      user_id: userId,
      nome: data.nome.trim(),
      vendedor_id: data.vendedor_id,
      periodo_inicio: data.periodo_inicio,
    })
    .select()
    .single();

  if (error || !maleta) throw new Error("Erro ao criar maleta: " + error?.message);

  if (data.items.length > 0) {
    const { error: itemError } = await supabase.from("maleta_items").insert(
      data.items.map((i) => ({
        maleta_id: maleta.id,
        produto_id: i.produto_id,
        quantidade: i.quantidade,
      }))
    );
    if (itemError) throw new Error("Erro ao adicionar itens: " + itemError.message);
  }

  revalidatePath("/dashboard/imaleta/maletas");
}

export async function fecharMaleta(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("maletas")
    .update({ status: "conferida", updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao fechar maleta: " + error.message);
  revalidatePath("/dashboard/imaleta/maletas");
}

export async function excluirMaleta(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("maletas")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao excluir maleta: " + error.message);
  revalidatePath("/dashboard/imaleta/maletas");
}

// ─── Conferência ─────────────────────────────────────────────────────────────

export async function criarConferencia(maletaId: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();

  await supabase
    .from("maletas")
    .update({ status: "em_conferencia", updated_at: new Date().toISOString() })
    .eq("id", maletaId)
    .eq("user_id", userId);

  const { data, error } = await supabase
    .from("conferencias")
    .insert({ maleta_id: maletaId, user_id: userId })
    .select()
    .single();

  if (error || !data) throw new Error("Erro ao criar conferência: " + error?.message);
  revalidatePath("/dashboard/imaleta/conferencia");
  return data.id as string;
}

export async function adicionarItemConferencia(
  conferenciaId: string,
  codigoBarras: string
) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();

  const { data: produto, error: prodError } = await supabase
    .from("produtos")
    .select("id")
    .eq("user_id", userId)
    .eq("codigo_barras", codigoBarras.trim().toUpperCase())
    .is("deleted_at", null)
    .single();

  if (prodError || !produto) {
    throw new Error("Produto não encontrado para o código: " + codigoBarras);
  }

  const { data: existing } = await supabase
    .from("conferencia_items")
    .select("id, quantidade_retornada")
    .eq("conferencia_id", conferenciaId)
    .eq("produto_id", produto.id)
    .single();

  if (existing) {
    await supabase
      .from("conferencia_items")
      .update({ quantidade_retornada: existing.quantidade_retornada + 1 })
      .eq("id", existing.id);
  } else {
    await supabase.from("conferencia_items").insert({
      conferencia_id: conferenciaId,
      produto_id: produto.id,
      quantidade_retornada: 1,
    });
  }

  revalidatePath("/dashboard/imaleta/conferencia");
  return produto.id as string;
}

export async function finalizarConferencia(
  conferenciaId: string,
  observacoes?: string
) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();

  const { data: conf } = await supabase
    .from("conferencias")
    .select("maleta_id")
    .eq("id", conferenciaId)
    .eq("user_id", userId)
    .single();

  if (!conf) throw new Error("Conferência não encontrada");

  await supabase
    .from("conferencias")
    .update({
      status: "finalizada",
      observacoes: observacoes?.trim() || null,
      finalizada_at: new Date().toISOString(),
    })
    .eq("id", conferenciaId);

  await supabase
    .from("maletas")
    .update({ status: "conferida", updated_at: new Date().toISOString() })
    .eq("id", conf.maleta_id);

  revalidatePath("/dashboard/imaleta/conferencia");
  revalidatePath("/dashboard/imaleta");
}
