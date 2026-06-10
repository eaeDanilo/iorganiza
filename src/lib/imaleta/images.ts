import "server-only";
import { createIMaletaStorageClient } from "./supabase";
import type { Produto } from "./types";

const BUCKET = "imaleta-imagens";
const SIGN_TTL = 3600; // 1h

/**
 * Detecta o tipo real da imagem pelos magic bytes (não confia no nome/MIME do
 * cliente). Bloqueia SVG e qualquer não-imagem. Retorna null se não reconhecido.
 */
export function detectImageType(buffer: Buffer): { ext: string; mime: string } | null {
  const b = buffer;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { ext: "jpg", mime: "image/jpeg" };
  if (b.length >= 4 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return { ext: "png", mime: "image/png" };
  if (b.length >= 4 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38)
    return { ext: "gif", mime: "image/gif" };
  if (b.length >= 12 && b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP")
    return { ext: "webp", mime: "image/webp" };
  return null;
}

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
