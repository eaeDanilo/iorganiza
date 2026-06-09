"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Barcode, Pencil, Trash2, X, Check, ImageIcon } from "lucide-react";
import type { Produto } from "@/lib/imaleta/types";
import { criarProduto, atualizarProduto, excluirProduto, uploadProdutoImagem } from "../actions";
import { BarcodeModal } from "./BarcodeModal";

const ACCENT = "#DEDAD3";
const BORDER = "rgba(222,218,211,0.08)";
const CARD = "rgba(255,255,255,0.03)";

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(222,218,211,0.1)",
  color: "white",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
  width: "100%",
  outline: "none",
} as const;

interface FormState {
  nome: string;
  descricao: string;
  preco: string;
  codigo_barras: string;
}

const empty: FormState = { nome: "", descricao: "", preco: "", codigo_barras: "" };

interface ImagePickerProps {
  imagemPreview: string | null;
  imagemUrlAtual: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

function ImagePicker({ imagemPreview, imagemUrlAtual, fileInputRef, onFileChange, onRemove }: ImagePickerProps) {
  const display = imagemPreview ?? imagemUrlAtual;
  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        title={display ? "Trocar foto" : "Adicionar foto"}
        className="relative flex-shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-80"
        style={{
          width: 72,
          height: 72,
          background: display ? undefined : "rgba(255,255,255,0.05)",
          border: display ? "none" : "1px dashed rgba(222,218,211,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {display ? (
          <img src={display} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <ImageIcon style={{ color: "rgba(255,255,255,0.2)", width: 22, height: 22 }} />
        )}
      </button>
      <div className="flex flex-col justify-center gap-1 pt-1">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-left text-xs transition-colors hover:brightness-90"
          style={{ color: ACCENT }}
        >
          {display ? "Trocar foto" : "Adicionar foto"}
        </button>
        {display && (
          <button
            type="button"
            onClick={onRemove}
            className="text-left text-xs transition-colors"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            Remover
          </button>
        )}
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
          JPG, PNG, WEBP · máx 5MB
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={onFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

interface ProductFormProps {
  title: string;
  showBarcode?: boolean;
  form: FormState;
  onChange: (form: FormState) => void;
  imagemPreview: string | null;
  imagemUrlAtual: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImagem: () => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}

function ProductForm({
  title,
  showBarcode,
  form,
  onChange,
  imagemPreview,
  imagemUrlAtual,
  fileInputRef,
  onFileChange,
  onRemoveImagem,
  onSave,
  onCancel,
  isPending,
}: ProductFormProps) {
  return (
    <div
      className="mb-4 rounded-xl p-5"
      style={{ background: "rgba(255,255,255,0.04)", outline: "1px solid rgba(222,218,211,0.12)" }}
    >
      <p className="mb-4 text-sm font-semibold text-white">{title}</p>
      <div className="mb-4">
        <ImagePicker
          imagemPreview={imagemPreview}
          imagemUrlAtual={imagemUrlAtual}
          fileInputRef={fileInputRef}
          onFileChange={onFileChange}
          onRemove={onRemoveImagem}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Nome *"
          value={form.nome}
          onChange={(e) => onChange({ ...form, nome: e.target.value })}
          style={inputStyle}
        />
        {showBarcode ? (
          <input
            placeholder="Código de barras (deixe vazio para gerar)"
            value={form.codigo_barras}
            onChange={(e) => onChange({ ...form, codigo_barras: e.target.value })}
            style={inputStyle}
          />
        ) : (
          <input
            value={form.codigo_barras}
            disabled
            style={{ ...inputStyle, opacity: 0.4, cursor: "not-allowed" }}
          />
        )}
        <input
          placeholder="Descrição"
          value={form.descricao}
          onChange={(e) => onChange({ ...form, descricao: e.target.value })}
          style={inputStyle}
        />
        <input
          placeholder="Preço (R$)"
          type="number"
          step="0.01"
          value={form.preco}
          onChange={(e) => onChange({ ...form, preco: e.target.value })}
          style={inputStyle}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95 disabled:opacity-50"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Check className="h-3.5 w-3.5" />
          {isPending ? "Salvando…" : "Salvar"}
        </button>
        <button
          onClick={onCancel}
          disabled={isPending}
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

export function ProdutosUI({ initial }: { initial: Produto[] }) {
  const [produtos, setProdutos] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemUrlAtual, setImagemUrlAtual] = useState<string | null>(null);
  const [barcodeProduto, setBarcodeProduto] = useState<Produto | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    };
  }, [imagemPreview]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function handleRemoveImagem() {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(null);
    setImagemPreview(null);
    setImagemUrlAtual(null);
  }

  function startEdit(p: Produto) {
    setEditingId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: p.preco != null ? String(p.preco) : "",
      codigo_barras: p.codigo_barras,
    });
    setImagemFile(null);
    setImagemPreview(null);
    setImagemUrlAtual(p.imagem_url ?? null);
    setShowForm(false);
  }

