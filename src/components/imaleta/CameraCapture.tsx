"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RotateCcw, Check, X } from "lucide-react";
import { toast } from "sonner";

const ACCENT = "#DEDAD3";

interface Props {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export function CameraCapture({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [foto, setFoto] = useState<{ blob: Blob; url: string } | null>(null);
  // ref com callback mais recente: effect roda só na montagem, câmera não reinicia
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    let mounted = true;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      })
      .catch(() => {
        toast.error("Câmera não disponível");
        if (mounted) onCloseRef.current();
      });
    return () => {
      mounted = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (foto) URL.revokeObjectURL(foto.url);
    };
  }, [foto]);

  function tirarFoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          toast.error("Falha ao capturar a foto");
          return;
        }
        setFoto({ blob, url: URL.createObjectURL(blob) });
      },
      "image/jpeg",
      0.85
    );
  }

  function usarFoto() {
    if (!foto) return;
    onCapture(new File([foto.blob], `produto-${Date.now()}.jpg`, { type: "image/jpeg" }));
  }

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
          <p className="text-sm font-semibold text-white">
            {foto ? "Usar esta foto?" : "Foto do produto"}
          </p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden rounded-xl" style={{ outline: "1px solid rgba(222,218,211,0.08)" }}>
          <video
            ref={videoRef}
            className="w-full"
            playsInline
            muted
            style={{ display: foto ? "none" : "block" }}
          />
          {foto && <img src={foto.url} alt="Foto capturada" className="w-full" />}
        </div>

        <div className="mt-4 flex gap-2">
          {foto ? (
            <>
              <button
                onClick={usarFoto}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
                style={{ background: ACCENT, color: "#1C1C1C" }}
              >
                <Check className="h-3.5 w-3.5" />
                Usar foto
              </button>
              <button
                onClick={() => setFoto(null)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm transition-colors hover:bg-white/[0.06]"
                style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(222,218,211,0.1)" }}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Tirar outra
              </button>
            </>
          ) : (
            <button
              onClick={tirarFoto}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:brightness-95"
              style={{ background: ACCENT, color: "#1C1C1C" }}
            >
              <Camera className="h-3.5 w-3.5" />
              Tirar foto
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
