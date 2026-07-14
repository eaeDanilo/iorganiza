"use client";

import { useEffect, useRef } from "react";
import { X, Printer } from "lucide-react";
import type { Produto } from "@/lib/imaleta/types";

interface Props {
  produto: Produto;
  onClose: () => void;
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
    // Versão só-barras para impressão: sem nome, sem número, barras grossas.
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const isEan13 = /^\d{13}$/.test(produto.codigo_barras);
    JsBarcode(svg, produto.codigo_barras, {
      format: isEan13 ? "EAN13" : "CODE128",
      width: 4,
      height: 100,
      displayValue: false,
      margin: 8, // zona de silêncio mínima para o leitor reconhecer
      background: "#FFFFFF",
      lineColor: "#000000",
    });
    // viewBox + preserveAspectRatio="none" fazem o código esticar até
    // preencher todo o papel/etiqueta, no maior tamanho que a impressora der.
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) svg.setAttribute("viewBox", `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "none");

    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${produto.codigo_barras}</title>
          <style>
            @page { margin: 0; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; }
            svg { display: block; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          ${svg.outerHTML}
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
