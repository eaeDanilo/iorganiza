import "server-only";
import { createIMaletaStorageClient } from "./supabase";
import type { Produto } from "./types";

const BUCKET = "imaleta-imagens";
const SIGN_TTL = 3600; // 1h

/**
 * Extrai o path do objeto a partir de um path puro OU de uma URL pública legada
 * (ex.: ".../storage/v1/object/public/imaleta-imagens/uid/produtos/x.jpg").
 */
export function toStoragePath(value: string | null): string | null {
  if (!value) return null;
  const marker = `/${BUCKET}/`;
  const i = value.indexOf(marker);
  return i >= 0 ? value.slice(i + marker.length) : value;
}

/** Gera URL assinada de curta duração para um path (ou URL legada). */
export async function signImagem(value: string | null): Promise<string | null> {
  const path = toStoragePath(value);
  if (!path) return null;
  const storage = createIMaletaStorageClient();
  const { data } = await storage.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
  return data?.signedUrl ?? null;
}

/**
 * Anexa `imagem_signed_url` (display) a cada produto, preservando `imagem_url`
 * (path persistido). Use em server components antes de passar para o cliente.
 */
export async function signProdutos<T extends Pick<Produto, "imagem_url">>(
  rows: T[]
): Promise<(T & { imagem_signed_url: string | null })[]> {
  return Promise.all(
    rows.map(async (r) => ({ ...r, imagem_signed_url: await signImagem(r.imagem_url) }))
  );
}
