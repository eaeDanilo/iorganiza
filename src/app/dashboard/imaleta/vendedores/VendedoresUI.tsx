"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import type { Vendedor } from "@/lib/imaleta/types";
import { criarVendedor, atualizarVendedor, excluirVendedor } from "../actions";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";
const CARD = "rgba(255,255,255,0.03)";

interface FormState {
  nome: string;
  telefone: string;
  email: string;
}

const empty: FormState = { nome: "", telefone: "", email: "" };

export function VendedoresUI({ initial }: { initial: Vendedor[] }) {
  const [vendedores, setVendedores] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEdit(v: Vendedor) {
    setEditingId(v.id);
    setForm({ nome: v.nome, telefone: v.telefone ?? "", email: v.email ?? "" });
    setShowForm(false);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(empty);
  }

  function handleSave() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    startTransition(async () => {
      try {
        if (editingId) {
          await atualizarVendedor(editingId, form);
          setVendedores((prev) =>
            prev.map((v) =>
              v.id === editingId ? { ...v, ...form, telefone: form.telefone || null, email: form.email || null } : v
            )
          );
          setEditingId(null);
          toast.success("Vendedor atualizado");
        } else {
          await criarVendedor(form);
          setShowForm(false);
          toast.success("Vendedor criado");
        }
        setForm(empty);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  function handleDeleteConfirm(id: string) {
    setConfirmId(null);
    startTransition(async () => {
      try {
        await excluirVendedor(id);
        setVendedores((prev) => prev.filter((v) => v.id !== id));
        toast.success("Vendedor removido");
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(empty); }}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Plus className="h-4 w-4" />
          Novo vendedor
        </button>
      </div>

      {(showForm && !editingId) && (
        <VendedorForm
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setForm(empty); }}
          isPending={isPending}
          title="Novo vendedor"
        />
      )}

      {vendedores.length === 0 && !showForm ? (
        <div
          className="rounded-xl p-10 text-center"
          style={{ background: CARD, outline: `1px solid ${BORDER}` }}
        >
          <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum vendedor cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {vendedores.map((v) =>
            editingId === v.id ? (
              <VendedorForm
                key={v.id}
                form={form}
                setForm={setForm}
                onSave={handleSave}
                onCancel={cancelEdit}
                isPending={isPending}
                title="Editar vendedor"
              />
            ) : (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-xl px-5 py-4"
                style={{ background: CARD, outline: `1px solid ${BORDER}` }}
              >
                <div>
                  <p className="font-medium text-white">{v.nome}</p>
                  <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {[v.telefone, v.email].filter(Boolean).join(" · ") || "Sem contato"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(v)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmId === v.id ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                      style={{ background: "rgba(255,80,80,0.08)", outline: "1px solid rgba(255,80,80,0.2)" }}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Excluir?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(v.id)}
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
                      onClick={() => setConfirmId(v.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-red-500/10"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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

function VendedorForm({
  form,
  setForm,
  onSave,
  onCancel,
  isPending,
  title,
}: {
  form: FormState;
  setForm: (f: FormState) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
  title: string;
}) {
  const BORDER = "rgba(222,218,211,0.1)";
  const inputStyle = {
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${BORDER}`,
    color: "white",
    borderRadius: "8px",
    padding: "8px 12px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
  };

  return (
    <div
      className="mb-4 rounded-xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid rgba(222,218,211,0.12)` }}
    >
      <p className="mb-4 text-sm font-semibold text-white">{title}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input
          placeholder="Nome *"
          value={form.nome}
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Telefone"
          value={form.telefone}
          onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="E-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={inputStyle}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50"
          style={{ background: "#DEDAD3", color: "#1C1C1C" }}
        >
          <Check className="h-3.5 w-3.5" />
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <X className="h-3.5 w-3.5" />
          Cancelar
        </button>
      </div>
    </div>
  );
}
