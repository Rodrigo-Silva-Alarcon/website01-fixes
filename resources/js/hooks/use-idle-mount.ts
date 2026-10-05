import { useEffect, useState } from "react";

/**
 * false en el HTML del servidor y en la hidratación; true cuando el navegador queda libre.
 * Para montar partes que no se ven al cargar (paneles cerrados, copias para animaciones):
 * salen del HTML inicial y no compiten con la hidratación.
 */
export function useIdleMount(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(id);
  }, []);

  return ready;
}
