import { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso en segundos antes de iniciar la animación */
  delay?: number;
  /** Desplazamiento vertical inicial en px */
  y?: number;
}

// Curva "ease-out-expo" suave: arranca rápido y frena sin rebote
const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Hace aparecer su contenido (fundido + leve subida) cuando entra en pantalla
 * al hacer scroll. Se anima una sola vez y respeta "reducir movimiento".
 */
export default function Reveal({ children, className, delay = 0, y = 32 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(3px)" }}
      // Al terminar se quita el filtro para no crear un contexto de apilamiento
      // que afecte a modales o elementos "fixed" dentro de la sección
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount: 0, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}
