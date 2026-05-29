import { NextResponse } from 'next/server';

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}
export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: { message, code } }, { status });
}
export function handleError(err: unknown) {
  const msg = err instanceof Error ? err.message : 'Internal error';
  if (msg === 'UNAUTHORIZED') return jsonError('Não autenticado', 401, 'UNAUTHORIZED');
  if (msg === 'FORBIDDEN') return jsonError('Sem permissão', 403, 'FORBIDDEN');
  console.error('[api]', err);
  return jsonError('Erro interno', 500, 'INTERNAL');
}
