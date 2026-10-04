
import icon02 from '@/pages/web/imports/svg-3m2zodg2fw';
import icon07 from '@/pages/web/imports/svg-7x1hgehzyn';
import icon08 from '@/pages/web/imports/svg-8qsoc3g8o2';
import icon12 from '@/pages/web/imports/svg-51k8givoxg';
import icon14 from '@/pages/web/imports/svg-83d4yq5gr8';
import icon15 from '@/pages/web/imports/svg-91fycnkfpx';
import icon18 from '@/pages/web/imports/svg-ar2awh50gg';
import icon19 from '@/pages/web/imports/svg-be9yg1hs79';
import icon20 from '@/pages/web/imports/svg-e0k8kdevn2';
import icon21 from '@/pages/web/imports/svg-ebgpxejlry';
import icon23 from '@/pages/web/imports/svg-hadoz118nb';
import icon24 from '@/pages/web/imports/svg-howirk98bg';
import icon29 from '@/pages/web/imports/svg-mfz9y2svub';
import icon30 from '@/pages/web/imports/svg-mouuq1o0xb';
import icon31 from '@/pages/web/imports/svg-mrtftqmkvx';
import icon37 from '@/pages/web/imports/svg-npyi3pa09n';
import icon39 from '@/pages/web/imports/svg-o54k4pn05p';
import icon40 from '@/pages/web/imports/svg-qu85xe38hv';
import icon41 from '@/pages/web/imports/svg-r4o5rnv2kq';
import icon42 from '@/pages/web/imports/svg-t5n5xgggf3';
import icon43 from '@/pages/web/imports/svg-u06qhp5wqz';
import icon44 from '@/pages/web/imports/svg-vr2je1k94u';
import icon45 from '@/pages/web/imports/svg-w9m7quzad6';
import icon46 from '@/pages/web/imports/svg-wb8pi445k7';
import icon48 from '@/pages/web/imports/svg-zraidp0zw3';

export const TYPE_BANNERS = [
    {
        id: "0",
        label: "Ninguna",
    },
    {
        id: "1",
        label: "Enlace a Página",
    },
    {
        id: "2",
        label: "Enlace a Producto",
    },
    {
        id: "3",
        label: "Enlace a Url",
    },
] as const;

export const TYPE_VIDEO = [
    {
        id: "1",
        label: "Url",
    },
    {
        id: "3",
        label: "Insertar video (código)",
    },
    {
        id: "2",
        label: "Archivo",
    },
] as const;

export const TYPE_PAGES = [
    {
        id: "1",
        label: "Inicio",
    },
    {
        id: "2",
        label: "Nosotros",
    },    
    {
        id: "3",
        label: "Ofertas",
    },
    {
        id: "4",
        label: "Contactanos",
    },
] as const;

