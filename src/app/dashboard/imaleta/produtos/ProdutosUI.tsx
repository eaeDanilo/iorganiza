"use client";

import { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Barcode, Pencil, Trash2, X, Check, ImageIcon, ScanLine, Camera, Upload, Briefcase, Eye, EyeOff, RotateCcw, Clock } from "lucide-react";
import type { Produto } from "@/lib/imaleta/types";
import type { Alocacao } from "@/lib/imaleta/alocacoes";
import { useShowImages } from "@/lib/imaleta/useShowImages";
import { criarProduto, atualizarProduto, excluirProduto, uploadProdutoImagem, restaurarProduto } from "../actions";
import { BarcodeModal } from "./BarcodeModal";
import { BarcodeScanner } from "@/components/imaleta/BarcodeScanner";
import { CameraCapture } from "@/components/imaleta/CameraCapture";

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

const NOMES_DATALIST_ID = "produto-nomes-sugeridos";

// Limite de upload de imagem. Deve ficar <= bodySizeLimit dos Server Actions
// (next.config.js) e à checagem em uploadProdutoImagem.
const MAX_IMAGE_MB = 5;

interface ImagePickerProps {
  imagemPreview: string | null;
  imagemUrlAtual: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCapture: (file: File) => void;
  onRemove: () => void;
}

