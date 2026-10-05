import { useEffect, useRef, useState } from "react";
import { SiteLogo } from "@/pages/web/components/FooterLogo";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ArrowLeft, ArrowRight, ChevronRight, Home, Info, Mail, ShoppingCart, Sparkles, X, type LucideIcon } from "lucide-react";
import { MenuItem } from "@/types/models";
import { TYPE_SVG_ICONS } from "@/types/Data";

type Tile = { label: string; sub: string; route: string; icon: LucideIcon; tone: "offer" | "cart" | "plain" };

// Colores con contraste AA: texto oscuro sobre #fa8232, blanco sobre #c2410c
const TONES: Record<Tile["tone"], { box: string; iconBox: string; icon: string }> = {
  offer: { box: "bg-[#fa8232] text-[#191c1f]", iconBox: "bg-white/30", icon: "text-[#191c1f]" },
  cart: { box: "bg-[#c2410c] text-white", iconBox: "bg-white/20", icon: "text-white" },
  plain: { box: "bg-[#f6f7f8] text-[#191c1f]", iconBox: "bg-white", icon: "text-[#c2410c]" },
};

function CategoryIcon({ id, className = "size-5" }: { id: string; className?: string }) {
  const icono = TYPE_SVG_ICONS.find((i) => i.id === id)?.icon;
  if (!icono) return <span className={`${className} flex-none`} />;
  return (
    <span
      aria-hidden="true"
      className={`${className} flex-none [&>svg]:size-full [&>svg]:fill-current`}
      dangerouslySetInnerHTML={{ __html: icono }}
    />
  );
}

/**
 * Menú lateral para móvil y tablet (< 1024px). Dos niveles dentro del mismo cajón:
 * raíz (accesos, categorías e inicio) y una categoría con sus subcategorías.
 */
