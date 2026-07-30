"use client";

import { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";
import type { Produto } from "@/lib/imaleta/types";

interface Props {
  produto: Produto;
  onClose: () => void;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function BarcodeModal({ produto, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let mounted = true;
    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      if (svgRef.current && mounted) {
        const isEan13 = /^\d{13}$/.test(produto.codigo_barras);
        JsBarcode(svgRef.current, produto.codigo_barras, {
          format: isEan13 ? "EAN13" : "CODE128",
          width: 2.5,
          height: 90,
          displayValue: true,
          fontSize: 14,
          margin: 14,
          background: "#FFFFFF",
          lineColor: "#111111",
        });
      }
    });
    return () => { mounted = false; };
  }, [produto.codigo_barras]);

  async function handlePrint() {
    const { default: JsBarcode } = await import("jsbarcode");
    // Barras só, sem número embaixo (o número já aparece como texto ao lado).
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const isEan13 = /^\d{13}$/.test(produto.codigo_barras);
    JsBarcode(svg, produto.codigo_barras, {
      format: isEan13 ? "EAN13" : "CODE128",
      width: 2,
      height: 100,
      displayValue: false,
      margin: 4, // zona de silêncio mínima para o leitor reconhecer
      background: "#FFFFFF",
      lineColor: "#000000",
    });
    // viewBox + preserveAspectRatio="none" fazem o código esticar até
    // preencher a área reservada a ele dentro da etiqueta.
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "none");

    const preco = produto.preco != null
      ? produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "";
    const nomeEscapado = escapeHtml(produto.nome);
    const precoEscapado = escapeHtml(preco);

    // Etiqueta térmica para joias: 95mm x 12mm, 1 coluna, sem margens.
    // Layout da mídia: 0-30mm etiqueta, 30-60mm etiqueta duplicada, 60-95mm alça (em branco).
    const bloco = `
      <div class="bloco">
        ${svg.outerHTML}
        <div class="info">
          <div class="nome">${nomeEscapado}</div>
          <div class="preco">${precoEscapado}</div>
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank", "width=500,height=200");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${produto.codigo_barras}</title>
          <style>
            @page { size: 95mm 12mm; margin: 0; }
            html, body { margin: 0; padding: 0; width: 95mm; height: 12mm; }
            .rolo {
              display: flex;
              width: 95mm;
              height: 12mm;
              overflow: hidden;
              font-family: Arial, Helvetica, sans-serif;
            }
            .bloco {
              flex: 0 0 30mm;
              width: 30mm;
              height: 12mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: hidden;
            }
            .bloco svg { flex: 0 0 5.3mm; width: 100%; height: 5.3mm; margin-bottom: 0.3mm; }
            .info {
              flex: 0 0 4.5mm;
              height: 4.5mm;
              display: flex;
              flex-direction: column;
              justify-content: center;
              overflow: hidden;
              padding: 0 1.2mm;
            }
            .nome {
              font-size: 1.9mm;
              line-height: 1.1;
              font-weight: 500;
              letter-spacing: 0.02mm;
              color: #333;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .preco {
              font-size: 2.1mm;
              line-height: 1.15;
              font-weight: 700;
              letter-spacing: 0.02mm;
            }
            .alca { flex: 0 0 35mm; width: 35mm; height: 12mm; }
          </style>
        </head>
        <body>
          <div class="rolo">
            ${bloco}
            ${bloco}
            <div class="alca"></div>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: "#1C1C1C", outline: "1px solid rgba(222,218,211,0.12)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">{produto.nome}</p>
            <p className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
              {produto.codigo_barras}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex justify-center rounded-xl bg-white p-4">
          <svg ref={svgRef} />
        </div>

        <button
          onClick={handlePrint}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all hover:brightness-95"
          style={{ background: "#DEDAD3", color: "#1C1C1C" }}
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
      </div>
    </div>
  );
}
