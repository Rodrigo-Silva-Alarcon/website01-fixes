import { useEffect, useState } from "react";
import Layout from "@/pages/web/layouts/Layout";
import { Product, Category, Subcategory, Brand } from "@/types/models";
import { route } from "ziggy-js";
import { Link, router, usePage } from "@inertiajs/react";
import Seo from "@/components/Seo";
import ProductCard from "@/pages/web/components/ProductCard";
import { Check, ChevronDown, ChevronRight, Minus, PackageOpen, SlidersHorizontal, Sparkles, X } from "lucide-react";

type Sort = "rel" | "off" | "asc" | "desc";

type TreeSubcategory = Subcategory & { products_count: number };
type TreeCategory = Omit<Category, "subcategories"> & { products_count: number; subcategories: TreeSubcategory[] };

interface Pagination<T> {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  total: number;
}

type PageProps = {
  products: Pagination<Product>;
  categories: TreeCategory[];
  brands: Brand[];
  cates?: number[];
  subs?: number[];
  marcas?: number[];
  offers?: boolean;
  sort?: Sort;
  find?: string;
  activeCategory?: Category | null;
  activeSubcategory?: Subcategory | null;
};

type Filters = { cs: number[]; ss: number[]; ms: number[]; offers: boolean; sort: Sort; find: string };

const SORTS: [Sort, string][] = [
  ["rel", "Relevancia"],
  ["off", "Mayor descuento"],
  ["asc", "Menor precio"],
  ["desc", "Mayor precio"],
];

/** Estado de filtros a partir de las props del servidor (las rutas /productos/{cat}/{sub} se traducen a ss). */
function filtersFromProps(p: PageProps): Filters {
  const sub = p.activeSubcategory;
  return {
    cs: sub ? [] : (p.cates ?? []).map(Number),
    ss: [...new Set([...(p.subs ?? []).map(Number), ...(sub ? [sub.id] : [])])],
    ms: (p.marcas ?? []).map(Number),
    offers: !!p.offers,
    sort: p.sort ?? "rel",
    find: (p.find ?? "").trim(),
  };
}

function toQuery(f: Filters) {
  const q: Record<string, unknown> = {};
  if (f.cs.length) q.cs = f.cs;
  if (f.ss.length) q.ss = f.ss;
  if (f.ms.length) q.ms = f.ms;
  if (f.offers) q.offers = 1;
  if (f.sort !== "rel") q.sort = f.sort;
  if (f.find) q.find = f.find;
  return q;
}

function Checkbox({ state, small = false }: { state: "on" | "part" | "off"; small?: boolean }) {
  const active = state !== "off";
  const Icon = state === "part" ? Minus : Check;
  return (
    <span
      className={`flex flex-none items-center justify-center border-[1.5px] text-white transition-colors duration-200 ${
        small ? "size-[18px] rounded-[5px]" : "size-5 rounded-[6px]"
      } ${active ? "border-[#fa8232] bg-[#fa8232]" : "border-[#c5c9ce] bg-white"}`}
    >
      <Icon className={`${small ? "size-3.5" : "size-4"} transition-opacity ${active ? "opacity-100" : "opacity-0"}`} strokeWidth={3} />
    </span>
  );
}

