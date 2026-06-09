"use client";

import { useState, useTransition } from "react";
import { History, X, ChevronRight, Calendar, Package, TrendingUp, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Conferencia, ConferenciaItem, MaletaItem } from "@/lib/imaleta/types";
import { buscarDetalhesConferencia, excluirRegistroConferencia } from "../actions";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

interface DetalheConferencia {
  conf: Conferencia;
  confItems: ConferenciaItem[];
  maletaItems: MaletaItem[];
}

function fmt(iso: string, time = false) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function HistoricoConferencias({ historico }: { historico: Conferencia[] }) {
  const [list, setList] = useState(historico);
  const [detalhe, setDetalhe] = useState<DetalheConferencia | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleOpen(id: string) {
    setLoadingId(id);
    startTransition(async () => {
      try {
        const data = await buscarDetalhesConferencia(id);
        setDetalhe(data as DetalheConferencia);
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setLoadingId(null);
      }
    });
  }

  function handleDeleteRequest(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmId(id);
  }

  function handleDeleteCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmId(null);
  }

  function handleDeleteConfirm(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setConfirmId(null);
    setDeletingId(id);
    startTransition(async () => {
      try {
        await excluirRegistroConferencia(id);
        setList((prev) => prev.filter((c) => c.id !== id));
        if (detalhe?.conf.id === id) setDetalhe(null);
        toast.success("Registro excluído");
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setDeletingId(null);
      }
    });
  }

  return (
    <>
      <div className="space-y-2">
        {list.length === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "rgba(255,255,255,0.02)", outline: `1px solid ${BORDER}` }}
          >
            <History className="mx-auto mb-3 h-8 w-8 opacity-20" style={{ color: ACCENT }} />
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              Nenhuma conferência finalizada ainda.
            </p>
          </div>
        ) : (
          list.map((conf) => {
            const maleta = conf.maletas;
            const isLoading = loadingId === conf.id;
            return (
              <div
                key={conf.id}
                className="flex cursor-pointer items-center justify-between rounded-xl px-5 py-4 transition-colors hover:bg-white/[0.02]"
                style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}
                onClick={() => !isLoading && handleOpen(conf.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg p-2" style={{ background: "rgba(222,218,211,0.06)" }}>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" style={{ color: ACCENT }} />
                    ) : (
                      <Package className="h-4 w-4" style={{ color: ACCENT }} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{maleta?.nome ?? "—"}</p>
                    <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {maleta?.vendedores?.nome}
                      {conf.finalizada_at && ` · ${fmt(conf.finalizada_at)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {confirmId === conf.id ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                      style={{ background: "rgba(255,80,80,0.08)", outline: "1px solid rgba(255,80,80,0.2)" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                        Excluir?
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConfirm(e, conf.id)}
                        disabled={isPending}
                        className="rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-red-500/20 disabled:pointer-events-none"
                        style={{ color: "#ff6b6b" }}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteCancel}
                        className="rounded px-2 py-0.5 text-xs transition-colors hover:bg-white/5"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRequest(e, conf.id)}
                      disabled={deletingId === conf.id || isPending}
                      className="rounded-lg p-1.5 opacity-20 transition-opacity hover:opacity-60 disabled:pointer-events-none"
                      title="Excluir registro (LGPD — direito ao apagamento)"
                      style={{ color: "white" }}
                    >
                      {deletingId === conf.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                  <ChevronRight className="h-4 w-4" style={{ color: "rgba(255,255,255,0.25)" }} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Backdrop */}
      {detalhe && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
          onClick={() => setDetalhe(null)}
        />
      )}

      {/* Detail panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: "min(520px, 100vw)",
          transform: detalhe ? "translateX(0)" : "translateX(100%)",
          background: "#1C1C1C",
          borderLeft: `1px solid ${BORDER}`,
        }}
      >
        {detalhe && (
          <DetalhePanel detalhe={detalhe} onClose={() => setDetalhe(null)} />
        )}
      </div>
    </>
  );
}

function DetalhePanel({
  detalhe,
  onClose,
}: {
  detalhe: DetalheConferencia;
  onClose: () => void;
}) {
  const { conf, confItems, maletaItems } = detalhe;
  const maleta = conf.maletas;

  const produtos = maletaItems.map((mi) => {
    const ci = confItems.find((c) => c.produto_id === mi.produto_id);
    const retornado = ci?.quantidade_retornada ?? 0;
    const vendido = mi.quantidade - retornado;
    return { ...mi, retornado, vendido };
  });

  const totalEnviado = maletaItems.reduce((s, i) => s + i.quantidade, 0);
  const totalRetornado = confItems.reduce((s, i) => s + i.quantidade_retornada, 0);
  const totalVendido = totalEnviado - totalRetornado;
  const valorTotal = produtos.reduce(
    (s, p) => s + p.vendido * (p.produtos?.preco ?? 0),
    0
  );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5"
        style={{ borderBottom: `1px solid ${BORDER}` }}
      >
        <div>
          <p className="font-semibold text-white">{maleta?.nome}</p>
          <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {maleta?.vendedores?.nome}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 transition-colors hover:bg-white/[0.06]"
        >
          <X className="h-4 w-4 text-white/50" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {/* Dates */}
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Período: {maleta?.periodo_inicio ? fmt(maleta.periodo_inicio) : "—"}
            {" → "}
            {maleta?.periodo_fim ? fmt(maleta.periodo_fim) : "em aberto"}
          </span>
          {conf.finalizada_at && (
            <span>Finalizado: {fmt(conf.finalizada_at, true)}</span>
          )}
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Enviados", value: totalEnviado, accent: false },
            { label: "Retornados", value: totalRetornado, accent: false },
            { label: "Vendidos", value: totalVendido, accent: true },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl px-4 py-3 text-center"
              style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}
            >
              <p
                className="text-2xl font-bold"
                style={{ color: card.accent ? ACCENT : "white" }}
              >
                {card.value}
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {/* Valor estimado */}
        {valorTotal > 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: "rgba(222,218,211,0.04)", outline: `1px solid rgba(222,218,211,0.1)` }}
          >
            <TrendingUp className="h-4 w-4" style={{ color: ACCENT }} />
            <div>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Valor estimado vendido
              </p>
              <p className="text-base font-bold" style={{ color: ACCENT }}>
                {valorTotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        )}

        {/* Products */}
        <div>
          <p
            className="mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Produtos ({maletaItems.length})
          </p>
          <div className="space-y-1.5">
            {produtos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)" }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">{p.produtos?.nome}</p>
                  <p
                    className="mt-0.5 font-mono text-xs"
                    style={{ color: "rgba(255,255,255,0.25)" }}
                  >
                    {p.produtos?.codigo_barras}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 items-center gap-4 text-xs">
                  <span style={{ color: "rgba(255,255,255,0.35)" }}>
                    {p.retornado}/{p.quantidade}
                  </span>
                  <span
                    className="min-w-[40px] rounded-full px-2.5 py-0.5 text-center font-medium"
                    style={{
                      background:
                        p.vendido > 0
                          ? "rgba(222,218,211,0.1)"
                          : "rgba(255,255,255,0.04)",
                      color:
                        p.vendido > 0 ? ACCENT : "rgba(255,255,255,0.25)",
                    }}
                  >
                    {p.vendido > 0 ? `+${p.vendido}` : "0"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observations */}
        {conf.observacoes && (
          <div>
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-wider"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Observações
            </p>
            <p
              className="rounded-xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: "rgba(255,255,255,0.03)",
                outline: `1px solid ${BORDER}`,
                color: "rgba(255,255,255,0.65)",
              }}
            >
              {conf.observacoes}
            </p>
          </div>
        )}

        {/* LGPD notice */}
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.18)" }}>
          Em conformidade com a LGPD, você pode excluir este registro a qualquer momento.
          Use o botão de exclusão na lista do histórico.
        </p>
      </div>
    </div>
  );
}
