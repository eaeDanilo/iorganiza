"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onDetect: (code: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onDetect, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  // refs com callbacks mais recentes: effect roda só na montagem, câmera não reinicia
  const onDetectRef = useRef(onDetect);
  const onCloseRef = useRef(onClose);
  onDetectRef.current = onDetect;
  onCloseRef.current = onClose;

  useEffect(() => {
    let mounted = true;
    import("@zxing/browser").then(({ BrowserMultiFormatReader }) => {
      if (!mounted || !videoRef.current) return;
      const reader = new BrowserMultiFormatReader();
      reader
        .decodeFromConstraints(
          { video: { facingMode: "environment" } },
          videoRef.current,
          (result) => {
            if (result && mounted) {
              onDetectRef.current(result.getText().trim());
            }
          }
        )
        .then((controls) => {
          if (mounted) controlsRef.current = controls;
          else controls.stop();
        })
        .catch(() => {
          toast.error("Câmera não disponível");
          if (mounted) onCloseRef.current();
        });
    });
    return () => {
      mounted = false;
      controlsRef.current?.stop();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#1C1C1C", outline: "1px solid rgba(222,218,211,0.12)" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Aponte para o código de barras</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-hidden rounded-xl" style={{ outline: "1px solid rgba(222,218,211,0.08)" }}>
          <video ref={videoRef} className="w-full" playsInline muted />
        </div>
        <p className="mt-3 text-center text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          O código é preenchido automaticamente ao ser reconhecido.
        </p>
      </div>
    </div>
  );
}
