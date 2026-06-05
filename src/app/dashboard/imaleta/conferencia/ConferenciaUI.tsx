"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import {
  ScanBarcode,
  Camera,
  CameraOff,
  CheckCircle2,
  Package,
  ChevronDown,
} from "lucide-react";
import type { Maleta, Conferencia, MaletaItem } from "@/lib/imaleta/types";
import {
  criarConferencia,
  adicionarItemConferencia,
  finalizarConferencia,
} from "../actions";
import { createIMaletaServiceClient } from "@/lib/imaleta/supabase";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";

interface RetornadoItem {
  produto_id: string;
  nome: string;
  codigo_barras: string;
  quantidade_retornada: number;
}

interface MaletaItemComProduto extends MaletaItem {
  produtos: { nome: string; codigo_barras: string; preco: number | null };
}

export function ConferenciaUI({
  maletas,
  conferenciasPendentes,
}: {
  maletas: Maleta[];
  conferenciasPendentes: Conferencia[];
}) {
  const [step, setStep] = useState<"select" | "scanning" | "result">("select");
  const [selectedMaletaId, setSelectedMaletaId] = useState("");
  const [conferenciaId, setConferenciaId] = useState<string | null>(null);
  const [maletaItems, setMaletaItems] = useState<MaletaItemComProduto[]>([]);
  const [retornados, setRetornados] = useState<RetornadoItem[]>([]);
  const [manualCode, setManualCode] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resumePendente = conferenciasPendentes[0];

  const processCode = useCallback(
    (code: string) => {
      const trimmed = code.trim().toUpperCase();
      if (!trimmed || !conferenciaId) return;
      startTransition(async () => {
        try {
          await adicionarItemConferencia(conferenciaId, trimmed);
          setRetornados((prev) => {
            const ex = prev.find((r) => r.codigo_barras === trimmed);
            if (ex) {
              return prev.map((r) =>
                r.codigo_barras === trimmed
                  ? { ...r, quantidade_retornada: r.quantidade_retornada + 1 }
                  : r
              );
            }
            const item = maletaItems.find(
              (i) => i.produtos.codigo_barras === trimmed
            );
            return [
              ...prev,
              {
                produto_id: item?.produto_id ?? "",
                nome: item?.produtos.nome ?? trimmed,
                codigo_barras: trimmed,
                quantidade_retornada: 1,
              },
            ];
          });
          toast.success(`Bipado: ${trimmed}`);
        } catch (e: any) {
          toast.error(e.message);
        }
      });
    },
    [conferenciaId, maletaItems]
  );

  useEffect(() => {
    if (!cameraActive) {
      controlsRef.current?.stop();
      controlsRef.current = null;
      return;
    }
    let mounted = true;
    import("@zxing/browser").then(({ BrowserMultiFormatReader }) => {
      if (!mounted || !videoRef.current) return;
      const reader = new BrowserMultiFormatReader();
      reader
        .decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result) {
              processCode(result.getText());
            }
          }
        )
        .then((controls) => {
          if (mounted) controlsRef.current = controls;
        })
        .catch(() => {
          toast.error("Câmera não disponível");
          if (mounted) setCameraActive(false);
        });
    });
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, [cameraActive, processCode]);

  async function handleStartConferencia() {
    if (!selectedMaletaId) return toast.error("Selecione uma maleta");
    startTransition(async () => {
      try {
        const confId = await criarConferencia(selectedMaletaId);
        const supabase = createIMaletaServiceClient();
        const { data } = await supabase
          .from("maleta_items")
          .select("*, produtos(nome, codigo_barras, preco)")
          .eq("maleta_id", selectedMaletaId);
        setMaletaItems((data as MaletaItemComProduto[]) ?? []);
        setConferenciaId(confId);
        setStep("scanning");
        setTimeout(() => inputRef.current?.focus(), 100);
        toast.success("Conferência iniciada — bipe os produtos retornados");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  async function handleResumePendente() {
    const conf = resumePendente;
    if (!conf) return;
    const supabase = createIMaletaServiceClient();
    const [{ data: items }, { data: confItems }] = await Promise.all([
      supabase
        .from("maleta_items")
        .select("*, produtos(nome, codigo_barras, preco)")
        .eq("maleta_id", conf.maleta_id),
      supabase
        .from("conferencia_items")
        .select("*, produtos(nome, codigo_barras)")
        .eq("conferencia_id", conf.id),
    ]);
    setMaletaItems((items as MaletaItemComProduto[]) ?? []);
    setConferenciaId(conf.id);
    const retornadosList: RetornadoItem[] = (confItems ?? []).map((ci: any) => ({
      produto_id: ci.produto_id,
      nome: ci.produtos?.nome ?? ci.produto_id,
      codigo_barras: ci.produtos?.codigo_barras ?? "",
      quantidade_retornada: ci.quantidade_retornada,
    }));
    setRetornados(retornadosList);
    setStep("scanning");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    processCode(manualCode);
    setManualCode("");
    inputRef.current?.focus();
  }

  async function handleFinalizar() {
    if (!conferenciaId) return;
    startTransition(async () => {
      try {
        await finalizarConferencia(conferenciaId, observacoes);
        setStep("result");
        controlsRef.current?.stop();
        setCameraActive(false);
        toast.success("Conferência finalizada");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  const vendidos = maletaItems.filter((item) => {
    const ret = retornados.find((r) => r.produto_id === item.produto_id);
    const qtdRet = ret?.quantidade_retornada ?? 0;
    return qtdRet < item.quantidade;
  });

  if (step === "result") {
    return (
      <div
        className="rounded-xl p-8"
        style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}
      >
        <div className="mb-6 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6" style={{ color: ACCENT }} />
          <h2 className="text-lg font-semibold text-white">Conferência finalizada</h2>
        </div>

        <p className="mb-4 text-sm font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Produtos vendidos ({vendidos.length})
        </p>
        {vendidos.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum produto vendido detectado.</p>
        ) : (
          <div className="space-y-2">
            {vendidos.map((item) => {
              const ret = retornados.find((r) => r.produto_id === item.produto_id);
              const vendido = item.quantidade - (ret?.quantidade_retornada ?? 0);
              return (
                <div key={item.id} className="flex items-center justify-between rounded-lg px-4 py-3" style={{ background: "rgba(222,218,211,0.05)", outline: "1px solid rgba(222,218,211,0.08)" }}>
                  <div>
                    <p className="text-sm font-medium text-white">{item.produtos.nome}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Saiu: {item.quantidade} · Voltou: {ret?.quantidade_retornada ?? 0}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: ACCENT }}>
                    {vendido}x vendido{vendido > 1 ? "s" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() => { setStep("select"); setRetornados([]); setConferenciaId(null); setMaletaItems([]); }}
          className="mt-6 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          Nova conferência
        </button>
      </div>
    );
  }

  if (step === "scanning") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Scanner panel */}
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}>
            <p className="mb-4 text-sm font-semibold text-white">Bipar produtos retornados</p>

            <form onSubmit={handleManualSubmit} className="mb-4 flex gap-2">
              <input
                ref={inputRef}
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Digite ou bipe o código..."
                autoFocus
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(222,218,211,0.12)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  fontSize: "15px",
                  outline: "none",
                  fontFamily: "monospace",
                }}
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
                style={{ background: ACCENT, color: "#1C1C1C" }}
              >
                <ScanBarcode className="h-4 w-4" />
                OK
              </button>
            </form>

            <button
              type="button"
              onClick={() => setCameraActive((v) => !v)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.06]"
              style={{ color: cameraActive ? ACCENT : "rgba(255,255,255,0.4)" }}
            >
              {cameraActive ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
              {cameraActive ? "Desligar câmera" : "Usar câmera"}
            </button>

            {cameraActive && (
              <div className="mt-3 overflow-hidden rounded-xl" style={{ outline: `1px solid ${BORDER}` }}>
                <video ref={videoRef} className="w-full" playsInline muted />
              </div>
            )}

            {retornados.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Bipados ({retornados.reduce((s, r) => s + r.quantidade_retornada, 0)})
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {retornados.map((r) => (
                    <div key={r.codigo_barras} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ background: "rgba(222,218,211,0.05)" }}>
                      <span className="text-white">{r.nome}</span>
                      <span className="font-mono text-xs" style={{ color: ACCENT }}>×{r.quantidade_retornada}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Maleta summary */}
          <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}>
            <p className="mb-4 text-sm font-semibold text-white flex items-center gap-2">
              <Package className="h-4 w-4" style={{ color: ACCENT }} />
              Itens da maleta
            </p>
            <div className="space-y-2">
              {maletaItems.map((item) => {
                const ret = retornados.find((r) => r.produto_id === item.produto_id);
                const qtdRet = ret?.quantidade_retornada ?? 0;
                const vendido = item.quantidade - qtdRet;
                const status = qtdRet === 0 ? "pendente" : qtdRet >= item.quantidade ? "ok" : "parcial";
                return (
                  <div key={item.id} className="flex items-center justify-between rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div>
                      <p className="text-sm text-white">{item.produtos.nome}</p>
                      <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>{item.produtos.codigo_barras}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span style={{ color: "rgba(255,255,255,0.4)" }}>{qtdRet}/{item.quantidade}</span>
                      <span
                        className="rounded-full px-2 py-0.5 font-medium"
                        style={{
                          background:
                            status === "ok"
                              ? "rgba(222,218,211,0.12)"
                              : status === "parcial"
                              ? "rgba(245,158,11,0.12)"
                              : "rgba(255,255,255,0.05)",
                          color:
                            status === "ok" ? ACCENT : status === "parcial" ? "#F59E0B" : "rgba(255,255,255,0.35)",
                        }}
                      >
                        {status === "ok" ? "devolvido" : status === "parcial" ? `${vendido}x vendido` : "pendente"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}>
          <p className="mb-3 text-sm font-semibold text-white">Finalizar conferência</p>
          <textarea
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={2}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(222,218,211,0.1)",
              color: "white",
              borderRadius: "8px",
              padding: "10px 12px",
              fontSize: "14px",
              outline: "none",
              resize: "none",
            }}
          />
          <button
            onClick={handleFinalizar}
            disabled={isPending}
            className="mt-3 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50"
            style={{ background: ACCENT, color: "#1C1C1C" }}
          >
            <CheckCircle2 className="h-4 w-4" />
            Finalizar conferência
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {resumePendente && (
        <div
          className="rounded-xl p-5"
          style={{ background: "rgba(245,158,11,0.06)", outline: "1px solid rgba(245,158,11,0.2)" }}
        >
          <p className="mb-1 text-sm font-semibold text-white">Conferência em andamento</p>
          <p className="mb-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {(resumePendente as any).maletas?.nome} ·{" "}
            {(resumePendente as any).maletas?.vendedores?.nome}
          </p>
          <button
            onClick={handleResumePendente}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
            style={{ background: "#F59E0B", color: "#1A0F00" }}
          >
            Continuar conferência →
          </button>
        </div>
      )}

      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(255,255,255,0.03)", outline: `1px solid ${BORDER}` }}
      >
        <p className="mb-4 text-sm font-semibold text-white">Iniciar nova conferência</p>

        {maletas.length === 0 ? (
          <p style={{ color: "rgba(255,255,255,0.35)" }}>
            Nenhuma maleta aberta. Crie uma maleta primeiro.
          </p>
        ) : (
          <>
            <select
              value={selectedMaletaId}
              onChange={(e) => setSelectedMaletaId(e.target.value)}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(222,218,211,0.12)",
                color: selectedMaletaId ? "white" : "rgba(255,255,255,0.4)",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "14px",
                width: "100%",
                maxWidth: "360px",
                outline: "none",
                marginBottom: "12px",
              }}
            >
              <option value="">Selecionar maleta...</option>
              {maletas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.nome} — {(m as any).vendedores?.nome}
                </option>
              ))}
            </select>
            <button
              onClick={handleStartConferencia}
              disabled={isPending || !selectedMaletaId}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-40"
              style={{ background: ACCENT, color: "#1C1C1C" }}
            >
              <ScanBarcode className="h-4 w-4" />
              Iniciar conferência
            </button>
          </>
        )}
      </div>
    </div>
  );
}
