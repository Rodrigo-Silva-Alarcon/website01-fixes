import { ReactNode, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

/** Alturas de la hoja en teléfono (fracción de la pantalla) entre las que se puede arrastrar. */
const SNAPS = [0.5, 0.88, 0.96];
const DEFAULT_SNAP = 1;
const CLOSE_AT = 0.32;
const STORAGE_KEY = "sf-filter-sheet";
const EASE = "cubic-bezier(.2,.8,.2,1)";
const DURATION = 380;
const SHEET_W = "min(400px, 88vw)";

type Side = "left" | "right";
type Saved = { snap: number; side: Side };

function load(): Saved {
  try {
    const v = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return {
      snap: Number.isInteger(v.snap) && v.snap >= 0 && v.snap < SNAPS.length ? v.snap : DEFAULT_SNAP,
      side: v.side === "right" ? "right" : "left",
    };
  } catch {
    return { snap: DEFAULT_SNAP, side: "left" };
  }
}

function save(v: Saved) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  } catch {
    /* almacenamiento bloqueado: la posición solo dura esta visita */
  }
}

/**
 * Hoja de filtros que el usuario puede mover:
 * - teléfono: hoja inferior; se arrastra desde la barrita entre tres alturas, y hacia abajo se cierra.
 * - tablet: cajón lateral; se arrastra desde la cabecera y se acopla a la izquierda o a la derecha.
 * La altura o el lado elegidos se recuerdan para la próxima vez.
 */
export default function DraggableSheet({
  open, onClose, phone, title, headerActions, fit = false, footer, children,
}: {
  open: boolean;
  onClose: () => void;
  phone: boolean;
  title: string;
  headerActions?: ReactNode;
  /** La hoja toma la altura de su contenido (p. ej. "Ordenar por") en vez de las alturas fijas. */
  fit?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const [pos, setPos] = useState<Saved>({ snap: DEFAULT_SNAP, side: "left" });
  const [drag, setDrag] = useState<number | null>(null); // desplazamiento en px mientras se arrastra
  const start = useRef<{ x: number; y: number; h: number; w: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setPos(load()), []);

  // Montaje con animación de entrada y salida
  useEffect(() => {
    if (open) return setMounted(true);
    setShown(false);
    const t = window.setTimeout(() => setMounted(false), DURATION);
    return () => window.clearTimeout(t);
  }, [open]);

  // Ya montada fuera de pantalla: se fuerza el cálculo de estilos y luego entra con transición
  useEffect(() => {
    if (!mounted || !open) return;
    panelRef.current?.getBoundingClientRect();
    setShown(true);
  }, [mounted, open]);

  // Escape cierra y el fondo no se desplaza mientras está abierta
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const r = panelRef.current?.getBoundingClientRect();
    start.current = { x: e.clientX, y: e.clientY, h: r?.height ?? 0, w: r?.width ?? 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    setDrag(phone ? e.clientY - start.current.y : e.clientX - start.current.x);
  };

  // Cerrar arrastrando: la salida empieza donde el dedo soltó la hoja (sin volver antes a su sitio)
  const dismiss = () => {
    setShown(false);
    onClose();
  };

  const onPointerUp = () => {
    const s = start.current;
    start.current = null;
    if (!s || drag === null) return setDrag(null);
    const delta = drag;
    setDrag(null);

    if (phone) {
      const vh = window.innerHeight;
      const height = (s.h - delta) / vh;
      if (fit) {
        if (delta > s.h * 0.3) dismiss();
        return;
      }
      if (height < CLOSE_AT) return dismiss();
      // la altura más cercana a donde se soltó
      const snap = SNAPS.reduce((best, v, i) => (Math.abs(v - height) < Math.abs(SNAPS[best] - height) ? i : best), 0);
      const next = { ...pos, snap };
      setPos(next);
      save(next);
      return;
    }

    // tablet: hacia fuera cierra; si no, se acopla al lado donde quedó su centro
    const outward = pos.side === "left" ? -delta : delta;
    if (outward > 120) return dismiss();
    const startLeft = pos.side === "left" ? 0 : window.innerWidth - s.w;
    const center = startLeft + delta + s.w / 2;
    const side: Side = center > window.innerWidth / 2 ? "right" : "left";
    const next = { ...pos, side };
    setPos(next);
    save(next);
  };

  const dragging = drag !== null;
  // cuánto se ha alejado la hoja hacia su salida (0–1): el fondo se aclara a la par
  const size = start.current ? (phone ? start.current.h : start.current.w) : 0;
  const away = !dragging || !size ? 0 : phone ? drag : pos.side === "left" ? -drag : drag;
  const dragProgress = away > 0 ? Math.min(1, away / size) : 0;
  const transition = dragging ? "none" : `transform ${DURATION}ms ${EASE}, height ${DURATION}ms ${EASE}, left ${DURATION}ms ${EASE}`;

  let style: React.CSSProperties;
  if (phone) {
    const base = fit ? undefined : `${SNAPS[pos.snap] * 100}dvh`;
    style = {
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: "96dvh",
      borderRadius: "28px 28px 0 0",
      boxShadow: "0 -10px 40px rgba(25,28,31,.18)",
      // arrastrar hacia arriba agranda la hoja; hacia abajo la desplaza para cerrar
      height: fit ? "auto" : dragging && drag < 0 ? `calc(${base} - ${drag}px)` : base,
      transform: shown ? `translateY(${dragging && drag > 0 ? drag : 0}px)` : "translateY(100%)",
      transition,
    };
  } else {
    const hidden = pos.side === "left" ? "translateX(-100%)" : "translateX(100%)";
    // siempre con "left" para que el cambio de lado también se anime
    style = {
      top: 0,
      bottom: 0,
      width: SHEET_W,
      left: pos.side === "left" ? 0 : `calc(100% - ${SHEET_W})`,
      borderRadius: pos.side === "left" ? "0 28px 28px 0" : "28px 0 0 28px",
      boxShadow: "0 10px 40px rgba(25,28,31,.18)",
      transform: shown ? `translateX(${dragging ? drag : 0}px)` : hidden,
      transition,
    };
  }

  return (
    <div className="fixed inset-0 z-[80]">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(25,28,31,.45)]"
        style={{ opacity: shown ? 1 - dragProgress : 0, transition: dragging ? "none" : `opacity ${DURATION}ms ${EASE}` }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute flex flex-col overflow-hidden bg-white font-dm_sans text-[#191c1f] will-change-transform"
        style={style}
      >
        {/* Zona de arrastre: barrita + cabecera */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={`flex flex-none touch-none select-none flex-col ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        >
          {phone ? (
            <span className="mt-2.5 h-[5px] w-10 flex-none self-center rounded-full bg-[#dfe2e6]" aria-hidden="true" />
          ) : (
            <span className="mt-3 flex flex-none items-center justify-center gap-1 self-center" aria-hidden="true">
              {[0, 1, 2].map((i) => <span key={i} className="size-1 rounded-full bg-[#c5c9ce]" />)}
            </span>
          )}
          <div className={`flex items-center justify-between gap-3 ${phone ? "py-2.5 pl-5 pr-4" : "pb-3.5 pl-6 pr-5 pt-3"}`}>
            <span className="text-[22px] font-bold tracking-[-.02em]">{title}</span>
            <div className="flex items-center gap-1.5">
              {headerActions}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex size-11 cursor-pointer items-center justify-center rounded-full bg-[#f4f5f6] text-[#191c1f] transition-colors hover:bg-[#e4e7e9]"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>
        </div>

        {children}
        {footer}
      </div>
    </div>
  );
}
