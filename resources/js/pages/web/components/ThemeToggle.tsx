import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "sf-theme";
const DARK_CLASS = "sf-dark";

const isDarkNow = () => document.documentElement.classList.contains(DARK_CLASS);

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.toggle(DARK_CLASS, dark);
  root.style.colorScheme = dark ? "dark" : "light";
  try {
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    /* almacenamiento bloqueado: el tema solo dura esta visita */
  }
}

/**
 * Botón discreto (icono luna/sol) para alternar el modo oscuro de la tienda.
 * Usa View Transitions para un fundido suave; si el navegador no lo soporta,
 * activa transiciones CSS de color durante el cambio.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  // Arranca en claro (igual que el HTML del servidor) y se sincroniza al montar
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const current = isDarkNow();
    setDark(current);
    // initializeTheme() fija color-scheme: light al cargar; se reaplica el del tema elegido
    document.documentElement.style.colorScheme = current ? "dark" : "light";
    // Sin animar el icono en la sincronización inicial
    requestAnimationFrame(() => setReady(true));
  }, []);

  const toggle = () => {
    const next = !dark;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };

    if (doc.startViewTransition && !reduceMotion) {
      doc.startViewTransition(() => applyTheme(next));
    } else {
      const root = document.documentElement;
      root.classList.add("sf-theme-anim");
      applyTheme(next);
      window.setTimeout(() => root.classList.remove("sf-theme-anim"), 500);
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-pressed={dark}
      title={dark ? "Modo claro" : "Modo oscuro"}
      className={`relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#191c1f] cursor-pointer transition-colors duration-200 hover:bg-[#f4f5f6] ${className}`}
    >
      <Moon
        className={`absolute size-[19px] ${ready ? "transition-all duration-500" : ""} ease-out ${
          dark ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
        strokeWidth={1.8}
        aria-hidden="true"
      />
      <Sun
        className={`absolute size-5 text-[#fa8232] ${ready ? "transition-all duration-500" : ""} ease-out ${
          dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </button>
  );
}
