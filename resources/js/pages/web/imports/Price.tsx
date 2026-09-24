
import { Inventory } from "@/types/models";
import { isOnOffer } from "@/lib/product-enquiry";

export default function Price({inventory}:{inventory:Inventory}) {
  const mostrarOferta = isOnOffer(inventory);

  return (
    <div className="content-start flex flex-wrap font-dm_sans font-normal gap-[8px] items-start leading-[24px] relative shrink-0 text-[16px] text-nowrap w-full whitespace-pre">
      
      {mostrarOferta ? (
        <>
            <p
                className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid line-through relative shrink-0 text-[#b45309]"
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