"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createIMaletaServiceClient, createIMaletaStorageClient } from "@/lib/imaleta/supabase";
import type { Produto } from "@/lib/imaleta/types";

async function getUserId() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Não autenticado");
  return user.id;
}

function gerarCodigoBarras(): string {
  let digits = "";
  for (let i = 0; i < 12; i++) digits += Math.floor(Math.random() * 10).toString();
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  const check = (10 - (sum % 10)) % 10;
  return digits + check.toString();
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

export async function uploadProdutoImagem(formData: FormData): Promise<string> {
  const userId = await getUserId();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Arquivo inválido");
  if (file.size > 5 * 1024 * 1024) throw new Error("Imagem deve ter no máximo 5MB");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/produtos/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = createIMaletaStorageClient();
  const { error } = await storage.storage
    .from("imaleta-imagens")
    .upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) throw new Error("Erro ao fazer upload: " + error.message);

  const { data } = storage.storage.from("imaleta-imagens").getPublicUrl(path);
  return data.publicUrl;
}

export async function criarProduto(data: {
  nome: string;
  descricao?: string;
  preco?: number;
  codigo_barras?: string;
  imagem_url?: string | null;
}): Promise<Produto> {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const codigo = data.codigo_barras?.trim() || gerarCodigoBarras();
  const { data: row, error } = await supabase
    .from("produtos")
    .insert({
      user_id: userId,
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() || null,
      preco: data.preco ?? null,
      codigo_barras: codigo,
      imagem_url: data.imagem_url ?? null,
    })
    .select()
    .single();
  if (error) throw new Error("Erro ao criar produto: " + error.message);
  revalidatePath("/dashboard/imaleta/produtos");
  return row as Produto;
}

export async function atualizarProduto(
  id: string,
  data: { nome: string; descricao?: string; preco?: number; imagem_url?: string | null }
) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("produtos")
    .update({
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() || null,
      preco: data.preco ?? null,
      imagem_url: data.imagem_url ?? null,
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

export async function buscarItensMaleta(maletaId: string) {
  const supabase = createIMaletaServiceClient();
  const { data, error } = await supabase
    .from("maleta_items")
    .select("*, produtos(nome, codigo_barras, preco)")
    .eq("maleta_id", maletaId);
  if (error) throw new Error("Erro ao buscar itens: " + error.message);
  return data ?? [];
}

export async function buscarItensConferencia(conferenciaId: string) {
  const supabase = createIMaletaServiceClient();
  const { data, error } = await supabase
    .from("conferencia_items")
    .select("*, produtos(nome, codigo_barras)")
    .eq("conferencia_id", conferenciaId);
  if (error) throw new Error("Erro ao buscar itens conferência: " + error.message);
  return data ?? [];
}

export async function buscarHistoricoConferencias() {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { data, error } = await supabase
    .from("conferencias")
    .select("*, maletas(nome, periodo_inicio, periodo_fim, vendedores(nome))")
    .eq("user_id", userId)
    .eq("status", "finalizada")
    .is("deleted_at", null)
    .order("finalizada_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("Erro ao buscar histórico: " + error.message);
  return data ?? [];
}

export async function buscarDetalhesConferencia(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();

  const { data: conf, error } = await supabase
    .from("conferencias")
    .select("*, maletas(nome, periodo_inicio, periodo_fim, vendedores(nome))")
    .eq("id", id)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error || !conf) throw new Error("Conferência não encontrada");

  const [{ data: confItems }, { data: maletaItems }] = await Promise.all([
    supabase
      .from("conferencia_items")
      .select("*, produtos(nome, codigo_barras, preco)")
      .eq("conferencia_id", id),
    supabase
      .from("maleta_items")
      .select("*, produtos(nome, codigo_barras, preco)")
      .eq("maleta_id", conf.maleta_id),
  ]);

  return {
    conf,
    confItems: confItems ?? [],
    maletaItems: maletaItems ?? [],
  };
}

export async function excluirRegistroConferencia(id: string) {
  const userId = await getUserId();
  const supabase = createIMaletaServiceClient();
  const { error } = await supabase
    .from("conferencias")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw new Error("Erro ao excluir registro: " + error.message);
  revalidatePath("/dashboard/imaleta/conferencia");
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