function FilterPanel({
  tree, brands, f, expanded, onExpand, apply, narrow,
}: {
  tree: TreeCategory[];
  brands: Brand[];
  f: Filters;
  expanded: Record<number, boolean>;
  onExpand: (id: number) => void;
  apply: (patch: Partial<Filters>, expandId?: number) => void;
  narrow: boolean;
}) {
  const toggleCategory = (c: TreeCategory) => {
    const on = f.cs.includes(c.id);
    const subIds = c.subcategories.map((s) => s.id);
    apply(
      { cs: on ? f.cs.filter((x) => x !== c.id) : [...f.cs, c.id], ss: f.ss.filter((x) => !subIds.includes(x)) },
      !on && subIds.length ? c.id : undefined,
    );
  };

  const toggleSub = (c: TreeCategory, s: TreeSubcategory) => {
    if (f.cs.includes(c.id)) {
      // desmarcar una sub de una categoría completa: queda marcado el resto de sus subs
      apply({ cs: f.cs.filter((x) => x !== c.id), ss: [...f.ss, ...c.subcategories.filter((x) => x.id !== s.id).map((x) => x.id)] });
    } else {
      apply({ ss: f.ss.includes(s.id) ? f.ss.filter((x) => x !== s.id) : [...f.ss, s.id] });
    }
  };

  return (
    <aside
      className={`flex max-w-full flex-col gap-6 rounded-[24px] ${
        narrow ? "w-full border border-[#eceef0] p-[18px]" : "sticky top-4 max-h-[calc(100vh-32px)] w-[270px] flex-none overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]"
      }`}
    >
      <div className="flex flex-col gap-1.5">
        <span className="pb-1 text-[13px] font-bold uppercase tracking-[.1em] text-[#6b7076]">Categorías</span>
        {tree.map((c) => {
          const on = f.cs.includes(c.id);
          const part = !on && c.subcategories.some((s) => f.ss.includes(s.id));
          const open = !!expanded[c.id];
          const hasSubs = c.subcategories.length > 0;
          return (
            <div key={c.id} className="flex flex-col">
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleCategory(c)}
                  aria-pressed={on}
                  className={`flex flex-1 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[#191c1f] transition-colors duration-200 ${
                    on ? "bg-[#fff4ec]" : "hover:bg-[#f6f7f8]"
                  }`}
                >
                  <Checkbox state={on ? "on" : part ? "part" : "off"} />
                  <span className="flex-1 text-[15px] font-medium">{c.name}</span>
                  <span className="text-[13px] text-[#8a8f94]">{c.products_count}</span>
                </button>
                {hasSubs && (
                  <button
                    type="button"
                    onClick={() => onExpand(c.id)}
                    aria-label={`Subcategorías de ${c.name}`}
                    aria-expanded={open}
                    className="flex size-9 flex-none cursor-pointer items-center justify-center rounded-[10px] text-[#5b6066] hover:bg-[#f6f7f8]"
                  >
                    <ChevronDown className={`size-5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                  </button>
                )}
              </div>
              {hasSubs && (
                <div
                  className="grid transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(.2,.8,.2,1)]"
                  style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                >
                  <div className="ml-[19px] flex flex-col overflow-hidden border-l-[1.5px] border-[#eceef0] pl-[22px]">
                    {c.subcategories.map((s) => {
                      const sOn = on || f.ss.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          tabIndex={open ? 0 : -1}
                          onClick={() => toggleSub(c, s)}
                          aria-pressed={sOn}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] px-2.5 py-[7px] text-left transition-colors duration-200 ${
                            sOn ? "bg-[#fff4ec]" : "hover:bg-[#f6f7f8]"
                          }`}
                        >
                          <Checkbox state={sOn ? "on" : "off"} small />
                          <span className="flex-1 text-sm text-[#3d4247]">{s.name}</span>
                          <span className="text-xs text-[#8a8f94]">{s.products_count}</span>
                        </button>
                      );
                    })}
                    <div className="h-1.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="h-px bg-[#eceef0]" />

      <div className="flex flex-col gap-2.5">
        <span className="text-[13px] font-bold uppercase tracking-[.1em] text-[#6b7076]">Marcas</span>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => {
            const on = f.ms.includes(b.id);
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={on}
                onClick={() => apply({ ms: on ? f.ms.filter((x) => x !== b.id) : [...f.ms, b.id] })}
                className={`cursor-pointer rounded-full border-[1.5px] px-[13px] py-[7px] text-sm transition-colors duration-200 ${
                  on ? "border-[#155eef] bg-[#eef3ff] text-[#155eef]" : "border-[#dfe2e6] bg-white text-[#191c1f] hover:border-[#c5c9ce]"
                }`}
              >
                {b.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-[#eceef0]" />

      <button
        type="button"
        role="switch"
        aria-checked={f.offers}
        onClick={() => apply({ offers: !f.offers })}
        className="flex cursor-pointer items-center justify-between gap-2.5 text-[#191c1f]"
      >
        <span className="flex items-center gap-2 text-[15px] font-semibold">
          <Sparkles className="size-5 fill-[#fa8232] text-[#fa8232]" />
          Solo ofertas
        </span>
        <span className={`flex h-[26px] w-[46px] rounded-[13px] p-[3px] transition-colors duration-300 ${f.offers ? "bg-[#fa8232]" : "bg-[#d5d9de]"}`}>
          <span
            className={`size-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)] transition-transform duration-300 ease-[cubic-bezier(.3,1.4,.5,1)] ${
              f.offers ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </span>
      </button>
    </aside>
  );
}

function PaginationNav({ products }: { products: Pagination<Product> }) {
  if (!products?.links || products.links.length <= 3) return null;
  const last = products.links.length - 1;

  return (
    <nav aria-label="Paginación de productos" className="flex flex-wrap justify-center gap-2">
      {products.links.map((link, index) => (
        <button
          key={index}
          type="button"
          disabled={!link.url || link.active}
          aria-current={link.active ? "page" : undefined}
          onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
          className={`min-w-10 cursor-pointer rounded-full px-4 py-2 text-sm transition-colors disabled:cursor-default ${
            link.active ? "bg-[#191c1f] text-white" : "border border-[#dfe2e6] hover:border-[#191c1f] disabled:opacity-40 disabled:hover:border-[#dfe2e6]"
          }`}
        >
          {index === 0 ? "Anterior" : index === last ? "Siguiente" : link.label}
        </button>
      ))}
    </nav>
  );
}

function EmptyState({ props, f, onClear }: { props: PageProps; f: Filters; onClear: () => void }) {
  const { activeCategory, activeSubcategory } = props;
  let title = "No encontramos productos";
  let description = "Prueba con otra categoría o quita algunos filtros.";

  if (activeSubcategory) {
    title = `No hay stock disponible en "${activeSubcategory.name}"`;
    description = `Actualmente no disponemos de productos con existencias en la subcategoría ${activeSubcategory.name}. Estamos gestionando nuevo inventario.`;
  } else if (activeCategory) {
    title = `No hay stock disponible en "${activeCategory.name}"`;
    description = `Actualmente no encontramos productos disponibles con stock en la categoría ${activeCategory.name}.`;
  } else if (f.find) {
    title = `Sin resultados para "${f.find}"`;
    description = "Verifica la ortografía de los términos ingresados o prueba buscando con palabras más genéricas.";
  }

  const hasFilters = f.cs.length + f.ss.length + f.ms.length > 0 || f.offers || !!f.find;
  const whatsappUrl = `https://wa.me/59168210861?text=${encodeURIComponent(
    `Hola, quisiera consultar sobre la disponibilidad y reingreso de productos${
      activeSubcategory ? ` en la subcategoría ${activeSubcategory.name}` : activeCategory ? ` en ${activeCategory.name}` : ""
    }.`,
  )}`;

  return (
    <div className="flex flex-col items-center gap-3 rounded-[24px] border border-dashed border-[#dfe2e6] px-6 py-14 text-center">
      <PackageOpen className="size-9 text-[#155eef]" strokeWidth={1.6} />
      <span className="text-lg font-bold">{title}</span>
      <span className="max-w-md text-[15px] text-[#6b7076]">{description}</span>
      <div className="mt-1.5 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button type="button" onClick={onClear} className="cursor-pointer rounded-full bg-[#fa8232] px-5 py-[11px] font-semibold text-white hover:bg-[#f9751d]">
            Limpiar filtros
          </button>
        )}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-[#dfe2e6] px-5 py-[11px] font-semibold text-[#191c1f] hover:border-[#191c1f]"
        >
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}

export default function ProductosPage() {
  const props = usePage<PageProps>().props;
  const { products, categories: tree = [], brands = [] } = props;

  const serverFilters = filtersFromProps(props);
  const [f, setF] = useState<Filters>(serverFilters);
  const [loading, setLoading] = useState(false);
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.innerWidth < 900);
  // en escritorio el panel arranca visible; en móvil, oculto
  const [showFilters, setShowFilters] = useState(() => typeof window === "undefined" || window.innerWidth >= 900);
  const [expanded, setExpanded] = useState<Record<number, boolean>>(() => {
    const open: Record<number, boolean> = {};
    tree.forEach((c) => {
      if (serverFilters.cs.includes(c.id) || c.subcategories.some((s) => serverFilters.ss.includes(s.id))) open[c.id] = true;
    });
    return open;
  });

  // las props del servidor son la fuente de verdad tras cada visita
  const serverKey = JSON.stringify(serverFilters);
  useEffect(() => setF(serverFilters), [serverKey]);

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth < 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const apply = (patch: Partial<Filters>, expandId?: number) => {
    const next = { ...f, ...patch };
    setF(next);
    if (expandId) setExpanded((e) => ({ ...e, [expandId]: true }));
    router.get(route("products"), toQuery(next) as never, {
      preserveState: true,
      preserveScroll: true,
      onStart: () => setLoading(true),
      onFinish: () => setLoading(false),
    });
  };
  const clearAll = () => apply({ cs: [], ss: [], ms: [], offers: false, find: "" });

  // título y migas según el contexto de la selección
  const catOf = (id: number) => tree.find((c) => c.id === id);
  const parentOf = (sid: number) => tree.find((c) => c.subcategories.some((s) => s.id === sid));
  const subOf = (sid: number) => parentOf(sid)?.subcategories.find((s) => s.id === sid);
  const ctxCat =
    f.cs.length === 1 && !f.ss.length
      ? catOf(f.cs[0])
      : !f.cs.length && f.ss.length && f.ss.every((x) => parentOf(x) === parentOf(f.ss[0]))
        ? parentOf(f.ss[0])
        : undefined;
  const oneSub = !f.cs.length && f.ss.length === 1 ? subOf(f.ss[0]) : undefined;
  const title = oneSub?.name ?? ctxCat?.name ?? (f.find ? `Búsqueda: "${f.find}"` : f.offers ? "Ofertas" : "Todos los productos");

  const total = products?.total ?? 0;
  const countLabel = `${total} ${total === 1 ? "producto" : "productos"}`;

  const chips = [
    ...f.cs.map((id) => ({ key: `c${id}`, label: catOf(id)?.name ?? "Categoría", remove: () => apply({ cs: f.cs.filter((x) => x !== id) }) })),
    ...f.ss.map((id) => ({ key: `s${id}`, label: subOf(id)?.name ?? "Subcategoría", remove: () => apply({ ss: f.ss.filter((x) => x !== id) }) })),
    ...f.ms.map((id) => ({ key: `m${id}`, label: brands.find((b) => b.id === id)?.name ?? "Marca", remove: () => apply({ ms: f.ms.filter((x) => x !== id) }) })),
    ...(f.offers ? [{ key: "offers", label: "Solo ofertas", remove: () => apply({ offers: false }) }] : []),
    ...(f.find ? [{ key: "find", label: `"${f.find}"`, remove: () => apply({ find: "" }) }] : []),
  ];

  const pills = ctxCat && ctxCat.subcategories.length
    ? [{ id: 0, name: "Todo" }, ...ctxCat.subcategories].map((s) => ({
        key: s.id,
        label: s.name,
        on: s.id ? f.ss.length === 1 && f.ss[0] === s.id && !f.cs.length : f.cs.length === 1 && f.cs[0] === ctxCat.id && !f.ss.length,
        pick: () => apply(s.id ? { cs: [], ss: [s.id] } : { cs: [ctxCat.id], ss: [] }),
      }))
    : [];

  const items = products?.data || [];

  return (
    <Layout>
      <Seo
        title={title}
        description="Explora nuestro catálogo de productos de tecnología y electrodomésticos. Encuentra lo que necesitas al mejor precio."
      />
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-[clamp(16px,4.4vw,64px)] pb-[clamp(64px,8vw,96px)] pt-[clamp(20px,3vw,32px)] font-dm_sans text-[#191c1f]">
        <div className="flex flex-col gap-3.5">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-[#6b7076]">
            <Link href={route("home")} className="hover:text-[#c2410c]">Inicio</Link>
            <ChevronRight className="size-4" />
            {ctxCat ? (
              <>
                <button type="button" onClick={() => apply({ cs: [ctxCat.id], ss: [] })} className={`cursor-pointer hover:text-[#c2410c] ${oneSub ? "" : "text-[#191c1f]"}`}>
                  {ctxCat.name}
                </button>
                {oneSub && (
                  <>
                    <ChevronRight className="size-4" />
                    <span className="text-[#191c1f]">{oneSub.name}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-[#191c1f]">{title}</span>
            )}
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-baseline gap-3.5">
              <h1 className="m-0 text-[clamp(32px,4vw,44px)] font-bold leading-none tracking-[-.035em]">{title}</h1>
              <span className="text-[15px] text-[#6b7076]">{countLabel}</span>
            </div>
            <div className="flex max-w-full flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className="flex cursor-pointer items-center gap-2 rounded-full border border-[#dfe2e6] bg-white px-4 py-2.5 text-sm transition-colors hover:border-[#191c1f]"
              >
                <SlidersHorizontal className="size-[18px]" />
                {showFilters ? "Ocultar filtros" : "Filtros"}
              </button>
              <div className="flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-[#f4f5f6] p-1 [scrollbar-width:none]">
                {SORTS.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={f.sort === id}
                    onClick={() => apply({ sort: id })}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-[7px] text-sm transition-all duration-200 ${
                      f.sort === id ? "bg-white text-[#191c1f] shadow-[0_1px_4px_rgba(25,28,31,.12)]" : "text-[#5b6066] hover:text-[#191c1f]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pills.length > 0 && (
            <div className="flex gap-2 overflow-x-auto py-0.5 [scrollbar-width:none]">
              {pills.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={p.pick}
                  className={`flex-none cursor-pointer whitespace-nowrap rounded-full border-[1.5px] px-4 py-[9px] text-sm font-medium transition-colors duration-200 ${
                    p.on ? "border-[#191c1f] bg-[#191c1f] text-white" : "border-[#dfe2e6] bg-white hover:border-[#c5c9ce]"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-[clamp(24px,3vw,40px)]">
          {showFilters && (
            <FilterPanel
              tree={tree}
              brands={brands}
              f={f}
              expanded={expanded}
              onExpand={(id) => setExpanded((e) => ({ ...e, [id]: !e[id] }))}
              apply={apply}
              narrow={narrow}
            />
          )}

          <div className="flex min-w-[min(100%,300px)] flex-1 flex-col gap-[18px]">
            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={c.remove}
                    aria-label={`Quitar filtro ${c.label}`}
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-[#191c1f] py-1.5 pl-3.5 pr-2 text-sm text-white hover:bg-[#3d4247]"
                  >
                    {c.label}
                    <X className="size-4" />
                  </button>
                ))}
                <button type="button" onClick={clearAll} className="cursor-pointer px-2 py-1.5 text-sm font-semibold text-[#c2410c] hover:underline">
                  Limpiar filtros
                </button>
              </div>
            )}

            {items.length > 0 ? (
              <div
                className={`grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-[clamp(10px,1.2vw,16px)] transition-[opacity,transform] duration-200 sm:grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] ${
                  loading ? "translate-y-2 opacity-40" : ""
                }`}
                aria-busy={loading}
              >
                {items.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} compact />
                ))}
              </div>
            ) : (
              <EmptyState props={props} f={f} onClear={clearAll} />
            )}

            {items.length > 0 && <PaginationNav products={products} />}
          </div>
        </div>
      </main>
    </Layout>
  );
}
