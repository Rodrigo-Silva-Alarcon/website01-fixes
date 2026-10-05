import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

// Centro de La Paz, Bolivia
const DEFAULT_CENTER: LatLng = { lat: -16.5, lng: -68.15 };
const NOMINATIM = "https://nominatim.openstreetmap.org";

const PIN_HTML = `<svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M17 0C7.6 0 0 7.5 0 16.8 0 29.4 17 44 17 44s17-14.6 17-27.2C34 7.5 26.4 0 17 0z" fill="#fa8232"/>
  <circle cx="17" cy="16.5" r="6.5" fill="#fff"/>
</svg>`;

type NominatimAddress = Record<string, string | undefined>;

/** Arma una dirección legible (calle + número, zona, ciudad) a partir de Nominatim. */
function formatAddress(a: NominatimAddress, fallback: string): string {
  const street = [a.road ?? a.pedestrian ?? a.footway ?? a.path, a.house_number].filter(Boolean).join(" ");
  const zone = a.neighbourhood ?? a.suburb ?? a.quarter ?? a.city_district;
  const city = a.city ?? a.town ?? a.village ?? a.municipality;
  const parts = [street, zone, city].filter((p, i, arr) => p && arr.indexOf(p) === i);
  return parts.length ? parts.join(", ") : fallback;
}

export async function reverseGeocode({ lat, lng }: LatLng, signal?: AbortSignal): Promise<string | null> {
  const url = `${NOMINATIM}/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=es&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json?.address) return json?.display_name ?? null;
  return formatAddress(json.address, json.display_name ?? "");
}

export async function forwardGeocode(query: string, signal?: AbortSignal): Promise<LatLng | null> {
  const url = `${NOMINATIM}/search?format=jsonv2&limit=1&countrycodes=bo&accept-language=es&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const [hit] = await res.json();
  return hit ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;
}

/**
 * Mapa interactivo (Leaflet + OpenStreetMap). Clic en el mapa o arrastrar el pin
 * llama a `onPick`; `point` solo mueve el pin, nunca dispara `onPick`.
 */
export default function DeliveryMap({
  point,
  onPick,
  className = "",
}: {
  point: LatLng | null;
  onPick: (p: LatLng) => void;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const pointRef = useRef(point);
  pointRef.current = point;

  const placeMarker = (p: LatLng) => {
    const lib = L.current;
    const m = map.current;
    if (!lib || !m) return;
    if (marker.current) {
      marker.current.setLatLng(p);
      return;
    }
    const icon = lib.divIcon({ html: PIN_HTML, className: "", iconSize: [34, 44], iconAnchor: [17, 44] });
    marker.current = lib
      .marker(p, { icon, draggable: true, keyboard: true, title: "Ubicación de entrega" })
      .addTo(m)
      .on("dragend", (e) => {
        const ll = (e.target as Marker).getLatLng();
        onPickRef.current({ lat: ll.lat, lng: ll.lng });
      });
  };

  // Leaflet usa `window`: se carga en el cliente para no romper el SSR.
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (cancelled || !container.current || map.current) return;
      const lib = (mod as unknown as { default?: typeof import("leaflet") }).default ?? mod;
      L.current = lib;
      const start = pointRef.current;
      const m = lib.map(container.current, {
        center: start ?? DEFAULT_CENTER,
        zoom: start ? 17 : 13,
        scrollWheelZoom: true,
        zoomControl: true,
      });
      lib
        .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        })
        .addTo(m);
      m.on("click", (e) => onPickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng }));
      map.current = m;
      if (start) placeMarker(start);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!point || !m) return;
    placeMarker(point);
    if (!m.getBounds().pad(-0.2).contains(point)) m.setView(point, Math.max(m.getZoom(), 16));
  }, [point]);

  return (
    <div
      ref={container}
      role="application"
      aria-label="Mapa de ubicación de entrega. Haz clic para marcar el punto exacto."
      className={`z-0 cursor-crosshair ${className}`}
    />
  );
}
