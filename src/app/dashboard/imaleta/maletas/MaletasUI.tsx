"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Briefcase, Trash2, X, Check, Minus } from "lucide-react";
import type { Maleta, Produto, Vendedor } from "@/lib/imaleta/types";
import { criarMaleta, excluirMaleta } from "../actions";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";
const CARD = "rgba(255,255,255,0.03)";

const statusLabel: Record<string, string> = {
  aberta: "Aberta",
  em_conferencia: "Em conferência",
  conferida: "Conferida",
};

const statusColor: Record<string, string> = {
  aberta: "#DEDAD3",
  em_conferencia: "#F59E0B",
  conferida: "rgba(222,218,211,0.35)",
};

interface ItemEntry {
  produto_id: string;
  quantidade: number;
}

export function MaletasUI({
  initial,
  vendedores,
  produtos,
}: {
  initial: Maleta[];
  vendedores: Pick<Vendedor, "id" | "nome">[];
  produtos: Pick<Produto, "id" | "nome" | "codigo_barras" | "preco">[];
}) {
  const [maletas, setMaletas] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [nome, setNome] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [items, setItems] = useState<ItemEntry[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(222,218,211,0.1)",
    color: "white",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  const inputStyle = { ...selectStyle };

  function addItem(produtoId: string) {
    if (!produtoId) return;
    setItems((prev) => {
      const ex = prev.find((i) => i.produto_id === produtoId);
      if (ex) return prev.map((i) => i.produto_id === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { produto_id: produtoId, quantidade: 1 }];
    });
  }

  function removeItem(produtoId: string) {
    setItems((prev) => prev.filter((i) => i.produto_id !== produtoId));
  }

  function changeQty(produtoId: string, delta: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.produto_id === produtoId
          ? { ...i, quantidade: Math.max(1, i.quantidade + delta) }
          : i
      )
    );
  }

  function handleSave() {
    if (!nome.trim()) return toast.error("Nome da maleta obrigatório");
    if (!vendedorId) return toast.error("Selecione um vendedor");
    if (items.length === 0) return toast.error("Adicione pelo menos um produto");

    startTransition(async () => {
      try {
        await criarMaleta({ nome, vendedor_id: vendedorId, periodo_inicio: periodoInicio, items });
        toast.success("Maleta criada");
        setShowForm(false);
        setNome("");
        setVendedorId("");
        setItems([]);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  function handleDeleteConfirm(id: string) {
    setConfirmId(null);
    startTransition(async () => {
      try {
        await excluirMaleta(id);
        setMaletas((prev) => prev.filter((m) => m.id !== id));
        toast.success("Maleta removida");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Plus className="h-4 w-4" />
          Nova maleta
        </button>
      </div>

      {showForm && (
        <div
          className="mb-6 rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}
        >
          <p className="mb-4 text-sm font-semibold text-white">Nova maleta</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input
              placeholder="Nome da maleta *"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              style={inputStyle}
            />
            <select
              value={vendedorId}
              onChange={(e) => setVendedorId(e.target.value)}
              style={selectStyle}
            >
              <option value="">Selecionar vendedor *</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>{v.nome}</option>
              ))}
            </select>
            <input
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
              Produtos na maleta
            </p>
            <select
              onChange={(e) => { addItem(e.target.value); e.target.value = ""; }}
              style={{ ...selectStyle, width: "auto", minWidth: "200px" }}
              defaultValue=""
            >
              <option value="">+ Adicionar produto</option>
              {produtos
                .filter((p) => !items.some((i) => i.produto_id === p.id))
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
            </select>

            {items.length > 0 && (
              <div className="mt-3 space-y-2">
                {items.map((item) => {
                  const prod = produtos.find((p) => p.id === item.produto_id);
                  return (
                    <div key={item.produto_id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <span className="text-sm text-white">{prod?.nome}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => changeQty(item.produto_id, -1)} className="flex h-6 w-6 items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.5)" }}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-sm text-white">{item.quantidade}</span>
                        <button onClick={() => changeQty(item.produto_id, 1)} className="flex h-6 w-6 items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.5)" }}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <button onClick={() => removeItem(item.produto_id)} className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:text-red-400" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: ACCENT, color: "#1C1C1C" }}>
              <Check className="h-3.5 w-3.5" />
              Criar maleta
            </button>
            <button onClick={() => { setShowForm(false); setItems([]); }} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.5)" }}>
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {maletas.length === 0 && !showForm ? (
        <div className="rounded-xl p-10 text-center" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhuma maleta criada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {maletas.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl px-5 py-4" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "rgba(222,218,211,0.08)" }}>
                  <Briefcase className="h-4 w-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <p className="font-medium text-white">{m.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {(m as any).vendedores?.nome} · {m.periodo_inicio}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "rgba(222,218,211,0.08)", color: statusColor[m.status] ?? ACCENT }}
                >
                  {statusLabel[m.status] ?? m.status}
                </span>
                {m.status === "aberta" && (
                  confirmId === m.id ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                      style={{ background: "rgba(255,80,80,0.08)", outline: "1px solid rgba(255,80,80,0.2)" }}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Excluir?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(m.id)}
                        disabled={isPending}
                        className="rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-red-500/20 disabled:pointer-events-none"
                        style={{ color: "#ff6b6b" }}
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="rounded px-2 py-0.5 text-xs transition-colors hover:bg-white/5"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(m.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