// Iconos de categorías/subcategorías: trazo uniforme 24x24 que hereda el color del texto.
// Los IDs ya guardados en la base de datos (08, 12, 14, 18, 19, 30, 31, 37, 39, 40, 41) se conservan.
const svg = (body: string) =>
    `<svg class="block size-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;

export const TYPE_SVG_ICONS = [
    // Tecnología
    { id: "08", label: "Televisor", icon: svg('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>') },
    { id: "18", label: "Celular", icon: svg('<rect x="6.5" y="2" width="11" height="20" rx="2.5"/><path d="M11 18.5h2"/>') },
    { id: "50", label: "Tablet", icon: svg('<rect x="3.5" y="2" width="17" height="20" rx="2"/><path d="M11 18.5h2"/>') },
    { id: "51", label: "Laptop", icon: svg('<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 19.5h20"/>') },
    { id: "55", label: "Smartwatch", icon: svg('<rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 6l1-4h4l1 4M9 18l1 4h4l1-4M12 10v2.5l1.5 1"/>') },
    { id: "61", label: "Cámara", icon: svg('<path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="13" r="3.5"/>') },
    { id: "62", label: "Hogar inteligente", icon: svg('<path d="M3 11l9-8 9 8M5 9.5V20h14V9.5"/><path d="M9.5 15a3.5 3.5 0 0 1 5 0M12 17.5h.01"/>') },
    { id: "60", label: "Accesorios / cables", icon: svg('<path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7zM12 17v5"/>') },
    // Audio
    { id: "14", label: "Equipo de sonido", icon: svg('<rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="15" r="3.5"/><circle cx="12" cy="7" r="1.5"/>') },
    { id: "41", label: "Parlante portátil", icon: svg('<rect x="7" y="2" width="10" height="20" rx="5"/><circle cx="12" cy="14.5" r="2.5"/><path d="M12 7h.01"/>') },
    { id: "52", label: "Barra de sonido", icon: svg('<rect x="2" y="9" width="20" height="6" rx="3"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/>') },
    { id: "63", label: "Minicomponente", icon: svg('<rect x="2" y="7" width="6" height="13" rx="1"/><rect x="16" y="7" width="6" height="13" rx="1"/><rect x="9.5" y="10" width="5" height="10" rx="1"/><circle cx="5" cy="15" r="1.5"/><circle cx="19" cy="15" r="1.5"/><path d="M11 13h2"/>') },
    { id: "30", label: "Audífonos", icon: svg('<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>') },
    // Gaming
    { id: "19", label: "Consola / mando", icon: svg('<path d="M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5.4 1.8L15 15H9l-1.6 1.8A3 3 0 0 1 2 15v-3a4 4 0 0 1 4-4z"/><path d="M7 10.5v3M5.5 12h3M15.5 11.5h.01M18 13h.01"/>') },
    { id: "59", label: "Videojuegos", icon: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9a5.5 5.5 0 0 1 3-3"/>') },
    // Electrodomésticos
    { id: "31", label: "Refrigeradora", icon: svg('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M5 9h14M8.5 5v2M8.5 12v3"/>') },
    { id: "37", label: "Lavadora", icon: svg('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 7h16M7 4.5h.01M10 4.5h.01"/><circle cx="12" cy="14" r="4.5"/>') },
    { id: "39", label: "Microondas", icon: svg('<rect x="2" y="5" width="20" height="14" rx="2"/><rect x="5" y="8" width="10" height="8" rx="1"/><path d="M18.5 9h.01M18.5 12h.01M18.5 15h.01"/>') },
    { id: "40", label: "Cocina / estufa", icon: svg('<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M4 9h16"/><circle cx="8.5" cy="5.5" r="1.5"/><circle cx="15.5" cy="5.5" r="1.5"/><rect x="7" y="12" width="10" height="6" rx="1"/>') },
    { id: "58", label: "Horno", icon: svg('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20M6 6h.01M9 6h.01"/><rect x="5" y="11" width="14" height="6" rx="1"/>') },
    { id: "12", label: "Cocina (ollas)", icon: svg('<path d="M4 10h16v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7zM2 10h2M20 10h2M9.5 7c0-1 1-1 1-2.5M13.5 7c0-1 1-1 1-2.5"/>') },
    { id: "57", label: "Licuadora", icon: svg('<path d="M7 3h10l-1.5 11h-7L7 3zM8.5 14h7l1.5 6a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1l1.5-6z"/><path d="M12 17.5h.01"/>') },
    { id: "56", label: "Aire acondicionado", icon: svg('<rect x="2" y="4" width="20" height="9" rx="2"/><path d="M6 10h12M8 16v3M12 16v5M16 16v3"/>') },
    { id: "64", label: "Ventilador", icon: svg('<circle cx="12" cy="10" r="7"/><circle cx="12" cy="10" r="1.5"/><path d="M12 3.5v5M17.6 13.3l-4.3-2.5M6.4 13.3l4.3-2.5M12 17v4M8 21h8"/>') },
    { id: "65", label: "Plancha", icon: svg('<path d="M3 18h18v-2a7 7 0 0 0-7-7H8l-5 9zM8 9l1-3h7M7.5 14.5h.01"/>') },
    // Muebles
    { id: "53", label: "Sofá", icon: svg('<path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3"/><path d="M2 13a2 2 0 0 1 4 0v1h12v-1a2 2 0 0 1 4 0v4a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-4zM5 18v2M19 18v2"/>') },
    { id: "54", label: "Comedor", icon: svg('<path d="M7 10h10M9 10v9M15 10v9M3 5v14M3 14h3v5M21 5v14M21 14h-3v5"/>') },
] as const;