function ImagePicker({ imagemPreview, imagemUrlAtual, fileInputRef, onFileChange, onCapture, onRemove }: ImagePickerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
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
          onClick={() => setCameraOpen(true)}
          className="flex items-center gap-1.5 text-left text-xs transition-colors hover:brightness-90"
          style={{ color: ACCENT }}
        >
          <Camera className="h-3.5 w-3.5" />
          Tirar foto
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-left text-xs transition-colors hover:brightness-90"
          style={{ color: ACCENT }}
        >
          <Upload className="h-3.5 w-3.5" />
          {display ? "Trocar pelo aparelho" : "Carregar do aparelho"}
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
      {cameraOpen && (
        <CameraCapture
          onCapture={(file) => {
            onCapture(file);
            setCameraOpen(false);
          }}
          onClose={() => setCameraOpen(false)}
        />
      )}
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
  onCaptureImagem: (file: File) => void;
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
  onCaptureImagem,
  onRemoveImagem,
  onSave,
  onCancel,
  isPending,
}: ProductFormProps) {
  const [scanning, setScanning] = useState(false);
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
          onCapture={onCaptureImagem}
          onRemove={onRemoveImagem}
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          placeholder="Nome *"
          value={form.nome}
          onChange={(e) => onChange({ ...form, nome: e.target.value })}
          list={NOMES_DATALIST_ID}
          autoComplete="off"
          style={inputStyle}
        />
        {showBarcode ? (
          <div className="flex gap-2">
            <input
              placeholder="Código de barras (deixe vazio para gerar)"
              value={form.codigo_barras}
              onChange={(e) => onChange({ ...form, codigo_barras: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setScanning(true)}
              title="Bipar com a câmera"
              className="flex flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
              style={{ width: 40, border: "1px solid rgba(222,218,211,0.1)", color: ACCENT }}
            >
              <ScanLine className="h-4 w-4" />
            </button>
          </div>
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

      {scanning && (
        <BarcodeScanner
          onDetect={(code) => {
            const digits = code.replace(/\D/g, "");
            if (!digits) return;
            onChange({ ...form, codigo_barras: digits });
            setScanning(false);
            toast.success(`Código lido: ${digits}`);
          }}
          onClose={() => setScanning(false)}
        />
      )}
    </div>
  );
}

export function ProdutosUI({
  initial,
  vendidos,
  alocacoes,
}: {
  initial: Produto[];
  vendidos: Produto[];
  alocacoes: Record<string, Alocacao>;
}) {
  const [produtos, setProdutos] = useState(initial);
  const [vendidosList, setVendidosList] = useState(vendidos);
  const [tab, setTab] = useState<"ativos" | "vendidos">("ativos");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState<string | null>(null);
  const [imagemUrlAtual, setImagemUrlAtual] = useState<string | null>(null); // URL assinada (display)
  const [imagemPathAtual, setImagemPathAtual] = useState<string | null>(null); // path (persistência)
  const [barcodeProduto, setBarcodeProduto] = useState<Produto | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showImages, toggle: toggleImages } = useShowImages();

  const nomesSugeridos = useMemo(() => {
    const nomes = new Set<string>();
    for (const p of produtos) nomes.add(p.nome);
    for (const p of vendidosList) nomes.add(p.nome);
    return [...nomes].sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [produtos, vendidosList]);

  function handleRestaurar(id: string) {
    setRestoringId(id);
    startTransition(async () => {
      try {
        await restaurarProduto(id);
        const p = vendidosList.find((v) => v.id === id);
        setVendidosList((prev) => prev.filter((v) => v.id !== id));
        if (p) setProdutos((prev) => [{ ...p, status: "active" }, ...prev]);
        toast.success("Produto restaurado");
      } catch (e: any) {
        toast.error(e.message);
      } finally {
        setRestoringId(null);
      }
    });
  }

  function diasRestantes(updatedAt: string): number {
    const passados = (Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(3 - passados));
  }

  useEffect(() => {
    return () => {
      if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    };
  }, [imagemPreview]);

  function applyImagemFile(file: File): boolean {
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      const mb = (file.size / (1024 * 1024)).toFixed(1);
      toast.error(`Imagem de ${mb} MB excede o limite de ${MAX_IMAGE_MB} MB.`);
      return false;
    }
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(file);
    setImagemPreview(URL.createObjectURL(file));
    return true;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) applyImagemFile(file);
    e.target.value = "";
  }

  function handleRemoveImagem() {
    if (imagemPreview) URL.revokeObjectURL(imagemPreview);
    setImagemFile(null);
    setImagemPreview(null);
    setImagemUrlAtual(null);
    setImagemPathAtual(null);
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
    setImagemUrlAtual(p.imagem_signed_url ?? null);
    setImagemPathAtual(p.imagem_url ?? null);
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
    setImagemPathAtual(null);
  }

  function handleSave() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório");
    startTransition(async () => {
      try {
        const preco = form.preco ? parseFloat(form.preco) : undefined;

        let imagemPath: string | null = imagemPathAtual;
        let imagemSigned: string | null = imagemUrlAtual;
        if (imagemFile) {
          const fd = new FormData();
          fd.append("file", imagemFile);
          const up = await uploadProdutoImagem(fd);
          imagemPath = up.path;
          imagemSigned = up.signedUrl;
        }

        if (editingId) {
          await atualizarProduto(editingId, {
            nome: form.nome,
            descricao: form.descricao,
            preco,
            imagem_url: imagemPath,
          });
          setProdutos((prev) =>
            prev.map((p) =>
              p.id === editingId
                ? { ...p, nome: form.nome, descricao: form.descricao || null, preco: preco ?? null, imagem_url: imagemPath, imagem_signed_url: imagemSigned }
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
            imagem_url: imagemPath,
          });
          setProdutos((prev) => [{ ...novo, imagem_signed_url: imagemSigned }, ...prev]);
          setShowForm(false);
          toast.success("Produto criado");
        }

        setForm(empty);
        if (imagemPreview) URL.revokeObjectURL(imagemPreview);
        setImagemFile(null);
        setImagemPreview(null);
        setImagemUrlAtual(null);
        setImagemPathAtual(null);
      } catch (e: any) {
        const raw = typeof e?.message === "string" ? e.message : "Erro ao salvar";
        toast.error(
          raw.includes("Body exceeded")
            ? `Imagem excede o limite de ${MAX_IMAGE_MB} MB.`
            : raw
        );
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
    onCaptureImagem: applyImagemFile,
    onRemoveImagem: handleRemoveImagem,
    onSave: handleSave,
    onCancel: handleCancel,
    isPending,
  };

  return (
    <div>
      <datalist id={NOMES_DATALIST_ID}>
        {nomesSugeridos.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)", outline: `1px solid ${BORDER}` }}>
          {(["ativos", "vendidos"] as const).map((t) => {
            const count = t === "ativos" ? produtos.length : vendidosList.length;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
                style={tab === t ? { background: ACCENT, color: "#1C1C1C" } : { color: "rgba(255,255,255,0.5)" }}
              >
                {t === "ativos" ? "Ativos" : "Vendidos"}
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
        <div className="flex gap-2">
          <button
            onClick={toggleImages}
            title={showImages ? "Ocultar fotos (carrega mais rápido)" : "Mostrar fotos"}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.6)", outline: `1px solid ${BORDER}` }}
          >
            {showImages ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showImages ? "Ocultar fotos" : "Mostrar fotos"}
          </button>
          {tab === "ativos" && (
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setForm(empty);
                setImagemFile(null);
                setImagemPreview(null);
                setImagemUrlAtual(null);
                setImagemPathAtual(null);
              }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
              style={{ background: ACCENT, color: "#1C1C1C" }}
            >
              <Plus className="h-4 w-4" />
              Novo produto
            </button>
          )}
        </div>
      </div>

      {tab === "vendidos" && (
        <p className="mb-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          Produtos vendidos numa conferência ficam aqui por 3 dias e depois são excluídos automaticamente para liberar espaço de armazenamento das fotos.
        </p>
      )}

      {tab === "ativos" && showForm && !editingId && (
        <ProductForm title="Novo produto" showBarcode {...sharedFormProps} />
      )}

      {tab === "vendidos" ? (
        vendidosList.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ background: CARD, outline: `1px solid ${BORDER}` }}>
            <p style={{ color: "rgba(255,255,255,0.35)" }}>Nenhum produto vendido nos últimos 3 dias.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {vendidosList.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{ background: CARD, outline: `1px solid ${BORDER}` }}
              >
                {showImages && p.imagem_signed_url ? (
                  <img
                    src={p.imagem_signed_url}
                    alt={p.nome}
                    loading="lazy"
                    className="flex-shrink-0 rounded-lg object-cover opacity-50"
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
                  <span
                    className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    Exclui em {diasRestantes(p.updated_at)} dia{diasRestantes(p.updated_at) === 1 ? "" : "s"}
                  </span>
                </div>
                <button
                  onClick={() => handleRestaurar(p.id)}
                  disabled={restoringId === p.id || isPending}
                  title="Restaurar para Produtos ativos"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                  style={{ color: ACCENT }}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar
                </button>
              </div>
            ))}
          </div>
        )
      ) : produtos.length === 0 && !showForm ? (
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
                {showImages && p.imagem_signed_url ? (
                  <img
                    src={p.imagem_signed_url}
                    alt={p.nome}
                    loading="lazy"
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
                  {alocacoes[p.id] && (
                    <span
                      className="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                      title={`Maleta: ${alocacoes[p.id].maletaNome}`}
                    >
                      <Briefcase className="h-2.5 w-2.5" />
                      Na maleta de {alocacoes[p.id].vendedorNome}
                    </span>
                  )}
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
