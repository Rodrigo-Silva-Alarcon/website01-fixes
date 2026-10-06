import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

/**
 * "Vaciar carrito" en dos toques: el primero pide confirmación en el mismo botón
 * (sin modal) y vuelve a su estado normal a los 3 s si no se confirma.
 */
export default function ClearCartButton({ onClear, className = "" }: { onClear: () => void; className?: string }) {
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 3000);
    return () => clearTimeout(t);
  }, [confirming]);

  const click = () => {
    if (!confirming) return setConfirming(true);
    setConfirming(false);
    onClear();
  };

  return (
    <button
      type="button"
      onClick={click}
      aria-live="polite"
      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
        confirming ? "bg-[#fdecea] text-[#b42318]" : "text-[#5b6066] hover:bg-[#f4f5f6] hover:text-[#b42318]"
      } ${className}`}
    >
      <Trash2 className="size-4" />
      {confirming ? "¿Vaciar? Toca otra vez" : "Vaciar carrito"}
    </button>
  );
}
