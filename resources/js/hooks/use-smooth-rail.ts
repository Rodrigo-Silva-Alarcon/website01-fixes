import { useEffect, useRef, useState, type PointerEvent, type MouseEvent, type RefObject } from "react";

type Mode = "idle" | "wheel" | "anim" | "drag";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
// para movimientos que arrancan desde reposo: acelera y frena sin tirones
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Desplazamiento horizontal suave para una fila de tarjetas:
 * - rueda del mouse con inercia (interpolación por frame, no saltos),
 * - arrastre con click que sigue al cursor y conserva el impulso al soltar,
 * - al detenerse, la fila se desliza suavemente hasta encajar la tarjeta más cercana
 *   (reemplaza al scroll-snap nativo, que encaja de golpe).
 *
 * @param step ancho de una tarjeta + separación, en px
 */
export function useSmoothRail(railRef: RefObject<HTMLDivElement | null>, step: number, deps: unknown[] = []) {
  const [edges, setEdges] = useState({ start: true, end: false });
  const s = useRef({
    mode: "idle" as Mode,
    pos: 0,
    target: 0,
    raw: 0,
    raf: 0,
    idle: 0 as ReturnType<typeof setTimeout> | 0,
    drag: { x: 0, left: 0, moved: false, lastX: 0, lastT: 0, v: 0 },
    reduce: false,
  });

  const max = () => {
    const el = railRef.current;
    return el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0;
  };
  const clamp = (x: number) => Math.min(max(), Math.max(0, x));
  // punto de encaje más cercano; el final de la fila también cuenta como encaje
  // con dir (1/-1) encaja hacia donde se venía moviendo; sin dir, a la más cercana
  const snapPoint = (x: number, dir = 0) => {
    const m = max();
    const n = x / step;
    const i = dir > 0 ? Math.ceil(n - 0.02) : dir < 0 ? Math.floor(n + 0.02) : Math.round(n);
    const to = i * step;
    if (to > m - step / 2) return m;
    return clamp(to);
  };

  const syncEdges = () => {
    const el = railRef.current;
    if (!el) return;
    const start = el.scrollLeft <= 4;
    const end = el.scrollLeft >= max() - 4;
    setEdges((e) => (e.start === start && e.end === end ? e : { start, end }));
  };

  const stop = () => {
    cancelAnimationFrame(s.current.raf);
    if (s.current.idle) clearTimeout(s.current.idle);
    s.current.idle = 0;
  };

  const write = (x: number) => {
    const el = railRef.current;
    if (!el) return;
    s.current.pos = x;
    el.scrollLeft = x;
  };

  const animateTo = (to: number, duration: number, ease: (t: number) => number = easeOutCubic) => {
    const el = railRef.current;
    if (!el) return;
    stop();
    const st = s.current;
    const from = el.scrollLeft;
    to = clamp(to);
    if (Math.abs(to - from) < 1 || st.reduce) {
      write(to);
      st.mode = "idle";
      return;
    }
    st.mode = "anim";
    st.target = to;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      write(from + (to - from) * ease(t));
      if (t < 1) st.raf = requestAnimationFrame(tick);
      else st.mode = "idle";
    };
    st.raf = requestAnimationFrame(tick);
  };

  const settle = (dir = 0) => {
    const el = railRef.current;
    if (!el) return;
    const from = el.scrollLeft;
    const to = snapPoint(from, dir);
    // más distancia → un poco más de tiempo, siempre con salida suave
    animateTo(to, Math.min(560, 300 + Math.abs(to - from) * 2), easeInOutCubic);
  };

  const scheduleSettle = (ms: number, dir = 0) => {
    const st = s.current;
    if (st.idle) clearTimeout(st.idle);
    st.idle = setTimeout(() => {
      st.idle = 0;
      if (st.mode === "idle") settle(dir);
    }, ms);
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const st = s.current;
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // En el siguiente frame: leer scrollWidth al montar forzaría un layout en mitad de la hidratación
    const firstSync = requestAnimationFrame(syncEdges);

    const onWheel = (e: WheelEvent) => {
      // el desplazamiento horizontal nativo (trackpad) se deja pasar y luego se encaja
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      // sobre la fila (imagen, texto o botón) la rueda solo la mueve a ella, nunca al panel que la contiene
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
      const delta = e.deltaY * unit * 0.55;
      if (st.mode !== "wheel") st.raw = st.target = st.pos = el.scrollLeft;
      // ya está en el extremo: no hay nada que mover
      if ((st.target <= 0 && delta < 0) || (st.target >= max() && delta > 0)) return;
      stop();
      st.mode = "wheel";
      // el destino ya es una tarjeta completa en el sentido del giro: un solo movimiento continuo
      st.raw = clamp(st.raw + delta);
      st.target = snapPoint(st.raw, Math.sign(delta));
      const k = st.reduce ? 1 : 0.14;
      const tick = () => {
        const diff = st.target - st.pos;
        if (Math.abs(diff) < 0.5) {
          write(st.target);
          st.mode = "idle";
          return;
        }
        write(st.pos + diff * k);
        st.raf = requestAnimationFrame(tick);
      };
      st.raf = requestAnimationFrame(tick);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", syncEdges);
    return () => {
      cancelAnimationFrame(firstSync);
      stop();
      el.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", syncEdges);
    };
  }, deps);

  /** Avanza o retrocede una página de tarjetas. */
  const page = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    const perPage = Math.max(1, Math.floor(el.clientWidth / step));
    const base = s.current.mode === "anim" ? s.current.target : el.scrollLeft;
    animateTo(snapPoint(Math.round(base / step) * step + dir * perPage * step), 560);
  };

  /** Lleva suavemente a la vista el elemento que empieza en `left` y mide `width` (p. ej. la miniatura activa). */
  const reveal = (left: number, width: number) => {
    const el = railRef.current;
    if (!el) return;
    const view = el.scrollLeft;
    if (left < view) animateTo(snapPoint(left, -1), 460);
    else if (left + width > view + el.clientWidth) animateTo(snapPoint(left + width - el.clientWidth, 1), 460);
  };

  const handlers = {
    onScroll: () => {
      syncEdges();
      // scroll nativo (dedo, trackpad o barra): al quedar quieto, encaja suavemente
      if (s.current.mode === "idle") scheduleSettle(160);
    },
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      const el = railRef.current;
      if (e.pointerType !== "mouse" || e.button !== 0 || !el) return;
      stop();
      s.current.mode = "idle";
      const now = performance.now();
      s.current.drag = { x: e.clientX, left: el.scrollLeft, moved: false, lastX: e.clientX, lastT: now, v: 0 };
      s.current.pos = el.scrollLeft;
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const el = railRef.current;
      const st = s.current;
      const d = st.drag;
      if (!el || !d.lastT || (e.buttons & 1) === 0) return;
      const dx = e.clientX - d.x;
      if (!d.moved) {
        if (Math.abs(dx) < 5) return;
        d.moved = true;
        st.mode = "drag";
        el.setPointerCapture(e.pointerId);
        el.style.cursor = "grabbing";
      }
      const now = performance.now();
      const dt = Math.max(1, now - d.lastT);
      // velocidad suavizada (px/ms) para el impulso al soltar
      d.v = d.v * 0.7 + ((e.clientX - d.lastX) / dt) * 0.3;
      d.lastX = e.clientX;
      d.lastT = now;
      write(clamp(d.left - dx));
    },
    onPointerUp: (e: PointerEvent<HTMLDivElement>) => {
      const el = railRef.current;
      const st = s.current;
      const d = st.drag;
      d.lastT = 0;
      if (!el || !d.moved) return;
      el.releasePointerCapture(e.pointerId);
      el.style.cursor = "";
      st.mode = "idle";
      // proyecta el impulso y desliza hasta la tarjeta más cercana a ese punto
      const projected = el.scrollLeft - d.v * 220;
      const to = snapPoint(projected);
      animateTo(to, Math.min(650, 320 + Math.abs(to - el.scrollLeft) * 1.4));
      setTimeout(() => (d.moved = false));
    },
    onClickCapture: (e: MouseEvent<HTMLDivElement>) => {
      // soltar después de arrastrar no debe abrir el producto ni añadirlo
      if (s.current.drag.moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    },
  };

  return { edges, page, reveal, handlers };
}
