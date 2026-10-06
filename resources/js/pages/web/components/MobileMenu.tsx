import { SiteLogo } from '@/pages/web/components/FooterLogo';
import { TYPE_SVG_ICONS } from '@/types/Data';
import { MenuItem } from '@/types/models';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, ChevronDown, ChevronRight, Home, Info, Mail, ShoppingCart, Sparkles, X, type LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

type Tile = { label: string; sub: string; route: string; icon: LucideIcon; tone: 'offer' | 'cart' | 'plain' };

// Colores con contraste AA: texto oscuro sobre #fa8232, blanco sobre #c2410c
const TONES: Record<Tile['tone'], { box: string; iconBox: string; icon: string }> = {
    offer: { box: 'bg-[#fa8232] text-[#191c1f]', iconBox: 'bg-white/30', icon: 'text-[#191c1f]' },
    cart: { box: 'bg-[#c2410c] text-white', iconBox: 'bg-white/20', icon: 'text-white' },
    plain: { box: 'bg-[#f6f7f8] text-[#191c1f]', iconBox: 'bg-white', icon: 'text-[#c2410c]' },
};

function CategoryIcon({ id, className = 'size-5' }: { id: string; className?: string }) {
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
 * Menú lateral para móvil y tablet (< 1024px). Las categorías con subcategorías se
 * despliegan en acordeón dentro de la misma lista (una abierta a la vez).
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

    const tiles: Tile[] = [
        { label: 'Ofertas', sub: 'Descuentos de la semana', route: 'products', icon: Sparkles, tone: 'offer' },
        {
            label: 'Carrito',
            sub: cartCount > 0 ? `${cartCount} ${cartCount === 1 ? 'producto' : 'productos'}` : 'Tu carrito',
            route: 'cart',
            icon: ShoppingCart,
            tone: 'cart',
        },
        { label: 'Nosotros', sub: 'Conoce Smart House', route: 'about', icon: Info, tone: 'plain' },
        { label: 'Contacto', sub: 'Escríbenos', route: 'contact', icon: Mail, tone: 'plain' },
    ];

    // Escape cierra (o pliega la categoría abierta), el fondo no se desplaza y cualquier navegación cierra el panel
    useEffect(() => {
        if (!open) {
            setCatId(null);
            return;
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            setCatId((c) => {
                if (c === null) onClose();
                return null;
            });
        };
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        window.addEventListener('keydown', onKey);
        const off = router.on('start', onClose);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKey);
            off();
        };
    }, [open, onClose]);

    const tab = open ? undefined : -1;

    return (
        <div className={`fixed inset-0 z-[70] lg:hidden ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open} inert={!open}>
            <div
                onClick={onClose}
                className={`absolute inset-0 bg-[#191c1f]/45 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
            />
            <nav
                aria-label="Menú principal"
                className={`absolute inset-y-0 left-0 flex w-[min(86vw,360px)] flex-col bg-white transition-[translate,box-shadow,visibility] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
                    open ? 'translate-x-0 shadow-[24px_0_48px_rgba(25,28,31,.18)]' : 'invisible -translate-x-full'
                }`}
            >
                <div className="flex h-16 flex-none items-center justify-between gap-3 pr-3 pl-4" data-name="Header">
                    <Link href={route('home')} className="h-10 w-[118px]" data-name="Logo" tabIndex={tab}>
                        <SiteLogo imgClassName="size-full object-contain" />
                    </Link>
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

                <div className="flex min-h-0 flex-1 flex-col gap-[22px] overflow-y-auto overscroll-contain px-4 pt-1 pb-5 [scrollbar-width:none]">
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
                                <span className="pb-1.5 text-[13px] font-bold tracking-[.1em] text-[#6b7076] uppercase">Categorías</span>
                                <ul className="m-0 flex list-none flex-col p-0">
                                    {menu.map((item) => {
                                        const count = item.submenu?.length ?? 0;
                                        const expanded = catId === item.id;
                                        const panelId = `mm-cat-${item.id}`;
                                        const body = (
                                            <>
                                                <span className="flex size-11 flex-none items-center justify-center rounded-[14px] bg-[#fff4ec] text-[#c2410c]">
                                                    <CategoryIcon id={item.icon} className="size-[22px]" />
                                                </span>
                                                <span className="flex min-w-0 flex-1 flex-col gap-px">
                                                    <span className="truncate text-[16px] font-semibold">{item.name}</span>
                                                    {count > 0 && (
                                                        <span className="text-[13px] text-[#6b7076]">
                                                            {count} {count === 1 ? 'subcategoría' : 'subcategorías'}
                                                        </span>
                                                    )}
                                                </span>
                                                {count > 0 ? (
                                                    <ChevronDown
                                                        className={`size-5 flex-none text-[#8a8f94] transition-transform duration-200 ${expanded ? 'rotate-180 text-[#c2410c]' : ''}`}
                                                    />
                                                ) : (
                                                    <ChevronRight className="size-5 flex-none text-[#8a8f94]" />
                                                )}
                                            </>
                                        );
                                        const cls = `flex min-h-[60px] w-full cursor-pointer items-center gap-3.5 border-b bg-transparent px-1 py-2 text-left hover:text-[#c2410c] ${
                                            expanded ? 'border-transparent text-[#c2410c]' : 'border-[#f0f1f3] text-[#191c1f]'
                                        }`;
                                        return (
                                            <li key={item.id}>
                                                {count > 0 ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCatId(expanded ? null : item.id)}
                                                            aria-expanded={expanded}
                                                            aria-controls={panelId}
                                                            tabIndex={tab}
                                                            className={cls}
                                                        >
                                                            {body}
                                                        </button>
                                                        <div
                                                            id={panelId}
                                                            inert={!expanded}
                                                            className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(.2,.8,.2,1)] ${
                                                                expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                                                            }`}
                                                        >
                                                            <ul className="m-0 flex min-h-0 list-none flex-col overflow-hidden p-0">
                                                                <li className="pt-1">
                                                                    <Link
                                                                        href={route('category', { category: item.id })}
                                                                        tabIndex={tab}
                                                                        className="flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-[#fff4ec] px-4 text-[15px] font-bold text-[#c2410c]"
                                                                    >
                                                                        Ver todo en {item.name}
                                                                        <ArrowRight className="size-5 flex-none" />
                                                                    </Link>
                                                                </li>
                                                                {item.submenu.map((sub) => (
                                                                    <li key={sub.id}>
                                                                        <Link
                                                                            href={route('subcategory', { category: item.id, subcategory: sub.id })}
                                                                            tabIndex={tab}
                                                                            className="flex min-h-12 items-center justify-between gap-3 border-b border-[#f0f1f3] pr-4 pl-[58px] text-[15px] text-[#191c1f] hover:text-[#c2410c]"
                                                                        >
                                                                            {sub.name}
                                                                            <ChevronRight className="size-[18px] flex-none text-[#8a8f94]" />
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <Link href={route('category', { category: item.id })} tabIndex={tab} className={cls}>
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
                            href={route('home')}
                            tabIndex={tab}
                            className="flex items-center gap-3 px-1 py-2 text-[15px] font-semibold text-[#191c1f] hover:text-[#c2410c]"
                        >
                            <Home className="size-5 text-[#c2410c]" />
                            Ir al inicio
                        </Link>
                    </>
                </div>
            </nav>
        </div>
    );
}
