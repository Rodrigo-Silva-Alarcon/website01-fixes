
import { Inventory } from "@/types/models";

export default function Price({inventory}:{inventory:Inventory}) {
    
    const hoy = new Date();
    const ini = inventory.ini ? new Date(inventory.ini) : null;
    const fin = inventory.fin ? new Date(inventory.fin) : null;

    const mostrarOferta =
        (ini && fin && ini <= hoy && hoy <= fin) || // rango válido
        (ini && !fin && ini <= hoy) ||              // solo fecha inicial
        (!ini && fin && hoy <= fin);                // solo fecha final

  return (
    <div className="content-start flex flex-wrap font-dm_sans font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
      
      {mostrarOferta ? (
        <>
            <p
                className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through relative shrink-0 text-[#fa8232]"
                style={{ fontVariationSettings: "'opsz' 14" }}
            >
                {inventory.money} {inventory.amount}
            </p>
            <p
            className="relative shrink-0 text-[#191c1f]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            >
            {inventory.money} {inventory.offer_amount}
            </p>
        </>
      ):(
        <p
            className="relative shrink-0 text-[#191c1f]"
            style={{ fontVariationSettings: "'opsz' 14" }}
            >
            {inventory.money} {inventory.amount}
            </p>
      )}
    </div>
  );
}