  function handleCancel() {
    setEditingId(null);
    setShowForm(false);
    setForm(empty);
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(null);
    setImagemPreview(null);
    setImagemUrlAtual(null);
  }

  function handleSave() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    startTransition(async () => {
      try {
        const preco = form.preco ? parseFloat(form.preco) : undefined;

        let imagemUrl: string | null = imagemUrlAtual;
        if (imagemFile) {
          const fd = new FormData();
          fd.append("file", imagemFile);
          imagemUrl = await uploadProdutoImagem(fd);
        }

        if (editingId) {
          await atualizarProduto(editingId, {
            nome: form.nome,
            descricao: form.descricao,
            preco,
            imagem_url: imagemUrl,
          });
          setProdutos((prev) =>
            prev.map((p) =>
              p.id === editingId
                ? { ...p, nome: form.nome, descricao: form.descricao || null, preco: preco ?? null, imagem_url: imagemUrl }
                : p
            )
          );
          setEditingId(null);
          toast.success("Produto atualizado");
        } else {
          const novo = await criarProduto({
            nome: form.nome,
            descricao: form.descricao,
            preco,
            codigo_barras: form.codigo_barras || undefined,
            imagem_url: imagemUrl,
          });
          setProdutos((prev) => [...prev, novo]);
          setShowForm(false);
          toast.success("Produto criado");
        }

        setForm(empty);
        if (imagemPreview) URL.revokeObjectURL(imagemPreview);
        setImagemFile(null);
        setImagemPreview(null);
        setImagemUrlAtual(null);
      } catch (e: any) {
        toast.error(e.message);
      }
    });
  }

  function handleDeleteConfirm(id: string) {
    setConfirmId(null);
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

  const sharedFormProps = {
    form,
    onChange: setForm,
    imagemPreview,
    imagemUrlAtual,
    fileInputRef,
    onFileChange: handleFileChange,
    onRemoveImagem: handleRemoveImagem,
    onSave: handleSave,
    onCancel: handleCancel,
    isPending,
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(empty);
            setImagemFile(null);
            setImagemPreview(null);
            setImagemUrlAtual(null);
          }}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: ACCENT, color: "#1C1C1C" }}
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </button>
      </div>

      {showForm && !editingId && (
        <ProductForm title="Novo produto" showBarcode {...sharedFormProps} />
      )}

      {produtos.length === 0 && !showForm ? (
        <div className="rounded-xl p-10 text-center" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
          <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum produto cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {produtos.map((p) =>
            editingId === p.id ? (
              <ProductForm key={p.id} title="Editar produto" {...sharedFormProps} />
            ) : (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: CARD, outline: `1px solid ${BORDER}` }}
              >
                {p.imagem_url ? (
                  <img
                    src={p.imagem_url}
                    alt={p.nome}
                    className="flex-shrink-0 rounded-lg object-cover"
                    style={{ width: 40, height: 40 }}
                  />
                ) : (
                  <div
                    className="flex flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ width: 40, height: 40, background: "rgba(222,218,211,0.08)", color: "rgba(222,218,211,0.3)" }}
                  >
                    {p.nome.charAt(0).toUpperCase()}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-white">{p.nome}</p>
                  <p className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    {p.codigo_barras}
                    {p.preco != null && (
                      <span className="ml-3 font-sans">R$ {Number(p.preco).toFixed(2)}</span>
                    )}
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
                  <button
                    onClick={() => startEdit(p)}
                    title="Editar"
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  {confirmId === p.id ? (
                    <div
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1"
                      style={{ background: "rgba(255,80,80,0.08)", outline: "1px solid rgba(255,80,80,0.2)" }}
                    >
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>Excluir?</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteConfirm(p.id)}
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
                      onClick={() => setConfirmId(p.id)}
                      title="Excluir"
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

      {barcodeProduto && (
        <BarcodeModal produto={barcodeProduto} onClose={() => setBarcodeProduto(null)} />
      )}
    </div>
  );
}
