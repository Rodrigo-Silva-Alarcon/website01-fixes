import imgImagen from "@/pages/web/assets/0910ac1d5d324ffc5ab52eb69e64b2089e2e7466.png";

function Texto20Px() {
  return (
    <div className="basis-0 content-stretch flex flex-col gap-[20px] grow items-start min-h-px min-w-[300px] relative shrink-0 text-[#191c1f]" data-name="Texto20px">
      <p className="font-dm_sans font-bold leading-[1.1] relative shrink-0 text-[49px] w-full" style={{ fontVariationSettings: "'opsz' 14" }}>
        Sobre Smart House Bolivia
      </p>
      <p className="font-poppins-regular leading-[1.4] not-italic relative shrink-0 text-[16px] w-full">Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in elementum tellus.</p>
    </div>
  );
}

export default function SectionHero() {
  return (
    <div className="relative size-full" data-name="SectionHero">
      <div className="flex flex-row items-center size-full">
        <div className="box-border content-center flex flex-wrap gap-[64px] items-center px-[64px] py-[80px] relative size-full">
          <Texto20Px />
          <div className="basis-0 grow h-[500px] min-h-px min-w-[300px] relative rounded-[10px] shrink-0" data-name="Imagen">
            <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[10px] size-full" src={imgImagen} />
          </div>
        </div>
      </div>
    </div>
  );
}