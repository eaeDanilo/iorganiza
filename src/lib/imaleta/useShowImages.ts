"use client";

import { useEffect, useState } from "react";

const KEY = "imaleta:mostrar-fotos";

/**
 * Preferência (salva no navegador) de exibir ou não as fotos de produto nas
 * listagens. Padrão é oculto — o usuário liga explicitamente se quiser ver.
 */
export function useShowImages() {
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    setShowImages(localStorage.getItem(KEY) === "1");
  }, []);

  function toggle() {
    setShowImages((prev) => {
      const next = !prev;
      localStorage.setItem(KEY, next ? "1" : "0");
      return next;
    });
  }

  return { showImages, toggle };
}
