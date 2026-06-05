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
        JsBarcode(svgRef.current, produto.codigo_barras, {
          format: "CODE128",
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

  function handlePrint() {
    const printWindow = window.open("", "_blank", "width=400,height=300");
    if (!printWindow) return;
    const svgHtml = svgRef.current?.outerHTML ?? "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${produto.nome}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
            p { margin: 4px 0 0; font-size: 13px; color: #333; }
            @media print { body { padding: 8mm; } }
          </style>
        </head>
        <body>
          ${svgHtml}
          <p>${produto.nome}</p>
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
