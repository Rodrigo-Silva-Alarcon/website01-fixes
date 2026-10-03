import { ReactNode, useEffect, useRef, useState } from "react";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos antes de iniciar la animación */
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
}

// Curva "ease-out-expo" suave: arranca rápido y frena sin rebote
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Hace aparecer su contenido (fundido + leve subida) cuando entra en pantalla
 * al hacer scroll. Se anima una sola vez y respeta "reducir movimiento".
 * Usa IntersectionObserver + transición CSS (solo opacity/transform, compuestas
 * en GPU) para no cargar framer-motion en la tienda.
 */
export default function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`motion-reduce:!transform-none motion-reduce:!opacity-100 ${className ?? ""}`}
      style={{
        opacity: shown ? 1 : 0,
        // Al terminar queda en "none" para no crear un contexto de apilamiento
        // que afecte a modales o elementos "fixed" dentro de la sección
        transform: shown ? "none" : `translateY(${y}px)`,
        transition: `opacity 0.9s ${EASE} ${delay}s, transform 0.9s ${EASE} ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
