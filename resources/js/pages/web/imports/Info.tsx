import { useEffect, useState } from "react";
import { useCms } from "@/lib/cms";
import svgPaths from "./svg-hadoz118nb";
import { img } from "./svg-4o8gu";
import svgPathsPromo from "./svg-83d4yq5gr8";
import { img as imgPromo } from "./svg-k80sv";
import svgPathsSchedule from "./svg-zraidp0zw3";
import { img as imgSchedule } from "./svg-44yuh";

function TextoDelivery({ label }: { label: string }) {
  return (
    <div className="info-slide basis-0 content-stretch flex gap-2 sm:gap-[16px] grow items-center justify-center min-h-px min-w-0 relative shrink-0" data-name="Texto">
      <div className="relative shrink-0 size-[20px]" data-name="delivery_truck_speed">
        <div className="absolute inset-[20%_5%_17.5%_2.5%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-0.5px_-4px] mask-size-[20px_20px]" data-name="delivery_truck_speed" style={{ maskImage: `url('${img}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19 13">
            <path d={svgPaths.p4c87200} fill="var(--fill-0, white)" id="delivery_truck_speed" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[24px] relative min-w-0 truncate text-[14px] sm:text-[16px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
        {label}
      </p>
    </div>
  );
}

function TextoPromo({ label }: { label: string }) {
  return (
    <div className="info-slide basis-0 content-stretch flex gap-2 sm:gap-[16px] grow items-center justify-center min-h-px min-w-0 relative shrink-0" data-name="Texto">
      <div className="relative shrink-0 size-[20px]" data-name="savings">
        <div className="absolute inset-[10%_10%_15%_10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[20px_20px]" data-name="savings" style={{ maskImage: `url('${imgPromo}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 15">
            <path d={svgPathsPromo.p2cd3d900} fill="var(--fill-0, white)" id="savings" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[24px] relative min-w-0 truncate text-[14px] sm:text-[16px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
        {label}
      </p>
    </div>
  );
}

function TextoSchedule({ label }: { label: string }) {
  return (
    <div className="info-slide basis-0 content-stretch flex gap-2 sm:gap-[16px] grow items-center justify-center min-h-px min-w-0 relative shrink-0" data-name="Texto">
      <div className="relative shrink-0 size-[20px]" data-name="schedule">
        <div className="absolute inset-[10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-2px] mask-size-[20px_20px]" data-name="schedule" style={{ maskImage: `url('${imgSchedule}')` }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
            <path d={svgPathsSchedule.p3ba9cc00} fill="var(--fill-0, white)" id="schedule" />
          </svg>
        </div>
      </div>
      <p className="font-dm_sans font-normal leading-[24px] relative min-w-0 truncate text-[14px] sm:text-[16px] text-white" style={{ fontVariationSettings: "'opsz' 14" }}>
        {label}
      </p>
    </div>
  );
}

export default function Info() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { text } = useCms();

  // Mensajes editables en Admin › Textos (topbar_1..3); el horario se comparte con el showroom
  const slides = [
    <TextoDelivery key="delivery" label={text("topbar_1", "Delivery gratuito")} />,
    <TextoPromo key="promo" label={text("topbar_2", "Promociones y descuentos exclusivos")} />,
    <TextoSchedule key="schedule" label={text("topbar_3", text("business_hours", "Atención de lunes a sábado"))} />
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === 2 ? 0 : prev + 1));
  };

  return (
    <div className="h-[40px]">
      <div className="bg-[#c2410c] relative size-full" data-name="Info">
        <div className="flex flex-row items-center size-full">
          <div className="box-border content-stretch flex gap-3 sm:gap-10 md:gap-[80px] items-center px-4 sm:px-[32px] py-[8px] relative size-full">
            <button 
              onClick={handlePrev}
              className="relative shrink-0 size-[20px] cursor-pointer hover:opacity-70 transition-opacity" 
              data-name="chevron_backward"
              aria-label="Anterior"
            >
              <div className="absolute bottom-1/4 left-[35%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-7px_-5px] mask-size-[20px_20px] right-[34.69%] top-1/4" data-name="chevron_backward" style={{ maskImage: `url('${img}')` }}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 10">
                  <path d={svgPaths.p22a1e500} fill="var(--fill-0, white)" id="chevron_backward" />
                </svg>
              </div>
            </button>
            <div aria-live="polite" className="basis-0 grow flex items-center justify-center min-w-0 overflow-hidden">
              {slides[currentSlide]}
            </div>
            <button 
              onClick={handleNext}
              className="relative shrink-0 size-[20px] cursor-pointer hover:opacity-70 transition-opacity" 
              data-name="chevron_forward"
              aria-label="Siguiente"
            >
              <div className="absolute bottom-1/4 left-[34.69%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[-6.938px_-5px] mask-size-[20px_20px] right-[35%] top-1/4" data-name="chevron_forward" style={{ maskImage: `url('${img}')` }}>
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7 10">
                  <path d={svgPaths.p15c42280} fill="var(--fill-0, white)" id="chevron_forward" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
