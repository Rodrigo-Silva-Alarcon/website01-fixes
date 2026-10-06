import { FormEventHandler, useCallback, useEffect, useState } from "react";
import svgPaths from "../imports/svg-51k8givoxg";
import { img } from "../imports/svg-5wjm2";
import { Link, usePage, router} from "@inertiajs/react";
import { route } from 'ziggy-js';
import { MenuItem, Cart } from "@/types/models";
import { toast } from 'sonner';
import { Menu, Search, ShoppingCart, X } from "lucide-react";
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import ThemeToggle from "@/pages/web/components/ThemeToggle";
import { SiteLogo } from "@/pages/web/components/FooterLogo";
import MobileMenu from "@/pages/web/components/MobileMenu";
import { useIdleMount } from "@/hooks/use-idle-mount";

interface PageProps {
  flash?: {
    status?: string;
  };
}

export default function Header({ cart }: { cart: Cart }) {

  // el carrito es una página propia (/carrito)
  const openCart = () => router.visit(route('cart'));
  const { props } = usePage() as { props: { flash?: { status?: string } } };
  const status = props.flash?.status;
  useEffect(() => {
    // 2 s: la mitad de la duración por defecto de sonner (4 s)
    if (status) toast.success(status, { duration: 2000 });
  }, [status]);

  const cartCount = (cart?.cart_items ?? cart?.cartItems ?? []).reduce(
    (sum, item) => sum + (item.amount ?? 0),
    0,
  );

    const { find } = usePage<{ find?: string }>().props;
    const [searchTerm, setSearchTerm] = useState(find ?? "");
    const debouncedFind = useDebouncedValue(searchTerm, 300);

    useEffect(() => {
      setSearchTerm(find ?? "");
    }, [find]);

    useEffect(() => {
      if (debouncedFind === (find ?? '')) return;
      router.get(route('products'), { find: debouncedFind }, { preserveScroll: true });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedFind]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get(route('products'), { find: searchTerm.trim() }, { preserveScroll: true });
    };

  // móvil y tablet: menú lateral y buscador desplegable
  const { menu = [] } = usePage<{ menu?: MenuItem[] }>().props;
  const [menuOpen, setMenuOpen] = useState(false);
  // El menú cerrado no va en el HTML inicial: se monta al quedar libre el navegador (o al abrirlo)
  const menuReady = useIdleMount();
  const [searchOpen, setSearchOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const iconButton = "relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-[#191c1f] transition-colors hover:bg-[#f4f5f6]";

  return (
    <div className="bg-white relative w-full" data-name="Header">
      <div className="w-full">
        {/* Desktop Header */}
        <div className="hidden lg:block box-border content-stretch px-8 xl:px-[64px] py-[16px] relative w-full">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <div className="h-[50.635px] relative shrink-0 w-[150px]" data-name="Logo" style={{ color: "#191c1f" }}>
              <Link href={route('home')} className="absolute inset-0" data-name="image 9">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <SiteLogo imgClassName="h-full w-full object-contain" />
                </div>
              </Link>
            </div>
            <div className="basis-0 content-stretch flex gap-2 xl:gap-[20px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
              <form 
                onSubmit={submit}
                className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center overflow-visible px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
                data-name="Buscar"                 
                >
                <div aria-hidden="true" className="absolute border border-[#cacccd] border-solid inset-0 pointer-events-none rounded-[40px]" />
                <input 
                  type="text" 
                  placeholder="Buscar por palabra clave"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre outline-none border-none placeholder:text-[#767676] min-w-0 w-[150px] xl:w-[200px]" 
                  style={{ fontVariationSettings: "'opsz' 14" }}
                />
                <button type="submit" className="relative shrink-0 size-[20px] cursor-pointer" data-name="search">
                  <div className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]" data-name="search" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p1a72af00} fill="var(--fill-0, #191C1F)" id="search" />
                    </svg>
                  </div>
                </button>
              </form>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#cacccd] h-full shrink-0 w-px" />
              </div>
              <Link 
                href={ route('about') }
                className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
                data-name="Botón"
              >
                <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Nosotros
                </p>
              </Link>
              <Link 
                href={ route('products') }
                className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
                data-name="Botón"
              >
                <div className="relative shrink-0 size-[20px]" data-name="star_shine">
                  <div className="absolute inset-[10.42%_7.7%_14.58%_7.7%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.848px_-2.5px] mask-size-[24px_24px]" data-name="star_shine" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
                      <path d={svgPaths.p1f5b98f0} fill="var(--fill-0, #191C1F)" id="star_shine" />
                    </svg>
                  </div>
                </div>
                <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Ofertas
                </p>
              </Link>
              <Link
                href={ route('contact') }
                className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0"
                data-name="Botón"
              >
                <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Contacto
                </p>
              </Link>
              <button onClick={openCart} className="relative bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
                <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
                  <div className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]" data-name="shopping_cart" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
                      <path d={svgPaths.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
                    </svg>
                  </div>
                </div>
                {cartCount > 0 && (
                  <span
                    aria-label={`${cartCount} productos en el carrito`}
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#fa8232] text-white text-[11px] font-bold leading-[18px] text-center"
                  >
                    {cartCount}
                  </span>
                )}
                <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Carrito
                </p>
              </button>
              <div className="flex flex-row items-center self-stretch">
                <div className="bg-[#cacccd] h-full shrink-0 w-px" />
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>                        
        {/* Mobile / Tablet Header */}
        <div className="lg:hidden flex flex-col gap-3 px-[clamp(12px,4vw,32px)] py-3 sm:py-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 w-full">
            <button type="button" onClick={() => setMenuOpen(true)} aria-label="Abrir menú" aria-expanded={menuOpen} className={`${iconButton} -ml-1.5`}>
              <Menu className="size-[22px]" />
            </button>
            <Link href={route('home')} className="h-[38px] sm:h-[44px] w-[clamp(92px,28vw,132px)] shrink-0" data-name="Logo">
              <SiteLogo imgClassName="size-full object-contain object-left" />
            </Link>

            {/* En tablet el buscador va en la misma fila */}
            <form onSubmit={submit} role="search" className="hidden md:flex flex-1 min-w-0 items-center gap-2 rounded-full border border-[#cacccd] bg-white px-4 py-2">
              <input
                type="search"
                placeholder="Buscar por palabra clave"
                aria-label="Buscar productos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent font-dm_sans text-[16px] leading-[24px] text-[#191c1f] outline-none placeholder:text-[#767676]"
              />
              <button type="submit" aria-label="Buscar" className="shrink-0 cursor-pointer text-[#191c1f]">
                <Search className="size-5" />
              </button>
            </form>

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label={searchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                aria-expanded={searchOpen}
                className={`${iconButton} md:hidden`}
              >
                {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
              </button>
              <ThemeToggle />
              <button type="button" onClick={openCart} aria-label="Ver carrito" className={iconButton}>
                <ShoppingCart className="size-5" />
                {cartCount > 0 && (
                  <span
                    aria-label={`${cartCount} productos en el carrito`}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#fa8232] text-white text-[11px] font-bold leading-[18px] text-center"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* En móvil el buscador se despliega debajo, a todo el ancho */}
          {searchOpen && (
            <form onSubmit={submit} role="search" className="md:hidden flex w-full items-center gap-2 rounded-full border border-[#cacccd] bg-white px-4 py-2">
              <input
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar productos"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="min-w-0 flex-1 bg-transparent font-dm_sans text-[16px] leading-[24px] text-[#191c1f] outline-none placeholder:text-[#767676]"
              />
              <button type="submit" aria-label="Buscar" className="shrink-0 cursor-pointer text-[#191c1f]">
                <Search className="size-5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {(menuReady || menuOpen) && <MobileMenu open={menuOpen} onClose={closeMenu} menu={menu} cartCount={cartCount} />}


    </div>
  );
}