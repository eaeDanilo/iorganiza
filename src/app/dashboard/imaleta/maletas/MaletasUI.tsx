"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Plus, Briefcase, Trash2, X, Check, Minus, Pencil, ScanBarcode, ScanLine, Eye, EyeOff, Printer, PackagePlus, Clock } from "lucide-react";
import type { Maleta, Produto, Vendedor } from "@/lib/imaleta/types";
import type { Alocacao } from "@/lib/imaleta/alocacoes";
import { useShowImages } from "@/lib/imaleta/useShowImages";
import { formatCurrency } from "@/lib/utils";
import { criarMaleta, excluirMaleta, atualizarMaleta, buscarItensMaleta } from "../actions";
import { BarcodeScanner } from "@/components/imaleta/BarcodeScanner";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

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
  alocacoes,
  onAdd,
  onRemove,
  onChangeQty,
}: {
  currentItems: ItemEntry[];
  produtos: Pick<Produto, "id" | "nome" | "codigo_barras" | "preco" | "imagem_url" | "imagem_signed_url" | "created_at">[];
  alocacoes: Record<string, Alocacao>;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onChangeQty: (id: string, delta: number) => void;
}) {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const barcodeRef = useRef<HTMLInputElement>(null);
  const { showImages, toggle: toggleImages } = useShowImages();
  const [recentDate, setRecentDate] = useState(() => new Date().toISOString().slice(0, 10));

  function addAllUnallocated() {
    const candidatos = produtos.filter(
      (p) => !currentItems.some((i) => i.produto_id === p.id) && !alocacoes[p.id]
    );
    if (candidatos.length === 0) {
      return void toast.info("Nenhum produto sem maleta para adicionar");
    }
    candidatos.forEach((p) => onAdd(p.id));
    toast.success(`${candidatos.length} produto${candidatos.length > 1 ? "s" : ""} adicionado${candidatos.length > 1 ? "s" : ""}`);
  }

  function addAllRecent() {
    const cutoff = new Date(`${recentDate}T00:00:00`);
    const elegiveis: typeof produtos = [];
    let bloqueados = 0;
    for (const p of produtos) {
      if (currentItems.some((i) => i.produto_id === p.id)) continue;
      if (!p.created_at || new Date(p.created_at) < cutoff) continue;
      if (alocacoes[p.id]) { bloqueados++; continue; }
      elegiveis.push(p);
    }
    if (elegiveis.length === 0) {
      return void toast.info(
        bloqueados > 0
          ? `Os produtos recentes já estão em outras maletas (${bloqueados})`
          : "Nenhum produto recente encontrado nesse período"
      );
    }
    elegiveis.forEach((p) => onAdd(p.id));
    toast.success(
      `${elegiveis.length} produto${elegiveis.length > 1 ? "s" : ""} adicionado${elegiveis.length > 1 ? "s" : ""}` +
        (bloqueados > 0 ? ` — ${bloqueados} já em outras maletas` : "")
    );
  }

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
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
          Produtos na maleta
        </p>
        <button
          type="button"
          onClick={toggleImages}
          title={showImages ? "Ocultar fotos (carrega mais rápido)" : "Mostrar fotos"}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-white/[0.06]"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          {showImages ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showImages ? "Ocultar fotos" : "Mostrar fotos"}
        </button>
      </div>
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

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addAllUnallocated}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.06]"
          style={{ border: "1px solid rgba(222,218,211,0.15)", color: ACCENT }}
          title="Adiciona todos os produtos que não estão em nenhuma maleta"
        >
          <PackagePlus className="h-3.5 w-3.5" />
          Adicionar sem maleta
        </button>
        <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ border: "1px solid rgba(222,218,211,0.15)" }}>
          <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
          <input
            type="date"
            value={recentDate}
            onChange={(e) => setRecentDate(e.target.value)}
            min="2000-01-01"
            max="2200-12-31"
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "12px",
              outline: "none",
              colorScheme: "dark",
            }}
          />
          <button
            type="button"
            onClick={addAllRecent}
            className="flex-shrink-0 text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: ACCENT }}
            title="Adiciona produtos cadastrados a partir dessa data"
          >
            Adicionar recentes
          </button>
        </div>
      </div>

      <select
        onChange={(e) => { onAdd(e.target.value); e.target.value = ""; }}
        style={{ ...SELECT_STYLE, width: "auto", minWidth: "200px" }}
        defaultValue=""
      >
        <option value="" style={OPTION_STYLE}>+ Adicionar por nome</option>
        {produtos
          .filter((p) => !currentItems.some((i) => i.produto_id === p.id))
          .map((p) => (
            <option key={p.id} value={p.id} style={OPTION_STYLE}>
              {p.nome}{alocacoes[p.id] ? ` — em uso (${alocacoes[p.id].vendedorNome})` : ""}
            </option>
          ))}
      </select>
      {currentItems.length > 0 && (
        <div className="mt-3 space-y-2">
          {currentItems.map((item) => {
            const prod = produtos.find((p) => p.id === item.produto_id);
            return (
              <div key={item.produto_id} className="flex items-center justify-between rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2.5">
                  {showImages && prod?.imagem_signed_url ? (
                    <img
                      src={prod.imagem_signed_url}
                      alt={prod.nome}
                      loading="lazy"
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
  alocacoes,
}: {
  initial: Maleta[];
  vendedores: Pick<Vendedor, "id" | "nome">[];
  produtos: Pick<Produto, "id" | "nome" | "codigo_barras" | "preco" | "imagem_url" | "imagem_signed_url" | "created_at">[];
  alocacoes: Record<string, Alocacao>;
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
  const [printingId, setPrintingId] = useState<string | null>(null);

  // Create item helpers
  function addItem(produtoId: string) {
    if (!produtoId) return;
    const aloc = alocacoes[produtoId];
    if (aloc) {
      return void toast.error(`Produto já está na maleta "${aloc.maletaNome}" (${aloc.vendedorNome})`);
    }
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
    const aloc = alocacoes[produtoId];
    if (aloc && aloc.maletaId !== editId) {
      return void toast.error(`Produto já está na maleta "${aloc.maletaNome}" (${aloc.vendedorNome})`);
    }
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

  async function handlePrintMaleta(m: Maleta) {
    setPrintingId(m.id);
    try {
      const itensMaleta = await buscarItensMaleta(m.id);
      const linhas = (itensMaleta as any[])
        .map((i) => ({
          nome: i.produtos?.nome ?? "Produto",
          preco: i.produtos?.preco ?? null,
          quantidade: i.quantidade ?? 1,
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

      if (linhas.length === 0) {
        toast.error("Maleta sem produtos para imprimir");
        return;
      }

      const total = linhas.reduce((sum, l) => sum + (l.preco ?? 0) * l.quantidade, 0);
      const vendedorNome = vendedores.find((v) => v.id === m.vendedor_id)?.nome ?? (m as any).vendedores?.nome ?? "";
      const N = linhas.length;
      const fmtNum = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      // Agrupa por nome do produto (categoria): só os preços aparecem embaixo do
      // cabeçalho, sem repetir o nome em cada linha — economiza muito espaço.
      const categorias = new Map<string, number[]>();
      for (const l of linhas) {
        const precos = categorias.get(l.nome) ?? [];
        for (let q = 0; q < l.quantidade; q++) precos.push(l.preco ?? 0);
        categorias.set(l.nome, precos);
      }
      const categoriasOrdenadas = [...categorias.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));

      const headerHtml = `
        <header>
          <div>
            <h1>${escapeHtml(m.nome)}</h1>
            <div class="meta">
              <div><strong>Vendedor(a):</strong> ${escapeHtml(vendedorNome)}</div>
              <div><strong>Período:</strong> ${escapeHtml(m.periodo_inicio)}</div>
            </div>
          </div>
          <div class="meta">Impresso em ${escapeHtml(new Date().toLocaleDateString("pt-BR"))}</div>
        </header>`;

      const cats = categoriasOrdenadas.map(([nomeCat, precos]) => ({
        header: `${nomeCat} N${String(precos.length).padStart(2, "0")}`,
        precos,
        subtotal: precos.reduce((s, p) => s + p, 0),
      }));

      const CSS = `
        @page { size: A4; margin: 12mm 10mm; }
        * { box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; color: #111; margin: 0; }
        header {
          display: flex; justify-content: space-between; align-items: flex-end;
          border-bottom: 2px solid #111; padding-bottom: 8px; margin-bottom: 10px;
        }
        h1 { font-size: 18px; margin: 0 0 5px; }
        .meta { font-size: 11px; color: #444; line-height: 1.5; }
        .meta strong { color: #111; }
        .pagina { display: flex; gap: 4mm; align-items: flex-start; }
        .coluna { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3mm; }
        .cat { border: 0.3mm solid #999; }
        .cat-header {
          background: #FCE0B8; font-weight: 700; text-transform: uppercase;
          font-size: 2.6mm; padding: 1.3mm 1.5mm; border-bottom: 0.3mm solid #999;
        }
        .preco-row, .cat-sub {
          display: flex; justify-content: space-between; font-size: 2.6mm;
          padding: 0.9mm 1.5mm; border-bottom: 0.3mm solid #ddd; font-variant-numeric: tabular-nums;
        }
        .cat-sub { background: #E2E2E2; font-weight: 700; border-bottom: none; }
        .rodape {
          margin-top: 4mm; padding-top: 3mm; border-top: 0.6mm solid #111;
          font-weight: 700; font-size: 3.6mm; display: flex; justify-content: space-between;
        }
        .assinaturas { margin-top: 14mm; display: flex; gap: 12mm; }
        .linha-assinatura { flex: 1; border-top: 0.3mm solid #333; padding-top: 1.5mm; font-size: 2.6mm; color: #555; text-align: center; }
      `;

      // Mede a altura real (renderizada) do cabeçalho da página, do cabeçalho de
      // categoria, de uma linha de preço e da linha de subtotal numa div escondida.
      // Com essas medidas, distribuo linha a linha em páginas/colunas — categorias
      // grandes viram vários blocos, cada um repetindo o cabeçalho da categoria.
      const COLS = 4;
      const MARGIN_MM = 12;
      const GAP_MM = 4;
      const contentWidthMm = 210 - 2 * MARGIN_MM;
      const colWidthMm = (contentWidthMm - (COLS - 1) * GAP_MM) / COLS;
      const mmToPx = (mm: number) => (mm * 96) / 25.4;
      const pageHeightPx = mmToPx(297 - 2 * MARGIN_MM) * 0.94; // 6% de folga de segurança

      const medidor = document.createElement("div");
      medidor.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;";
      medidor.innerHTML = `
        <style>${CSS}</style>
        <div style="width:${contentWidthMm}mm">${headerHtml}</div>
        <div style="width:${colWidthMm}mm" class="cat">
          <div class="cat-header">Amostra</div>
          <div class="preco-row"><span>R$</span><span>0,00</span></div>
          <div class="cat-sub"><span>R$</span><span>0,00</span></div>
        </div>`;
      document.body.appendChild(medidor);
      const pageHeaderHeightPx = (medidor.querySelector("header") as HTMLElement).offsetHeight;
      const catWrapper = medidor.querySelector(".cat") as HTMLElement;
      const catHeaderHeightPx = (medidor.querySelector(".cat-header") as HTMLElement).offsetHeight;
      const rowHeightPx = (medidor.querySelector(".preco-row") as HTMLElement).offsetHeight;
      const subHeightPx = (medidor.querySelector(".cat-sub") as HTMLElement).offsetHeight;
      const overheadPx = catWrapper.offsetHeight - catHeaderHeightPx - rowHeightPx - subHeightPx;
      const gapPx = mmToPx(3); // gap vertical entre blocos empilhados numa coluna (.coluna { gap: 3mm })
      document.body.removeChild(medidor);

      interface Chunk { header: string; precos: number[]; subtotal: number | null }
      const paginas: Chunk[][][] = [[[], [], [], []]];
      let colHeights = [0, 0, 0, 0];
      let budget = pageHeightPx - pageHeaderHeightPx;

      function proximaColuna() {
        let ci = 0;
        for (let c = 1; c < COLS; c++) if (colHeights[c] < colHeights[ci]) ci = c;
        return ci;
      }
      function novaPagina() {
        paginas.push([[], [], [], []]);
        colHeights = [0, 0, 0, 0];
        budget = pageHeightPx;
      }

      for (const cat of cats) {
        let rowStart = 0;
        let remaining = cat.precos.length;
        let subtotalPendente = true;
        while (remaining > 0 || subtotalPendente) {
          let ci = proximaColuna();
          let gap = colHeights[ci] > 0 ? gapPx : 0;
          let avail = budget - colHeights[ci] - gap;
          const minimo = catHeaderHeightPx + overheadPx + (remaining > 0 ? rowHeightPx : subHeightPx);
          if (avail < minimo && colHeights.some((v) => v > 0)) {
            novaPagina();
            ci = proximaColuna();
            gap = 0;
            avail = budget - colHeights[ci];
          }

          if (remaining > 0) {
            const roomForRows = avail - catHeaderHeightPx - overheadPx;
            const rowsFit = Math.max(1, Math.min(remaining, Math.floor(roomForRows / rowHeightPx)));
            let incluiSubtotal = false;
            if (rowsFit === remaining && roomForRows - rowsFit * rowHeightPx >= subHeightPx) {
              incluiSubtotal = true;
            }
            const chunk: Chunk = {
              header: cat.header,
              precos: cat.precos.slice(rowStart, rowStart + rowsFit),
              subtotal: incluiSubtotal ? cat.subtotal : null,
            };
            paginas[paginas.length - 1][ci].push(chunk);
            colHeights[ci] += gap + catHeaderHeightPx + overheadPx + rowsFit * rowHeightPx + (incluiSubtotal ? subHeightPx : 0);
            rowStart += rowsFit;
            remaining -= rowsFit;
            if (remaining === 0) subtotalPendente = !incluiSubtotal;
          } else {
            const chunk: Chunk = { header: cat.header, precos: [], subtotal: cat.subtotal };
            paginas[paginas.length - 1][ci].push(chunk);
            colHeights[ci] += gap + catHeaderHeightPx + overheadPx + subHeightPx;
            subtotalPendente = false;
          }
        }
      }

      const chunkHtml = (c: Chunk) => `
        <div class="cat">
          <div class="cat-header">${escapeHtml(c.header)}</div>
          ${c.precos.map((p) => `<div class="preco-row"><span>R$</span><span>${fmtNum(p)}</span></div>`).join("")}
          ${c.subtotal != null ? `<div class="cat-sub"><span>R$</span><span>${fmtNum(c.subtotal)}</span></div>` : ""}
        </div>`;

      const paginasHtml = paginas
        .map((colunas, i) => {
          const colunasHtml = colunas
            .map((chunks) => `<div class="coluna">${chunks.map(chunkHtml).join("")}</div>`)
            .join("");
          return `<div class="pagina"${i > 0 ? ' style="page-break-before:always;"' : ""}>${colunasHtml}</div>`;
        })
        .join("");

      const printWindow = window.open("", "_blank", "width=850,height=1100");
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${escapeHtml(m.nome)}</title>
            <style>${CSS}</style>
          </head>
          <body>
            ${headerHtml}
            ${paginasHtml}
            <div class="rodape">
              <span>Total (${N} ${N === 1 ? "item" : "itens"})</span>
              <span>${escapeHtml(formatCurrency(total))}</span>
            </div>
            <div class="assinaturas">
              <div class="linha-assinatura">Total vendido</div>
              <div class="linha-assinatura">Total devolvido</div>
              <div class="linha-assinatura">Assinatura</div>
            </div>
            <script>window.onload = () => { window.print(); };</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao gerar impressão");
    } finally {
      setPrintingId(null);
    }
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
            <ItemsEditor currentItems={items} produtos={produtos} alocacoes={alocacoes} onAdd={addItem} onRemove={removeItem} onChangeQty={changeQty} />
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
                    <ItemsEditor currentItems={editItems} produtos={produtos} alocacoes={alocacoes} onAdd={addEditItem} onRemove={removeEditItem} onChangeQty={changeEditQty} />
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
                  <button
                    onClick={() => handlePrintMaleta(m)}
                    disabled={printingId === m.id}
                    className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06] disabled:opacity-50"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                    title="Imprimir lista de produtos (A4)"
                  >
                    <Printer className="h-3.5 w-3.5" />
                  </button>
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
