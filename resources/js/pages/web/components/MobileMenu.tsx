import { useEffect, useState } from "react";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { ChevronDown, Home, Info, Mail, ShoppingCart, Sparkles, X, type LucideIcon } from "lucide-react";
import { MenuItem } from "@/types/models";
import { TYPE_SVG_ICONS } from "@/types/Data";

const LINKS: { label: string; route: string; icon: LucideIcon }[] = [
  { label: "Inicio", route: "home", icon: Home },
  { label: "Nosotros", route: "about", icon: Info },
  { label: "Ofertas", route: "products", icon: Sparkles },
  { label: "Contacto", route: "contact", icon: Mail },
  { label: "Carrito", route: "cart", icon: ShoppingCart },
];

function CategoryIcon({ id }: { id: string }) {
  const icono = TYPE_SVG_ICONS.find((i) => i.id === id)?.icon;
  if (!icono) return <span className="size-5 flex-none" />;
  return (
    <span
      aria-hidden="true"
      className="size-5 flex-none [&>svg]:size-full [&>svg]:fill-current"
      dangerouslySetInnerHTML={{ __html: icono }}
    />
  );
}

/**
 * Menú lateral para móvil y tablet (< 1024px): páginas principales y categorías con sus subcategorías,
 * que en escritorio se muestran en la cabecera y en la barra de categorías.
 */
export default function MobileMenu({ open, onClose, menu }: { open: boolean; onClose: () => void; menu: MenuItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  // Escape cierra, el fondo no se desplaza y cualquier navegación cierra el panel
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
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

  return (
    <div className={`fixed inset-0 z-[70] lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
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
        <div className="flex items-center justify-between gap-3 border-b border-[#eceef0] px-4 py-3" data-name="Header">
          <Link href={route("home")} className="h-10 w-[118px]" data-name="Logo" tabIndex={open ? undefined : -1}>
            <picture className="contents">
                    <source srcSet="/images/logo-smarthouse.webp" type="image/webp" />
                    <img src="/images/logo-smarthouse.png" alt="Smart House Importaciones SRL" className="size-full object-contain" />
                  </picture>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            tabIndex={open ? undefined : -1}
            className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-white text-[#191c1f] hover:bg-[#f4f5f6]"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 py-4">
          <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
            {LINKS.map(({ label, route: name, icon: Icon }) => (
              <li key={label}>
                <Link
                  href={route(name)}
                  tabIndex={open ? undefined : -1}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[16px] font-medium text-[#191c1f] hover:bg-[#f6f7f8]"
                >
                  <Icon className="size-5 text-[#fa8232]" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {menu.length > 0 && (
            <div className="flex flex-col gap-1" data-name="CategoriasMenu">
              <span className="px-3 pb-1 text-[13px] font-bold uppercase tracking-[.1em] text-[#6b7076]">Categorías</span>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0">
                {menu.map((item) => {
                  const hasSubs = item.submenu?.length > 0;
                  const isOpen = expanded === item.id;
                  return (
                    <li key={item.id} className="flex flex-col">
                      <div className="flex items-center gap-0.5">
                        <Link
                          href={route("category", { category: item.id })}
                          tabIndex={open ? undefined : -1}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] text-[#191c1f] hover:bg-[#f6f7f8]"
                        >
                          <CategoryIcon id={item.icon} />
                          <span className="truncate">{item.name}</span>
                        </Link>
                        {hasSubs && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : item.id)}
                            aria-expanded={isOpen}
                            aria-label={`Subcategorías de ${item.name}`}
                            tabIndex={open ? undefined : -1}
                            className="flex size-10 flex-none cursor-pointer items-center justify-center rounded-[10px] text-[#5b6066] hover:bg-[#f6f7f8]"
                          >
                            <ChevronDown className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      {hasSubs && (
                        <div
                          className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.2,.8,.2,1)]"
                          style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                        >
                          <ul className="m-0 ml-[22px] flex list-none flex-col overflow-hidden border-l-[1.5px] border-[#eceef0] p-0 pl-3">
                            {item.submenu.map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  href={route("subcategory", { category: item.id, subcategory: sub.id })}
                                  tabIndex={open && isOpen ? undefined : -1}
                                  className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm text-[#3d4247] hover:bg-[#f6f7f8]"
                                >
                                  <CategoryIcon id={sub.icon} />
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
