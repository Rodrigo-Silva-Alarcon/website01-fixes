import { useState } from "react";
import svgPaths from "@/pages/web/imports/svg-qu85xe38hv";
import { img } from "@/pages/web/imports/svg-09xop";
import { Link } from "@inertiajs/react";
import { MenuItem } from "@/types/models";
import { TYPE_SVG_ICONS } from "@/types/Data";
import { route } from "ziggy-js";

function MenuItemComponent({
    item,
    isHovered,
  }: {
    item: MenuItem;
    isHovered: boolean;
  }) {

  var icono = TYPE_SVG_ICONS.find(i => i.id === item.icon)?.icon;

  return (
    <Link  
    href={item.submenu.length > 0
      ? '#'
      : route('category', { category: item.id })
    }
      className={`content-stretch flex gap-[5px] items-center justify-center relative shrink-0 ${
        isHovered? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
    >
      <div
        className="relative shrink-0 size-[24px]"
        data-name={item.icon}
      >
        <div
          className="absolute inset-[14.58%_10.42%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2.5px_-3.5px] mask-size-[24px_24px]"
          data-name={item.icon}
        >          
          <div className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current"
              dangerouslySetInnerHTML={{ __html: String(icono) }}
          />
        </div>
      </div>
      <p
        className="font-dm_sans font-normal leading-[20px] relative shrink-0 text-[#191c1f] text-[14px] text-nowrap whitespace-pre"
        style={{ fontVariationSettings: "'opsz' 14" }}
      >
        {item.name}
      </p>
      {item.submenu.length > 0 && (
        <div
          className="relative shrink-0 size-[24px]"
          data-name="keyboard_arrow_down"
        >
          <div
            className="absolute inset-[34.78%_26.44%_37.28%_26.44%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.346px_-8.346px] mask-size-[24px_24px]"
            data-name="keyboard_arrow_down"
            style={{ maskImage: `url('${img}')` }}
          >
            <svg
              className="block size-full"
              fill="none"
              preserveAspectRatio="none"
              viewBox="0 0 12 7"
              style={{
                transform: isHovered ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path
                d={svgPaths.p34b30800}
                fill="var(--fill-0, #191C1F)"
                id="keyboard_arrow_down"
              />
            </svg>
          </div>
        </div>
      )}
    </Link>
  );
}

function Submenu({ items, id }: { items: MenuItem[]; id:String }) {
  return (
    <div
      className="absolute top-full left-1/2 -translate-x-1/2 z-50 w-[240px] animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="bg-[#f2f4f5] relative rounded-b-[10px] w-full h-full" data-name="Cocina">
        <div className="w-full h-full">
          <div className="box-border flex flex-col gap-[20px] items-start p-[20px] relative w-full h-full">
            {items.map((item) => {
              const img = item.icon || '/default-icon.svg';
               var icono = TYPE_SVG_ICONS.find(i => i.id === item.icon)?.icon;
              return (
                <Link
                  href={route('subcategory', {category: id, subcategory:item.id})}
                  key={item.id}
                  className="flex gap-[5px] items-center justify-start relative shrink-0"
                >
                  <div className="relative shrink-0 size-[24px]" data-name={item.name}>
                    <div className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current"
                      dangerouslySetInnerHTML={{ __html: String(icono) }}
                    />
                  </div>
                  <p
                    className="font-['DM_Sans',sans-serif] font-normal leading-[20px] text-[#191c1f] text-[14px] whitespace-pre"
                    style={{ fontVariationSettings: "'opsz' 14" }}
                  >
                    {item.name}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function CategoriasMenu({menu}:{menu:MenuItem[]}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);  
  return (
    <div className="hidden md:block relative w-full">
      <div
        className="bg-[#f2f4f5] relative size-full"
        data-name="CategoriasMenu"
      >
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex items-center justify-between px-[64px] relative size-full max-w-[1440px] mx-auto">
            {menu.map((item) => {
              const isHovered = hoveredItem === item.id;

              if (item.submenu) {
                return (
                  <button
                    key={item.id}
                    className="relative py-[12px]"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <MenuItemComponent
                      item={item}
                      isHovered={isHovered}                    
                    />
                    {isHovered && item.submenu.length > 0 && (
                      <Submenu items={item.submenu} id={item.id} />
                    )} 
                  </button>
                );
              }

              return (
                <MenuItemComponent
                  key={item.id}
                  item={item}
                  isHovered={false}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}