export default function MobileMenu({
  open,
  onClose,
  menu,
  cartCount = 0,
}: {
  open: boolean;
  onClose: () => void;
  menu: MenuItem[];
  cartCount?: number;
}) {
  const [catId, setCatId] = useState<string | null>(null);
  const current = menu.find((m) => m.id === catId) ?? null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLElement | null>(null);

  const tiles: Tile[] = [
    { label: "Ofertas", sub: "Descuentos de la semana", route: "products", icon: Sparkles, tone: "offer" },
    {
      label: "Carrito",
      sub: cartCount > 0 ? `${cartCount} ${cartCount === 1 ? "producto" : "productos"}` : "Tu carrito",
      route: "cart",
      icon: ShoppingCart,
      tone: "cart",
    },
    { label: "Nosotros", sub: "Conoce Smart House", route: "about", icon: Info, tone: "plain" },
    { label: "Contacto", sub: "Escríbenos", route: "contact", icon: Mail, tone: "plain" },
  ];

  // Escape cierra (o vuelve al nivel raíz), el fondo no se desplaza y cualquier navegación cierra el panel
  useEffect(() => {
    if (!open) {
      setCatId(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setCatId((c) => {
        if (c === null) onClose();
        return null;
      });
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const off = router.on("start", onClose);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, [open, onClose]);

  // Al cambiar de nivel: volver arriba y llevar el foco a la cabecera del nivel
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    scrollRef.current?.scrollTo({ top: 0 });
    if (open) headRef.current?.focus();
  }, [catId]); // eslint-disable-line react-hooks/exhaustive-deps

  const tab = open ? undefined : -1;

  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} inert={!open}>
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-[#191c1f]/45 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <nav
        aria-label="Menú principal"
        className={`absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col bg-white transition-[translate,box-shadow,visibility] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
          open ? "translate-x-0 shadow-[24px_0_48px_rgba(25,28,31,.18)]" : "-translate-x-full invisible"
        }`}
      >
        <div className="flex h-16 flex-none items-center justify-between gap-3 pr-3 pl-4" data-name="Header">
          {current ? (
            <button
              type="button"
              ref={(el) => {
                headRef.current = el;
              }}
              onClick={() => setCatId(null)}
              tabIndex={tab}
              className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full pr-2 text-[16px] font-semibold text-[#191c1f] hover:text-[#c2410c]"
            >
              <ArrowLeft className="size-[22px]" />
              Categorías
            </button>
          ) : (
            <Link
              href={route("home")}
              ref={(el) => {
                headRef.current = el as HTMLElement | null;
              }}
              className="h-10 w-[118px]"
              data-name="Logo"
              tabIndex={tab}
            >
              <SiteLogo imgClassName="size-full object-contain" />
            </Link>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            tabIndex={tab}
            className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-full bg-[#f4f5f6] text-[#191c1f] hover:bg-[#eceef0]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto overscroll-contain px-4 pt-1 pb-5 [scrollbar-width:none]"
        >
          {current ? (
            <>
              <div className="flex items-center gap-3.5 pt-1">
                <span className="flex size-14 flex-none items-center justify-center rounded-[18px] bg-[#fa8232] text-[#191c1f]">
                  <CategoryIcon id={current.icon} className="size-7" />
                </span>
                <h2 className="m-0 text-[26px] leading-[1.05] font-bold tracking-[-.03em] text-[#191c1f]">{current.name}</h2>
              </div>
              <ul className="m-0 flex list-none flex-col p-0">
                <li>
                  <Link
                    href={route("category", { category: current.id })}
                    tabIndex={tab}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-2xl bg-[#fff4ec] px-4 text-[16px] font-bold text-[#c2410c]"
                  >
                    Ver todo en {current.name}
                    <ArrowRight className="size-5 flex-none" />
                  </Link>
                </li>
                {current.submenu.map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={route("subcategory", { category: current.id, subcategory: sub.id })}
                      tabIndex={tab}
                      className="flex min-h-14 items-center justify-between gap-3 border-b border-[#f0f1f3] px-4 text-[16px] text-[#191c1f] hover:text-[#c2410c]"
                    >
                      {sub.name}
                      <ChevronRight className="size-[18px] flex-none text-[#8a8f94]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <ul className="m-0 grid list-none grid-cols-2 gap-2.5 p-0" data-name="Accesos">
                {tiles.map(({ label, sub, route: name, icon: Icon, tone }) => {
                  const t = TONES[tone];
                  return (
                    <li key={label}>
                      <Link
                        href={route(name)}
                        tabIndex={tab}
                        className={`flex h-full min-h-[104px] flex-col justify-between gap-4 rounded-[20px] p-3.5 ${t.box}`}
                      >
                        <span className={`flex size-10 items-center justify-center rounded-xl ${t.iconBox}`}>
                          <Icon className={`size-[22px] ${t.icon}`} />
                        </span>
                        <span className="flex flex-col gap-px">
                          <span className="text-[17px] font-bold">{label}</span>
                          <span className="text-[13px] leading-tight opacity-90">{sub}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {menu.length > 0 && (
                <div className="flex flex-col gap-1" data-name="CategoriasMenu">
                  <span className="pb-1.5 text-[13px] font-bold uppercase tracking-[.1em] text-[#6b7076]">Categorías</span>
                  <ul className="m-0 flex list-none flex-col p-0">
                    {menu.map((item) => {
                      const count = item.submenu?.length ?? 0;
                      const body = (
                        <>
                          <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-[#fff4ec] text-[#c2410c]">
                            <CategoryIcon id={item.icon} className="size-[22px]" />
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-px">
                            <span className="truncate text-[16px] font-semibold">{item.name}</span>
                            {count > 0 && (
                              <span className="text-[13px] text-[#6b7076]">
                                {count} {count === 1 ? "subcategoría" : "subcategorías"}
                              </span>
                            )}
                          </span>
                          <ChevronRight className="size-5 flex-none text-[#8a8f94]" />
                        </>
                      );
                      const cls =
                        "flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 border-b border-[#f0f1f3] bg-transparent px-1 py-2 text-left text-[#191c1f] hover:text-[#c2410c]";
                      return (
                        <li key={item.id}>
                          {count > 0 ? (
                            <button type="button" onClick={() => setCatId(item.id)} tabIndex={tab} className={cls}>
                              {body}
                            </button>
                          ) : (
                            <Link href={route("category", { category: item.id })} tabIndex={tab} className={cls}>
                              {body}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <Link
                href={route("home")}
                tabIndex={tab}
                className="flex items-center gap-3 px-1 py-2 text-[15px] font-semibold text-[#191c1f] hover:text-[#c2410c]"
              >
                <Home className="size-5 text-[#c2410c]" />
                Ir al inicio
              </Link>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
