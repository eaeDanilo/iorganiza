"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Plus, Briefcase, Trash2, X, Check, Minus, Pencil, ScanBarcode, ScanLine } from "lucide-react";
import type { Maleta, Produto, Vendedor } from "@/lib/imaleta/types";
import { criarMaleta, excluirMaleta, atualizarMaleta, buscarItensMaleta } from "../actions";
import { BarcodeScanner } from "@/components/imaleta/BarcodeScanner";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";
const CARD = "rgba(255,255,255,0.03)";

const SELECT_STYLE = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(222,218,211,0.1)",
  color: "white",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
};

const OPTION_STYLE = { background: "#181818", color: "#DEDAD3" };

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

function ItemsEditor({
  currentItems,
  produtos,
  onAdd,
  onRemove,
  onChangeQty,
}: {
  currentItems: ItemEntry[];
  produtos: Pick<Produto, "id" | "nome" | "codigo_barras" | "preco" | "imagem_url" | "imagem_signed_url">[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
}) {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);

  function processCode(raw: string) {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    const prod = produtos.find((p) => p.codigo_barras?.toUpperCase() === code);
    if (!prod) return void toast.error(`Código não encontrado: ${code}`);
    onAdd(prod.id);
    toast.success(`Adicionado: ${prod.nome}`);
  }

  function handleBarcodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = barcode;
    setBarcode("");
    barcodeRef.current?.focus();
    processCode(code);
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
        Produtos na maleta
      </p>
      <form onSubmit={handleBarcodeSubmit} className="mb-3 flex gap-2">
        <input
          ref={barcodeRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Bipar ou digitar código de barras..."
          autoComplete="off"
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(222,218,211,0.12)",
            color: "white",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "14px",
            outline: "none",
            fontFamily: "monospace",
          }}
        />
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="flex flex-shrink-0 items-center justify-center rounded-lg px-3 transition-colors hover:bg-white/[0.06]"
          style={{ border: "1px solid rgba(222,218,211,0.1)", color: ACCENT }}
          title="Bipar com a câmera"
        >
          <ScanLine className="h-4 w-4" />
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
          title="Adicionar pelo código"
        >
          <ScanBarcode className="h-4 w-4" />
        </button>
      </form>

      {scanning && (
        <BarcodeScanner
          onDetect={(code) => {
            processCode(code);
            setScanning(false);
          }}
          onClose={() => setScanning(false)}
        />
      )}
      <select
        onChange={(e) => { onAdd(e.target.value); e.target.value = ""; }}
        style={{ ...SELECT_STYLE, width: "auto", minWidth: "200px" }}
        defaultValue=""
      >
        <option value="" style={OPTION_STYLE}>+ Adicionar por nome</option>
        {produtos
          .filter((p) => !currentItems.some((i) => i.produto_id === p.id))
          .map((p) => (
            <option key={p.id} value={p.id} style={OPTION_STYLE}>{p.nome}</option>
          ))}
      </select>
      {currentItems.length > 0 && (
        <div className="mt-3 space-y-2">
          {currentItems.map((item) => {
            const prod = produtos.find((p) => p.id === item.produto_id);
            return (
              <div key={item.produto_id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2.5">
                  {prod?.imagem_signed_url ? (
                    <img
                      src={prod.imagem_signed_url}
                      alt={prod.nome}
                      className="h-8 w-8 rounded-md object-cover flex-shrink-0"
                      style={{ outline: "1px solid rgba(222,218,211,0.1)" }}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)", outline: "1px solid rgba(222,218,211,0.08)" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>—</span>
                    </div>
                  )}
                  <span className="text-sm text-white">{prod?.nome ?? item.produto_id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onChangeQty(item.produto_id, -1)} className="flex h-6 w-6 items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm text-white">{item.quantidade}</span>
                  <button type="button" onClick={() => onChangeQty(item.produto_id, 1)} className="flex h-6 w-6 items-center justify-center rounded" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <Plus className="h-3 w-3" />
                  </button>
                  <button type="button" onClick={() => onRemove(item.produto_id)} className="flex h-6 w-6 items-center justify-center rounded transition-colors hover:text-red-400" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MaletasUI({
  initial,
  vendedores,
  produtos,
}: {
  initial: Maleta[];
  vendedores: Pick<Vendedor, "id" | "nome">[];
  produtos: Pick<Produto, "id" | "nome" | "codigo_barras" | "preco" | "imagem_url" | "imagem_signed_url">[];
}) {
  const [maletas, setMaletas] = useState(initial);
  const [tab, setTab] = useState<"abertas" | "fechadas">("abertas");
  const [showForm, setShowForm] = useState(false);

  // Create form
  const [nome, setNome] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [periodoInicio, setPeriodoInicio] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ItemEntry[]>([]);

  // Edit state
  const [editId, setEditId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editVendedorId, setEditVendedorId] = useState("");
  const [editPeriodo, setEditPeriodo] = useState("");
  const [editItems, setEditItems] = useState<ItemEntry[]>([]);

  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoadingItems, startLoadingItems] = useTransition();

  // Create item helpers
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
      prev.map((i) => i.produto_id === produtoId ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)
    );
  }

  // Edit item helpers
  function addEditItem(produtoId: string) {
    if (!produtoId) return;
    setEditItems((prev) => {
      const ex = prev.find((i) => i.produto_id === produtoId);
      if (ex) return prev.map((i) => i.produto_id === produtoId ? { ...i, quantidade: i.quantidade + 1 } : i);
      return [...prev, { produto_id: produtoId, quantidade: 1 }];
    });
  }
  function removeEditItem(produtoId: string) {
    setEditItems((prev) => prev.filter((i) => i.produto_id !== produtoId));
  }
  function changeEditQty(produtoId: string, delta: number) {
    setEditItems((prev) =>
      prev.map((i) => i.produto_id === produtoId ? { ...i, quantidade: Math.max(1, i.quantidade + delta) } : i)
    );
  }

  function handleStartEdit(m: Maleta) {
    setEditId(m.id);
    setEditNome(m.nome);
    setEditVendedorId(m.vendedor_id);
    setEditPeriodo(m.periodo_inicio);
    setEditItems([]);
    setConfirmId(null);
    startLoadingItems(async () => {
      try {
        const itensMaleta = await buscarItensMaleta(m.id);
        setEditItems((itensMaleta as any[]).map((i) => ({ produto_id: i.produto_id, quantidade: i.quantidade })));
      } catch {
        // items stay empty, user can add manually
      }
    });
  }

  function handleSaveEdit() {
    if (!editNome.trim()) return toast.error("Nome da maleta obrigatório");
    if (!editVendedorId) return toast.error("Selecione um vendedor");
    if (editItems.length === 0) return toast.error("Adicione pelo menos um produto");

    startTransition(async () => {
      try {
        await atualizarMaleta(editId!, {
          nome: editNome,
          vendedor_id: editVendedorId,
          periodo_inicio: editPeriodo,
          items: editItems,
        });
        setMaletas((prev) =>
          prev.map((m) =>
            m.id === editId
              ? {
                  ...m,
                  nome: editNome,
                  vendedor_id: editVendedorId,
                  periodo_inicio: editPeriodo,
                  vendedores: vendedores.find((v) => v.id === editVendedorId)
                    ? { nome: vendedores.find((v) => v.id === editVendedorId)!.nome }
                    : m.vendedores,
                }
              : m
          )
        );
        toast.success("Maleta atualizada");
        setEditId(null);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
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

  const abertas = maletas.filter((m) => m.status !== "conferida");
  const fechadas = maletas.filter((m) => m.status === "conferida");
  const visible = tab === "abertas" ? abertas : fechadas;

  return (
    <div>
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}>
          {(["abertas", "fechadas"] as const).map((t) => {
            const count = t === "abertas" ? abertas.length : fechadas.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={tab === t ? { background: ACCENT, color: "#1C1C1C" } : { color: "rgba(255,255,255,0.5)" }}
              >
                {t === "abertas" ? "Abertas" : "Fechadas"}
                {count > 0 && (
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
                    style={
                      tab === t
                        ? { background: "rgba(28,28,28,0.18)", color: "#1C1C1C" }
                        : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Plus className="h-4 w-4" />
          Nova maleta
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-6 rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}>
          <p className="mb-4 text-sm font-semibold text-white">Nova maleta</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <input placeholder="Nome da maleta *" value={nome} onChange={(e) => setNome(e.target.value)} style={SELECT_STYLE} />
            <select value={vendedorId} onChange={(e) => setVendedorId(e.target.value)} style={SELECT_STYLE}>
              <option value="" style={OPTION_STYLE}>Selecionar vendedor *</option>
              {vendedores.map((v) => <option key={v.id} value={v.id} style={OPTION_STYLE}>{v.nome}</option>)}
            </select>
            <input type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} min="2000-01-01" max="2200-12-31" style={SELECT_STYLE} />
          </div>
          <div className="mt-4">
            <ItemsEditor currentItems={items} produtos={produtos} onAdd={addItem} onRemove={removeItem} onChangeQty={changeQty} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: ACCENT, color: "#1C1C1C" }}>
              <Check className="h-3.5 w-3.5" /> Criar maleta
            </button>
            <button onClick={() => { setShowForm(false); setItems([]); }} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.5)" }}>
              <X className="h-3.5 w-3.5" /> Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>
            {tab === "abertas" ? "Nenhuma maleta em aberto." : "Nenhuma maleta fechada."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((m) =>
            editId === m.id ? (
              <div key={m.id} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}>
                <p className="mb-4 text-sm font-semibold text-white">Editar maleta</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input placeholder="Nome da maleta *" value={editNome} onChange={(e) => setEditNome(e.target.value)} style={SELECT_STYLE} />
                  <select value={editVendedorId} onChange={(e) => setEditVendedorId(e.target.value)} style={SELECT_STYLE}>
                    <option value="" style={OPTION_STYLE}>Selecionar vendedor *</option>
                    {vendedores.map((v) => <option key={v.id} value={v.id} style={OPTION_STYLE}>{v.nome}</option>)}
                  </select>
                  <input type="date" value={editPeriodo} onChange={(e) => setEditPeriodo(e.target.value)} min="2000-01-01" max="2200-12-31" style={SELECT_STYLE} />
                </div>
                <div className="mt-4">
                  {isLoadingItems ? (
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>Carregando produtos...</p>
                  ) : (
                    <ItemsEditor currentItems={editItems} produtos={produtos} onAdd={addEditItem} onRemove={removeEditItem} onChangeQty={changeEditQty} />
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={handleSaveEdit} disabled={isPending || isLoadingItems} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: ACCENT, color: "#1C1C1C" }}>
                    <Check className="h-3.5 w-3.5" /> Salvar
                  </button>
                  <button onClick={() => setEditId(null)} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
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
                  <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "rgba(222,218,211,0.08)", color: statusColor[m.status] ?? ACCENT }}>
                    {statusLabel[m.status] ?? m.status}
                  </span>
                  {m.status === "aberta" && (
                    <>
                      <button
                        onClick={() => handleStartEdit(m)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                        title="Editar maleta"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {confirmId === m.id ? (
                        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: "rgba(255,80,80,0.08)", outline: "1px solid rgba(255,80,80,0.2)" }}>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Excluir?</span>
                          <button type="button" onClick={() => handleDeleteConfirm(m.id)} disabled={isPending} className="rounded px-2 py-0.5 text-xs font-medium transition-colors hover:bg-red-500/20 disabled:pointer-events-none" style={{ color: "#ff6b6b" }}>Sim</button>
                          <button type="button" onClick={() => setConfirmId(null)} className="rounded px-2 py-0.5 text-xs transition-colors hover:bg-white/5" style={{ color: "rgba(255,255,255,0.4)" }}>Não</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmId(m.id)} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
