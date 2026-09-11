import { FormEventHandler, useEffect, useState } from "react";
import svgPaths from "../imports/svg-51k8givoxg";
import svgPathsMobile from "../imports/svg-npyi3pa09n";
import AppLogoIcon from '@/components/app-logo-icon';
import { img } from "../imports/svg-5wjm2";
import { img as imgMobile } from "../imports/svg-njpn6";
import { Link, usePage, useForm} from "@inertiajs/react";
import { route } from 'ziggy-js';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/pages/web/components/ui/sheet";
import Carrito from "../imports/Carrito";
import { MenuItem, Product, Cart } from "@/types/models";
import { toast } from 'sonner';

interface PageProps {
  flash?: {
    status?: string;
  };
}

// Mobile Components
function Frame10124113Mobile({ onOpenCart }: { onOpenCart: () => void }) {  
  
  const { find } = usePage<{ find: string }>().props;
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTermMobile, setSearchTermMobile] = useState("");
  const [searchTerm, setSearchTerm] = useState(find);
  const { data, setData, post, processing, errors } = useForm({
    find: searchTerm,
  });

  const submit: FormEventHandler = (e) => {
      e.preventDefault();
      post(route('products_post'), {
          forceFormData: true,
      });
  }; 


  if (searchOpen) {
    // Vista de búsqueda expandida
    return (
      <div className="content-stretch flex gap-[8px] items-center relative shrink-0 flex-1">
        <form 
          onSubmit={submit}
          className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] flex-1 max-w-[250px]" 
          >
          <div aria-hidden="true" className="absolute border border-[#cacccd] border-solid inset-0 pointer-events-none rounded-[40px]" />
          <input 
            type="text" 
            placeholder="Buscar..."
            autoFocus
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] outline-none border-none placeholder:text-[#cacccd] min-w-0 flex-1" 
            style={{ fontVariationSettings: "'opsz' 14" }}
          />
        </form>
        <button 
          onClick={() => setSearchOpen(false)}
          className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 cursor-pointer" 
          data-name="Botón"
          aria-label="Cerrar búsqueda"
        >
          <div className="relative shrink-0 size-[20px]">
            <svg className="size-full" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5L15 15" stroke="#191C1F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </button>
      </div>
    );
  }

  // Vista normal con iconos
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0">
      <button 
        onClick={() => setSearchOpen(true)}
        className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 cursor-pointer" 
        data-name="Botón"
        aria-label="Abrir búsqueda"
      >
        <div className="relative shrink-0 size-[20px]" data-name="search">
          <div className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]" data-name="search" style={{ maskImage: `url('${imgMobile}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
              <path d={svgPathsMobile.p1a72af00} fill="var(--fill-0, #191C1F)" id="search" />
            </svg>
          </div>
        </div>
      </button>
      <Link 
        href={route('products')}
      className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="star_shine">
          <div className="absolute inset-[10.42%_7.7%_14.58%_7.7%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.848px_-2.5px] mask-size-[24px_24px]" data-name="star_shine" style={{ maskImage: `url('${imgMobile}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17 15">
              <path d={svgPathsMobile.p1f5b98f0} fill="var(--fill-0, #191C1F)" id="star_shine" />
            </svg>
          </div>
        </div>
      </Link>
      <button onClick={onOpenCart} className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
        <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
          <div className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]" data-name="shopping_cart" style={{ maskImage: `url('${imgMobile}')` }}>
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
              <path d={svgPathsMobile.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}

function Frame10124071Mobile({ onOpenCart }: { onOpenCart: () => void }) {
  return (
    <div className="content-stretch flex items-center justify-between relative shrink-0 w-full gap-3">
      <Link 
      href={route('home')}
      className="h-[40px] relative shrink-0 w-[118.496px] " data-name="Logo" style={{ color: "#191c1f" }}>
        <div className="absolute inset-0" data-name="image 9">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <AppLogoIcon className="h-full w-full" />
          </div>
        </div>
      </Link>
      <Frame10124113Mobile onOpenCart={onOpenCart} />
    </div>
  );
}

export default function Header({ populares, cart}:{ populares:Product[];cart:Cart;}) {

  const [cartOpen, setCartOpen] = useState(false);  
  const { props } = usePage() as { props: { flash?: { status?: string } } };
  const status = props.flash?.status;
  if(status){
    toast.success(status);
  }

    const { currentpage } = usePage<{ currentpage: number }>().props;
    const { cates } = usePage<{ cates: number[] }>().props;
    const { marcas } = usePage<{ marcas: number[] }>().props;
    const { find } = usePage<{ find: string }>().props;
  
    const page = currentpage && currentpage > 0 ? currentpage : 1;
    const cs = cates && cates.length > 0 ? cates : [];
    const ms = marcas && marcas.length > 0 ? marcas : [];
    
    const [searchTerm, setSearchTerm] = useState(find);

    const { data, setData, post, processing, errors } = useForm({
      page: page,
      cs:cs,
      ms:ms,
      find: searchTerm,
    });

    useEffect(() => {
      setData('find', searchTerm);
      setData('ms', ms);
      setData('cs', cs);
      setData('page', page);
    }, [searchTerm]);
  
    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('products_post'), {
            forceFormData: true,
        });
    }; 
  
  return (
    <div className="bg-white relative w-full" data-name="Header">
      <div className="w-full">
        {/* Desktop Header */}
        <div className="hidden md:block box-border content-stretch px-[64px] py-[16px] relative w-full">
          <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
            <div className="h-[50.635px] relative shrink-0 w-[150px]" data-name="Logo" style={{ color: "#191c1f" }}>
              <Link href={route('home')} className="absolute inset-0" data-name="image 9">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <AppLogoIcon className="h-full w-full" />
                </div>
              </Link>
            </div>
            <div className="basis-0 content-stretch flex gap-[20px] grow items-center justify-end min-h-px min-w-px relative shrink-0">
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
                  className="bg-transparent font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre outline-none border-none placeholder:text-[#cacccd] min-w-0 w-[200px]" 
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
              <button onClick={() => setCartOpen(true)} className="bg-white box-border content-stretch cursor-pointer flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" data-name="Botón">
                <div className="relative shrink-0 size-[20px]" data-name="shopping_cart">
                  <div className="absolute inset-[9.38%_15.53%_10.18%_6.25%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-1.5px_-2.25px] mask-size-[24px_24px]" data-name="shopping_cart" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 17">
                      <path d={svgPaths.p3d5d4700} fill="var(--fill-0, #191C1F)" id="shopping_cart" />
                    </svg>
                  </div>
                </div>
                <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[#191c1f] text-[16px] text-nowrap whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
                  Carrito
                </p>
              </button>
            </div>
          </div>
        </div>                        
        {/* Mobile Header */}
        <div className="block md:hidden box-border content-stretch px-[20px] py-[16px] relative w-full">
           <Frame10124071Mobile onOpenCart={() => setCartOpen(true)} /> 
        </div>
      </div>

      {/* Carrito Offcanvas */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="right" className="w-full max-w-[300px] sm:max-w-[540px] p-0 overflow-y-auto [&>button]:hidden">
          <Carrito 
            onClose={() => setCartOpen(false)} 
            populares={populares}
            cart={cart}
            />
        </SheetContent>
      </Sheet>      
    </div>
  );
}