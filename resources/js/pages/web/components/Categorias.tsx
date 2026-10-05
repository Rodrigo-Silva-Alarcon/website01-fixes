import { Category } from "@/types/models";
import { Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import ResponsiveImg from "@/components/ResponsiveImg";
import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";

const ILLUSTRATIONS: Record<string, (color: string) => React.ReactElement> = {
  "Dispositivos-portatiles": (color) => (
    <svg
      viewBox="0 0 100 90"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative size-full p-[10%]"
      aria-hidden="true"
    >
      {/* Laptop — pantalla + base */}
      <rect x="4" y="47" width="54" height="34" rx="2.5" fill={color} fillOpacity="0.07" />
      <rect x="4" y="47" width="54" height="34" rx="2.5" />
      <path d="M0 81h62" />
      {/* Tablet — retrato, centro-derecha */}
      <rect x="66" y="19" width="25" height="38" rx="3" fill={color} fillOpacity="0.07" />
      <rect x="66" y="19" width="25" height="38" rx="3" />
      <path d="M76 56h5" />
      {/* Smartphone — más pequeño, derecha */}
      <rect x="81" y="43" width="15" height="28" rx="3" fill={color} fillOpacity="0.07" />
      <rect x="81" y="43" width="15" height="28" rx="3" />
      <path d="M87 69h3" />
    </svg>
  ),
  "Entretenimiento": (color) => (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="relative size-full p-[8%]"
      aria-hidden="true"
    >
      {/* Televisor — bisel + pantalla */}
      <rect x="5" y="7" width="90" height="58" rx="4" fill={color} fillOpacity="0.07" />
      <rect x="5" y="7" width="90" height="58" rx="4" />
      <rect x="9" y="11" width="82" height="50" rx="2" />
      {/* Patas y base del TV */}
      <path d="M37 65v9M63 65v9" />
      <path d="M27 74h46" />
      {/* Reproductor DVD/Blu-ray */}
      <rect x="20" y="79" width="60" height="13" rx="3" fill={color} fillOpacity="0.07" />
      <rect x="20" y="79" width="60" height="13" rx="3" />
      <path d="M26 85.5h32" />
      <circle cx="65" cy="85.5" r="3.5" />
      <path d="M70.5 85.5h5.5" />
    </svg>
  ),
};

// Paleta de la marca: naranja #fa8232 y azul #155eef (sin negro)
type Tone = {
  bg: string;
  blob: string;
  count: string;
  title: string;
  text: string;
};

const TONES: Tone[] = [
  { bg: "#fff1e6", blob: "#ffd9bd", count: "#c2410c", title: "#191c1f", text: "#5b6167" },
  { bg: "#eaf1ff", blob: "#c9dbff", count: "#155eef", title: "#191c1f", text: "#5b6167" },
  { bg: "#fff8f2", blob: "#ffe6d2", count: "#c2410c", title: "#191c1f", text: "#5b6167" },
  { bg: "#155eef", blob: "#fa8232", count: "#ffd9bd", title: "#ffffff", text: "#dbe6ff" },
];

/**
 * Mosaico "4a": bloques de 9 columnas x 2 filas con 6 tarjetas de distintos tamaños.
 * [columna inicial, ancho en columnas, fila inicial, alto en filas]
 */
const BLOCK_COLS = 9;
const BLOCK: [number, number, number, number][] = [
  [1, 2, 1, 2], // grande, alta
  [3, 3, 1, 1], // ancha arriba
  [3, 2, 2, 1], // chica abajo
  [5, 3, 2, 1], // ancha abajo
  [6, 2, 1, 1], // chica arriba
  [8, 2, 1, 2], // grande, alta
];

type Slot = { category: Category; tone: Tone; col: number; span: number; row: number; rows: number };

/**
 * Cada copia de la cinta debe ser más ancha que la sección (máx. 1440px): un bloque mide
 * ~1026px (9 columnas de 100px + gaps de 14px), así que con menos de 2 bloques el final de la
 * cinta quedaba a la vista antes de reiniciar el bucle.
 */
const MIN_BLOCKS = 2;

/** Reparte las categorías en bloques del mosaico (repite categorías para completar los bloques). */
function buildSlots(categories: Category[]): Slot[] {
  const blocks = Math.max(MIN_BLOCKS, Math.ceil(categories.length / BLOCK.length));
  const slots: Slot[] = [];
  for (let b = 0; b < blocks; b++) {
    BLOCK.forEach(([col, span, row, rows], i) => {
      const n = b * BLOCK.length + i;
      slots.push({
        category: categories[n % categories.length],
        tone: TONES[n % TONES.length],
        col: col + b * BLOCK_COLS,
        span,
        row,
        rows,
      });
    });
  }
  return slots;
}

function CategoryTile({ slot, offset, hidden }: { slot: Slot; offset: number; hidden: boolean }) {
  const { category, tone, span, rows } = slot;
  const area = span * rows;
  const big = area >= 4;
  const wide = area >= 3;
  const count = category.products_count ?? 0;
  const href = route("category", { category: category.slug });
  const solid = tone.bg === "#155eef";

  return (
    <div
      aria-hidden={hidden || undefined}
      className={`category-tile cat-mosaic__tile group relative flex flex-col overflow-hidden rounded-[22px] px-6 py-[22px] ${big ? "cat-mosaic__tile--big" : wide ? "cat-mosaic__tile--wide" : ""}`}
      style={{
        backgroundColor: tone.bg,
        gridColumn: `${slot.col + offset} / span ${span}`,
        gridRow: `${slot.row} / span ${rows}`,
      }}
    >
      <Link
        href={href}
        className="absolute inset-0 z-[1]"
        aria-label={`Ver ${category.name}`}
        tabIndex={hidden ? -1 : undefined}
      />

      <div className="relative z-[2] flex max-w-[78%] flex-col gap-1 pointer-events-none">
        <span className="text-xs font-semibold" style={{ color: tone.count }}>
          {count} {count === 1 ? "producto" : "productos"}
        </span>
        <h3 className="cat-mosaic__name font-semibold leading-[1.1] tracking-[-.02em]" style={{ color: tone.title }}>
          {category.name}
        </h3>
        {category.summary && wide && (
          <p className="mt-0.5 text-[13px] leading-snug line-clamp-2" style={{ color: tone.text }}>
            {category.summary}
          </p>
        )}
      </div>

      <span
        className="pointer-events-none absolute bottom-5 left-6 z-[2] inline-flex items-center gap-2.5 text-sm font-semibold"
        style={{ color: tone.title }}
      >
        <span className="category-tile__arrow flex size-[34px] items-center justify-center rounded-full bg-[#fa8232] text-white">
          <ArrowRight className="size-4" />
        </span>
        Ver todo
      </span>

      {/* Imagen sobre un círculo flotante en la esquina inferior derecha */}
      <div className="cat-mosaic__circle pointer-events-none absolute" aria-hidden="true">
        <div
          className="category-tile__blob absolute inset-0 rounded-full"
          style={{ backgroundColor: tone.blob, opacity: solid ? 0.9 : 1 }}
        />
        {(category.image_url || category.image_thumbs_url) ? (
          <ResponsiveImg
            alt=""
            loading="lazy"
            className={`category-tile__img relative size-full object-contain p-[16%] ${solid ? "" : "mix-blend-multiply"}`}
            src={category.image_url || category.image_thumbs_url}
            webpSrc={category.image_webp_url}
            thumbWebpSrc={category.image_thumbs_webp_url}
            sizes="(max-width: 1024px) 40vw, 200px"
          />
        ) : ILLUSTRATIONS[category.slug] ? (
          ILLUSTRATIONS[category.slug](tone.title)
        ) : null}
      </div>
    </div>
  );
}

export default function Categorias({ title, subtitle }: { title?: string | null; subtitle?: string | null }) {
  const { categorias } = usePage<{ categorias: Category[] }>().props;

  if (!categorias || categorias.length === 0) return null;

  const slots = buildSlots(categorias);
  const cols = (slots.length / BLOCK.length) * BLOCK_COLS;
  // Duración proporcional al largo de la cinta para mantener la misma velocidad
  const duration = `${(cols / BLOCK_COLS) * 60}s`;

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 pt-12 md:pt-16">
      <div className="flex flex-wrap items-end justify-between gap-4 px-4 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#fa8232]">{subtitle || "Explora por categoría"}</span>
          <h2 className="text-[clamp(28px,3vw,36px)] font-semibold tracking-[-.02em] text-[#191c1f]">{title || "Categorías"}</h2>
        </div>
        <Link
          href={route("products")}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#fa8232] px-[22px] py-2.5 text-sm font-semibold text-[#fa8232] transition-colors hover:bg-[#fa8232] hover:text-white"
        >
          Ver todas
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="cat-mosaic" style={{ "--cat-duration": duration } as CSSProperties}>
        <div className="cat-mosaic__track">
          {/* Dos copias del mosaico: la cinta se desplaza la mitad y vuelve sin salto */}
          {[0, 1].map((copy) =>
            slots.map((slot, i) => (
              <CategoryTile key={`${copy}-${i}`} slot={slot} offset={copy * cols} hidden={copy === 1} />
            )),
          )}
        </div>
      </div>
    </section>
  );
}
