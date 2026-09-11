import svgPaths from "./svg-7x1hgehzyn";
import { useState } from "react";
import { img } from "./svg-y495b";
import Price from "@/pages/web/imports/Price";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/pages/web/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Product, Cart, CartItem } from "@/types/models";
import { Link, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { toast } from "sonner";
import { cartTotals, whatsappCartUrl, itemSubtotal } from "@/lib/cart";

function Frame10124102({ onClose }: { onClose?: () => void }) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-stretch flex gap-[16px] items-center pb-0 pt-[32px] px-[32px] relative w-full">
          <p className="basis-0 font-dm_sans font-bold grow leading-[1.2] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[31px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            Mi carrito
          </p>
          <button onClick={onClose} className="block cursor-pointer overflow-visible relative shrink-0 size-[20px]" data-name="close_small">
            <div className="absolute inset-[30.1%_30.1%_30%_30%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6px_-6.021px] mask-size-[20px_20px]" data-name="close_small" style={{ maskImage: `url('${img}')` }}>
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
                <path d={svgPaths.pea1f580} fill="var(--fill-0, #191C1F)" id="close_small" />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemDelete({item}:{item:CartItem}) {
  return (
    <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
      <div className="relative shrink-0 size-[20px]" data-name="delete">
        <div className="absolute inset-[15%_20%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4px_-3px] mask-size-[20px_20px]" data-name="delete" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
            <path d={svgPaths.p26e1fe00} fill="var(--fill-0, #191C1F)" id="delete" />
          </svg>
        </div>
      </div>
      <Link 
        href={route('removeshop', {product:item.product_id})}
        className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre" 
        style={{ fontVariationSettings: "'opsz' 14" }}>
        Eliminar del carrito
      </Link>
    </div>
  );
}

function Card({item, pending, onQuantityChange}:{item:CartItem; pending:boolean; onQuantityChange:(item:CartItem, amount:number) => void}) {
  const quantity = item.amount;
  const increment = () => onQuantityChange(item, quantity + 1);
  const decrement = () => onQuantityChange(item, quantity - 1);
  const subtotal = itemSubtotal(item) / 100;
  return (
    <div className="bg-[#f2f4f5] relative rounded-[16px] shrink-0 w-full" data-name="Card">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[20px] items-start p-[15px] lg:p-[20px] relative w-full">
          <div className="hidden md:block relative shrink-0 size-[100px]" data-name="image 10">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={item.image_url} />
          </div>
          <div className="hidden md:block bg-[#191c1f] self-stretch shrink-0 w-[0.5px]" />
          <div className="basis-0 content-stretch flex flex-col gap-[16px] grow items-start min-h-px min-w-px relative shrink-0">
            <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 text-[#191c1f] w-full">
              <div className="md:hidden relative shrink-0 size-[150px] mx-auto" data-name="image 10">
                <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={item.image_url} />
              </div>
              <p className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[18px] lg:text-[20px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                {item.name} 
              </p>
              <p className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[14px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
                {item.money} {subtotal.toFixed(2)}
              </p>
            </div>
            <div className="content-stretch flex gap-[12px] items-center relative shrink-0" data-name="Botones">
              <button 
                type="button"
                aria-label={`Disminuir cantidad de ${item.name}`}
                disabled={pending || quantity <= 1}
                onClick={decrement} 
                className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
                data-name="Botón">
                <div className="relative shrink-0 size-[20px]" data-name="remove">
                  <div className="absolute inset-[46.25%_24.17%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-4.833px_-9.25px] mask-size-[20px_20px]" data-name="remove" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 2">
                      <path d="M0 1.5V0H10.3333V1.5H0Z" fill="var(--fill-0, white)" id="remove" />
                    </svg>
                  </div>
                </div>
              </button>
              <div className="bg-white box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0 w-[100px]" data-name="Buscar">
                <div aria-hidden="true" className="absolute border-[#191c1f] border-[0.5px] border-solid inset-0 pointer-events-none rounded-[40px]" />
                <input 
                value={quantity}
                readOnly
                aria-label={`Cantidad de ${item.name}`}
                className="basis-0 font-dm_sans font-normal grow leading-[20px] min-h-px min-w-px relative shrink-0 text-[#191c1f] text-[14px] text-center" 
                style={{ fontVariationSettings: "'opsz' 14" }} />
                  
              </div>
              <button 
                type="button"
                aria-label={`Aumentar cantidad de ${item.name}`}
                disabled={pending || quantity >= 9999}
                onClick={increment} 
                className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
                data-name="Botón">
                <div className="relative shrink-0 size-[20px]" data-name="add_2">
                  <div className="absolute inset-[15%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-3px] mask-size-[20px_20px]" data-name="add_2" style={{ maskImage: `url('${img}')` }}>
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p280580} fill="var(--fill-0, white)" id="add_2" />
                    </svg>
                  </div>
                </div>
              </button>
            </div>                          

            <div className="box-border content-stretch flex flex-col gap-[4px] items-center justify-center px-0 py-[4px] relative shrink-0" data-name="Botón">
              <ItemDelete item={item} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function TotalPagar ({total, money}:{total:number; money:string}){
  return (
    <div className="bg-[#f2f4f5] relative rounded-[16px] shrink-0 w-full" data-name="Card">
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="box-border content-stretch flex gap-[20px] items-center justify-center p-[20px] relative text-[#191c1f] text-nowrap w-full whitespace-pre">
          <p className="-webkit-box font-['DM_Sans:Bold',sans-serif] font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[20px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            TOTAL:
          </p>
          <p className="font-['DM_Sans:Regular',sans-serif] font-normal leading-[24px] relative shrink-0 text-[16px]" style={{ fontVariationSettings: "'opsz' 14" }}>
            {money} {total.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ListaCart({cart}:{cart:Cart}) {
  const [pending, setPending] = useState(false);
  const items = cart?.cart_items ?? [];
  const totals = cartTotals(items);
  const onQuantityChange = (item: CartItem, amount: number) => {
    if (pending || amount < 1 || amount > 9999) return;
    setPending(true);
    router.patch(`/Shop/${item.product_id}`, { amount }, {
      preserveScroll: true,
      preserveState: true,
      onError: () => toast.error('No se pudo actualizar la cantidad. Inténtalo nuevamente.'),
      onFinish: () => setPending(false),
    });
  };

  return (
    <div className="relative shrink-0 w-full">
      <div className="flex flex-col justify-center size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start justify-center p-[10px] lg:p-[30px] relative w-full">          
          {cart?.cart_items?.map((item) => (
            <Card 
              key={item.id} 
              item={item}
              pending={pending}
              onQuantityChange={onQuantityChange}
              />
          ))}
          {items.length > 0 ? (
            <>
              {Object.entries(totals).map(([money, cents]) => <TotalPagar key={money} money={money} total={cents / 100} />)}
              <Frame10124106 items={items} pending={pending} />
            </>
          ):(
            <p className="text-center w-full">
              <small>Seleccionar Productos en el carrito de compras</small>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Frame10124106({items, pending}:{items:CartItem[]; pending:boolean}) {
  if (items.length === 0) return null;
  const url = whatsappCartUrl(items);

  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[16px] items-start px-[32px] py-0 pb-[32px] relative w-full">
          <a 
            href={pending ? undefined : url}
            aria-disabled={pending}
            target="_blank"
            rel="noopener noreferrer"
            className="interactive-button bg-[#fa8232] box-border content-stretch flex gap-[8px] items-center justify-center px-[16px] py-[8px] relative rounded-[40px] shrink-0" 
            data-name="Botón3">
            <div className="relative shrink-0 size-[20px]" data-name="WhatsApp">
              <div className="absolute bottom-0 left-0 right-[0.47%] top-0" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p3190a280} fill="var(--fill-0, white)" id="Vector" />
                </svg>
              </div>
            </div>
            <p className="font-dm_sans font-normal leading-[24px] relative shrink-0 text-[16px] text-nowrap text-white whitespace-pre" style={{ fontVariationSettings: "'opsz' 14" }}>
              Solicitar pedido por WhatsApp
            </p>
          </a>
        </div>
      </div>
    </div>
  );
}
function Itemproduct({producto}:{producto:Product; }){

  return (
    <Link 
        href={route('addshop', { product: producto.id })}
        className="interactive-card bg-[#f2f4f5] box-border content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[20px] relative rounded-[16px] shrink-0 w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
      >
        <div
          className="aspect-square relative shrink-0 w-full"
          data-name="image 10"
        >
          <img
            alt=""
            className="absolute inset-0 max-w-none mix-blend-multiply object-50%-50% object-cover pointer-events-none size-full"
            src={producto.image_url}
          />
        </div>
        <div className="h-0 relative shrink-0 w-full">
          <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 276 1"
            >
              <line
                stroke="var(--stroke-0, #191C1F)"
                strokeWidth="0.5"
                x2="276"
                y1="0.25"
                y2="0.25"
              />
            </svg>
          </div>
        </div>
        <div className="content-stretch flex flex-col gap-[8px] items-start relative shrink-0 w-full text-left">
          <p
            className="-webkit-box font-dm_sans font-bold leading-[25px] overflow-ellipsis overflow-hidden relative shrink-0 text-[#191c1f] text-[20px] w-full"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {producto.name}
          </p>
          { producto?.inventory?.amount && (
              <>
                <Price 
                  inventory={producto.inventory}/>
              </>
          )}
        </div>
      </Link>
  );
}
function SuggestedProducts({populares}:{populares:Product[]}){

  return (
    <div className="relative shrink-0 w-full">
      <div className="size-full">
        <div className="box-border content-stretch flex flex-col gap-[24px] md:gap-[32px] items-start px-[16px] md:px-[32px] py-[32px] md:py-[40px] relative w-full">
          <p
            className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[#191c1f] text-[28px] md:text-[39px] w-full"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            Productos sugeridos
          </p>
          <Carousel
            opts={{
              align: "start",
              loop: true,
              slidesToScroll: 1,
            }}
            plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
              }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-3 md:-ml-4">
              {populares.map((producto) => (
                <CarouselItem
                  key={producto.id}
                  className="pl-3 md:pl-4 basis-full sm:basis-1 lg:basis-1/2"
                >
                  <Itemproduct producto={producto}/>                  
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </div>
  );
}

interface FormProps {
  onClose: () => void;
  populares: Product[];
  cart:Cart;
}

export default function Carrito({ onClose, populares, cart }: FormProps) {

  return (
    <div className="bg-white content-stretch flex flex-col items-center relative size-full" data-name="Carrito">
      <Frame10124102 onClose={onClose} />
      <ListaCart  
        cart={cart}
        />      
      <SuggestedProducts 
        populares={populares}
        
      />
    </div>
  );
}