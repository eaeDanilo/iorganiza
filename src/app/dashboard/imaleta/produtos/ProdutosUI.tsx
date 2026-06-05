"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Barcode, Pencil, Trash2, X, Check } from "lucide-react";
import type { Produto } from "@/lib/imaleta/types";
import { criarProduto, atualizarProduto, excluirProduto } from "../actions";
import { BarcodeModal } from "./BarcodeModal";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";
const CARD = "rgba(255,255,255,0.03)";

interface FormState {
  nome: string;
  descricao: string;
  preco: string;
  codigo_barras: string;
}

const empty: FormState = { nome: "", descricao: "", preco: "", codigo_barras: "" };

export function ProdutosUI({ initial }: { initial: Produto[] }) {
  const [produtos, setProdutos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [barcodeProduto, setBarcodeProduto] = useState<Produto | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(p: Produto) {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: p.preco != null ? String(p.preco) : "",
      codigo_barras: p.codigo_barras,
    });
    setShowForm(false);
  }

  function handleSave() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    startTransition(async () => {
      try {
        const preco = form.preco ? parseFloat(form.preco) : undefined;
        if (editingId) {
          await atualizarProduto(editingId, {
            nome: form.nome,
            descricao: form.descricao,
            preco,
          });
          setProdutos((prev) =>
            prev.map((p) =>
              p.id === editingId
                ? { ...p, nome: form.nome, descricao: form.descricao || null, preco: preco ?? null }
                : p
            )
          );
          setEditingId(null);
          toast.success("Produto atualizado");
        } else {
          await criarProduto({
            nome: form.nome,
            descricao: form.descricao,
            preco,
            codigo_barras: form.codigo_barras || undefined,
          });
          setShowForm(false);
          toast.success("Produto criado — código de barras gerado");
        }
        setForm(empty);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await excluirProduto(id);
        setProdutos((prev) => prev.filter((p) => p.id !== id));
        toast.success("Produto removido");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(222,218,211,0.1)",
    color: "white",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </button>
      </div>

      {showForm && !editingId && (
        <div
          className="mb-4 rounded-xl p-5"
          style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}
        >
          <p className="mb-4 text-sm font-semibold text-white">Novo produto</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} />
            <input placeholder="Código de barras (deixe vazio para gerar)" value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} style={inputStyle} />
            <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} />
            <input placeholder="Preço (R$)" type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} style={inputStyle} />
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: ACCENT, color: "#1C1C1C" }}>
              <Check className="h-3.5 w-3.5" />
              Salvar
            </button>
            <button onClick={() => { setShowForm(false); setForm(empty); }} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.5)" }}>
              <X className="h-3.5 w-3.5" />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {produtos.length === 0 && !showForm ? (
        <div className="rounded-xl p-10 text-center" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {produtos.map((p) =>
            editingId === p.id ? (
              <div key={p.id} className="rounded-xl p-5" style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}>
                <p className="mb-4 text-sm font-semibold text-white">Editar produto</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input placeholder="Nome *" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} />
                  <input placeholder="Código: {p.codigo_barras}" value={p.codigo_barras} disabled style={{ ...inputStyle, opacity: 0.4, cursor: "not-allowed" }} />
                  <input placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} />
                  <input placeholder="Preço (R$)" type="number" step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} style={inputStyle} />
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={handleSave} disabled={isPending} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50" style={{ background: ACCENT, color: "#1C1C1C" }}>
                    <Check className="h-3.5 w-3.5" />
                    Salvar
                  </button>
                  <button onClick={() => { setEditingId(null); setForm(empty); }} className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.5)" }}>
                    <X className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div key={p.id} className="flex items-center justify-between rounded-xl px-5 py-4" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
                <div className="min-w-0">
                  <p className="font-medium text-white">{p.nome}</p>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {p.codigo_barras}
                    {p.preco != null && <span className="ml-3 font-sans">R$ {Number(p.preco).toFixed(2)}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBarcodeProduto(p)}
                    title="Ver código de barras"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                    style={{ color: ACCENT }}
                  >
                    <Barcode className="h-4 w-4" />
                  </button>
                  <button onClick={() => startEdit(p)} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}

      {barcodeProduto && (
        <BarcodeModal produto={barcodeProduto} onClose={() => setBarcodeProduto(null)} />
      )}
    </div>
  );
}
