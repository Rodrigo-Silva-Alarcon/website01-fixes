import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { cn } from '@/lib/utils';
import { router } from '@inertiajs/react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, LayoutGroup, MotionConfig, motion, type Transition } from 'framer-motion';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ChevronLeft,
    ChevronRight,
    Crop,
    Focus,
    GripVertical,
    ImageUp,
    Loader2,
    Move,
    Save,
    X,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type DragEvent,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactElement,
} from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { flash, formatDate, type AboutImage } from './_shared';

/** Formato de cada posición en la web (igual que AboutPage): 1 y 4 anchas, 2 y 3 angostas. */
const SLOTS = [
    { ratio: '4 / 5', label: '4:5', kind: 'Ancha', aspect: 4 / 5 },
    { ratio: '3 / 5', label: '3:5', kind: 'Angosta', aspect: 3 / 5 },
    { ratio: '3 / 5', label: '3:5', kind: 'Angosta', aspect: 3 / 5 },
    { ratio: '4 / 5', label: '4:5', kind: 'Ancha', aspect: 4 / 5 },
];
const slotOf = (index: number) => SLOTS[index] ?? SLOTS[0];

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING: Transition = { type: 'spring', stiffness: 380, damping: 34, mass: 0.9 };
const FADE: Transition = { duration: 0.22, ease: EASE };

interface GalleryItem {
    id: number;
    src: string;
    alt: string;
    focus_x: number;
    focus_y: number;
    /** Foto elegida en el equipo, pendiente de subir al guardar. */
    file: File | null;
    editor: string | null;
}

type Draft = GalleryItem & { target: number };
type Change = 'new' | 'edited' | null;

const toItems = (images: AboutImage[]): GalleryItem[] =>
    images.map((img) => ({
        id: img.id,
        src: img.image_url,
        alt: img.alt,
        focus_x: img.focus_x,
        focus_y: img.focus_y,
        file: null,
        editor: img.editor ? `${img.editor.name} · ${formatDate(img.updated_at)}` : null,
    }));

const changeOf = (item: GalleryItem, index: number, base: GalleryItem[]): Change => {
    if (item.file) return 'new';
    const before = base.findIndex((b) => b.id === item.id);
    const b = base[before];
    if (!b) return 'edited';
    return before !== index || b.focus_x !== item.focus_x || b.focus_y !== item.focus_y || b.alt !== item.alt ? 'edited' : null;
};

const swap = <T,>(list: T[], a: number, b: number) => {
    const next = [...list];
    [next[a], next[b]] = [next[b], next[a]];
    return next;
};

const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));

const MAX_MB = 8;

const validFile = (file: File | undefined): file is File => {
    if (!file) return false;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
        toast.error('Formato no admitido', { description: `«${file.name}» no es una imagen válida. Usa una foto JPG, PNG o WebP.` });
        return false;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
        const mb = (file.size / 1024 / 1024).toFixed(1);
        toast.error('La foto es demasiado pesada', { description: `Pesa ${mb} MB y el máximo permitido es ${MAX_MB} MB. Comprímela o elige otra.` });
        return false;
    }
    return true;
};

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = () => setMatches(mql.matches);
        onChange();
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);
    return matches;
}

/* ─────────────────────────────── Galería ─────────────────────────────── */

export function Gallery({
    images,
    canEdit,
    onDirtyChange,
}: {
    images: AboutImage[];
    canEdit: boolean;
    /** Resumen de los cambios sin guardar, para el aviso al salir de la página. */
    onDirtyChange?: (summary: string[]) => void;
}) {
    // Solo se reinicia cuando el servidor devuelve fotos distintas (no en recargas parciales del historial)
    const signature = images.map((i) => [i.id, i.image_url, i.focus_x, i.focus_y, i.alt, i.updated_at].join('|')).join(';');
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const base = useMemo(() => toItems(images), [signature]);

    const [items, setItems] = useState(base);
    const [editing, setEditing] = useState<number | null>(null);
    const [draft, setDraft] = useState<Draft | null>(null);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [dragId, setDragId] = useState<number | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
    const blobUrls = useRef<string[]>([]);

    const releaseBlobs = useCallback(() => {
        blobUrls.current.forEach((url) => URL.revokeObjectURL(url));
        blobUrls.current = [];
    }, []);
    const previewUrl = (file: File) => {
        const url = URL.createObjectURL(file);
        blobUrls.current.push(url);
        return url;
    };

    useEffect(() => {
        setItems(base);
        releaseBlobs();
    }, [base, releaseBlobs]);
    useEffect(() => releaseBlobs, [releaseBlobs]);

    const changes = items.map((item, index) => changeOf(item, index, base));
    const dirty = changes.filter(Boolean).length;

    // El aviso al salir sin guardar lo muestra la página, junto con el de los textos
    const changeSummary = summary(changes);
    const summaryKey = changeSummary.join('|');
    useEffect(() => {
        onDirtyChange?.(summaryKey ? summaryKey.split('|') : []);
    }, [summaryKey, onDirtyChange]);

    const move = (from: number, to: number) => {
        if (to < 0 || to >= items.length || from === to) return;
        setItems((list) => swap(list, from, to));
    };

    const replace = (id: number, file: File | undefined) => {
        if (!validFile(file)) return;
        const src = previewUrl(file);
        // Una foto nueva empieza centrada
        setItems((list) => list.map((it) => (it.id === id ? { ...it, src, file, focus_x: 50, focus_y: 50 } : it)));
    };

    /* Editor */
    const openEditor = (index: number) => {
        setDraft({ ...items[index], target: index });
        setEditing(index);
    };
    const closeEditor = () => {
        setEditing(null);
    };
    const commit = (): GalleryItem[] => {
        if (editing === null || !draft) return items;
        const { target, ...item } = draft;
        const next = items.map((it, i) => (i === editing ? item : it));
        return target !== editing ? swap(next, editing, target) : next;
    };
    const applyEditor = () => {
        setItems(commit());
        closeEditor();
    };
    const step = (delta: number) => {
        if (!draft) return;
        const next = commit();
        const index = draft.target + delta;
        if (index < 0 || index >= next.length) return;
        setItems(next);
        setEditing(index);
        setDraft({ ...next[index], target: index });
    };

    const save = () => {
        const missing = items.findIndex((it) => !it.alt.trim());
        if (missing >= 0) {
            toast.error('Falta el texto alternativo', { description: `Describe la foto de la posición ${missing + 1} antes de guardar.` });
            return;
        }
        setSaving(true);
        router.post(
            route('admin.about.images.gallery'),
            {
                images: items.map((it) => ({
                    id: it.id,
                    focus_x: it.focus_x,
                    focus_y: it.focus_y,
                    alt: it.alt.trim(),
                    ...(it.file ? { file: it.file } : {}),
                })),
            },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                onProgress: (e) => setProgress(e?.percentage ?? null),
                onSuccess: flash,
                onError: (errs) =>
                    toast.error('No se pudo guardar la galería', { description: Object.values(errs)[0] ?? 'Revisa las fotos e intenta nuevamente.' }),
                onFinish: () => {
                    setSaving(false);
                    setProgress(null);
                },
            },
        );
    };

    const discard = () => {
        setItems(base);
        releaseBlobs();
        setConfirmDiscard(false);
        toast('Cambios descartados', { description: 'La galería volvió a como está publicada en la web.' });
    };

    const dragProps = (id: number, index: number) =>
        canEdit && finePointer && !saving
            ? {
                  draggable: true,
                  onDragStart: (e: DragEvent) => {
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(id));
                      setDragId(id);
                  },
                  onDragOver: (e: DragEvent) => {
                      if (dragId === null) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (overId !== id) setOverId(id);
                  },
                  onDragLeave: (e: DragEvent) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverId((o) => (o === id ? null : o));
                  },
                  onDrop: (e: DragEvent) => {
                      e.preventDefault();
                      const from = items.findIndex((it) => it.id === dragId);
                      if (from >= 0) move(from, index);
                      setDragId(null);
                      setOverId(null);
                  },
                  onDragEnd: () => {
                      setDragId(null);
                      setOverId(null);
                  },
              }
            : {};

    const hint = !canEdit
        ? 'Así se ordenan en la web: las posiciones 1 y 4 son anchas (4:5), la 2 y 3 angostas (3:5).'
        : finePointer
          ? 'Arrastra una tarjeta sobre otra para intercambiarlas. Haz clic en una foto para recortarla.'
          : 'Usa las flechas para cambiar el orden. Toca una foto para recortarla.';

    return (
        <MotionConfig reducedMotion="user">
            <div className="@container grid gap-4">
                <LayoutGroup>
                    {/* Tarjetas: solo cuando caben las 4 en fila, en el mismo orden que la web */}
                    <div className="hidden gap-3 @2xl:grid">
                        <p className="text-sm text-muted-foreground">{hint}</p>
                        <div className="grid grid-cols-4 items-stretch gap-2.5 @4xl:gap-3.5">
                            {items.map((item, index) => (
                                <motion.div key={item.id} layout="position" transition={SPRING} className="flex min-w-0">
                                    <GalleryCard
                                        item={item}
                                        index={index}
                                        change={changes[index]}
                                        canEdit={canEdit}
                                        locked={saving}
                                        finePointer={finePointer}
                                        dragging={dragId === item.id}
                                        over={overId === item.id && dragId !== item.id}
                                        dragProps={dragProps(item.id, index)}
                                        onEdit={() => openEditor(index)}
                                        onMove={(delta) => move(index, index + delta)}
                                        onReplace={(file) => replace(item.id, file)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Lista (móvil o contenedor donde no caben 4 tarjetas) */}
                    <div className="grid gap-4 @2xl:hidden">
                        <div className="grid gap-2">
                            <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Vista en la web</span>
                            <WebStrip items={items} className="@lg:max-w-md" />
                        </div>
                        <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
                            {items.map((item, index) => (
                                <motion.li
                                    key={item.id}
                                    layout="position"
                                    transition={SPRING}
                                    className="relative flex items-center gap-1 bg-card py-2 pr-1.5 pl-2.5"
                                >
                                    <button
                                        type="button"
                                        disabled={!canEdit || saving}
                                        onClick={() => openEditor(index)}
                                        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left transition-transform duration-200 active:scale-[.985] disabled:cursor-default"
                                    >
                                        {/* Marco 3:5 igual para todas; la foto conserva el formato de su posición */}
                                        <span className="flex aspect-[3/5] w-[52px] flex-none items-center overflow-hidden rounded-lg bg-muted/60">
                                            <motion.span
                                                layout
                                                transition={SPRING}
                                                className="relative block w-full overflow-hidden rounded-lg bg-muted"
                                                style={{ aspectRatio: slotOf(index).ratio }}
                                            >
                                                <img
                                                    src={item.src}
                                                    alt=""
                                                    className="absolute inset-0 h-full w-full object-cover transition-[object-position] duration-500"
                                                    style={{ objectPosition: `${item.focus_x}% ${item.focus_y}%` }}
                                                />
                                            </motion.span>
                                        </span>
                                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                                            <span className="flex items-center gap-1.5 text-sm font-semibold">
                                                Posición {index + 1}
                                                <ChangeTag change={changes[index]} small />
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {slotOf(index).kind} · {slotOf(index).label}
                                            </span>
                                            <span className="truncate text-xs text-foreground/70">{item.alt}</span>
                                        </span>
                                    </button>
                                    {canEdit && (
                                        <div className="flex flex-col">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-10 w-11"
                                                disabled={saving || index === 0}
                                                onClick={() => move(index, index - 1)}
                                                aria-label="Subir"
                                            >
                                                <ArrowUp className="size-[18px]" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                className="h-10 w-11"
                                                disabled={saving || index === items.length - 1}
                                                onClick={() => move(index, index + 1)}
                                                aria-label="Bajar"
                                            >
                                                <ArrowDown className="size-[18px]" />
                                            </Button>
                                        </div>
                                    )}
                                </motion.li>
                            ))}
                        </ul>
                        {canEdit ? (
                            <span className="text-xs text-muted-foreground">Toca una foto para recortarla o reemplazarla.</span>
                        ) : (
                            <span className="text-xs text-muted-foreground">{hint}</span>
                        )}
                    </div>
                </LayoutGroup>

                {canEdit && <SaveBar dirty={dirty} saving={saving} progress={progress} onSave={save} onDiscard={() => setConfirmDiscard(true)} />}

                <ConfirmDialog
                    open={confirmDiscard}
                    tone="danger"
                    title="¿Descartar los cambios de la galería?"
                    description="Las fotos volverán a como están publicadas en la web. Esta acción no se puede deshacer."
                    details={changeSummary}
                    confirmLabel="Descartar cambios"
                    cancelLabel="Seguir editando"
                    onConfirm={discard}
                    onCancel={() => setConfirmDiscard(false)}
                />
            </div>

            {canEdit && (
                <CropEditor
                    open={editing !== null && draft !== null}
                    draft={draft}
                    editing={editing}
                    items={items}
                    onDraft={(patch) => setDraft((d) => (d ? { ...d, ...patch } : d))}
                    onReplace={(file) => {
                        if (!validFile(file)) return;
                        setDraft((d) => (d ? { ...d, src: previewUrl(file), file, focus_x: 50, focus_y: 50 } : d));
                    }}
                    onStep={step}
                    onApply={applyEditor}
                    onClose={closeEditor}
                />
            )}
        </MotionConfig>
    );
}

/* ─────────────────────────────── Piezas ─────────────────────────────── */

/** «1 foto nueva», «2 fotos editadas»… para los diálogos de confirmación. */
function summary(changes: Change[]) {
    const added = changes.filter((c) => c === 'new').length;
    const edited = changes.filter((c) => c === 'edited').length;
    const out: string[] = [];
    if (added) out.push(`${added} ${added === 1 ? 'foto nueva' : 'fotos nuevas'}`);
    if (edited) out.push(`${edited} ${edited === 1 ? 'foto editada' : 'fotos editadas'}`);
    return out;
}

/** Tooltip del panel en lugar del `title` nativo del navegador. */
function Hint({ label, children }: { label: string; children: ReactElement }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
        </Tooltip>
    );
}

function ChangeTag({ change, small = false, floating = false }: { change: Change; small?: boolean; floating?: boolean }) {
    return (
        <AnimatePresence initial={false}>
            {change && (
                <motion.span
                    key={change}
                    initial={{ opacity: 0, scale: 0.7, y: -2 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={cn(
                        'rounded-full font-semibold text-white shadow-sm',
                        change === 'new' ? 'bg-red-600' : 'bg-orange-600',
                        small ? 'px-1.5 py-px text-[10px]' : 'px-2.5 py-0.5 text-[11px]',
                        floating && 'absolute top-2 left-2',
                    )}
                >
                    {change === 'new' ? 'Nueva' : 'Editada'}
                </motion.span>
            )}
        </AnimatePresence>
    );
}

interface GalleryCardProps {
    item: GalleryItem;
    index: number;
    change: Change;
    canEdit: boolean;
    locked: boolean;
    finePointer: boolean;
    dragging: boolean;
    over: boolean;
    dragProps: object;
    onEdit: () => void;
    onMove: (delta: number) => void;
    onReplace: (file: File | undefined) => void;
}

function GalleryCard({ item, index, change, canEdit, locked, finePointer, dragging, over, dragProps, onEdit, onMove, onReplace }: GalleryCardProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const slot = slotOf(index);

    // El marco es 3:5 en todas las tarjetas (simetría); la foto conserva el formato de su posición
    const photo = (
        <motion.span
            layout
            transition={SPRING}
            className="relative block w-full overflow-hidden rounded-[10px] bg-muted"
            style={{ aspectRatio: slot.ratio }}
        >
            <img
                src={item.src}
                alt={item.alt}
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-[object-position,scale] duration-500 ease-out group-hover/photo:scale-[1.04]"
                style={{ objectPosition: `${item.focus_x}% ${item.focus_y}%` }}
            />
            <ChangeTag change={change} floating />
        </motion.span>
    );

    return (
        <div
            {...dragProps}
            className={cn(
                'flex w-full flex-col gap-2.5 rounded-2xl border bg-card p-2 shadow-xs transition-[box-shadow,opacity,scale,border-color] duration-300 ease-out',
                canEdit && 'hover:shadow-md',
                dragging && 'scale-[.97] opacity-40',
                over && 'border-red-600 shadow-[0_0_0_3px_rgb(220_38_38/.9)]',
            )}
        >
            <div className="flex min-h-8 items-center justify-between gap-1.5 pt-0.5 pl-1">
                <span className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold">
                    <motion.span
                        key={index}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                        className="flex size-[22px] flex-none items-center justify-center rounded-full bg-orange-600 text-[11px] text-white"
                    >
                        {index + 1}
                    </motion.span>
                    <span className="truncate font-medium text-muted-foreground">
                        {slot.kind}
                        <span className="hidden @4xl:inline"> · {slot.label}</span>
                    </span>
                </span>
                {canEdit &&
                    (finePointer ? (
                        <Hint label="Arrastra para cambiar de posición">
                            <span className="flex size-7 flex-none cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:cursor-grabbing">
                                <GripVertical className="size-4" />
                            </span>
                        </Hint>
                    ) : (
                        <span className="flex flex-none gap-0.5">
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={locked || index === 0}
                                onClick={() => onMove(-1)}
                                aria-label="Mover a la izquierda"
                            >
                                <ArrowLeft className="size-[15px]" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="size-8"
                                disabled={locked || index === SLOTS.length - 1}
                                onClick={() => onMove(1)}
                                aria-label="Mover a la derecha"
                            >
                                <ArrowRight className="size-[15px]" />
                            </Button>
                        </span>
                    ))}
            </div>

            {canEdit ? (
                <button
                    type="button"
                    onClick={onEdit}
                    disabled={locked}
                    aria-label={`Editar foto ${index + 1}`}
                    className="group/photo relative flex aspect-[3/5] w-full items-center overflow-hidden rounded-xl bg-muted/60 focus-visible:ring-2 focus-visible:ring-orange-600 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    {photo}
                    <span className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent pb-3 opacity-0 transition-opacity duration-300 group-hover/photo:opacity-100">
                        <span className="flex translate-y-1 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-neutral-900 shadow transition-transform duration-300 group-hover/photo:translate-y-0">
                            <Crop className="size-3.5" />
                            Recortar
                        </span>
                    </span>
                </button>
            ) : (
                <div className="relative flex aspect-[3/5] w-full items-center overflow-hidden rounded-xl bg-muted/60">{photo}</div>
            )}

            <span className="line-clamp-2 min-h-[35px] px-1 text-[13px] leading-snug text-foreground/70">{item.alt}</span>

            {canEdit && (
                <div className="mt-auto flex gap-1.5">
                    <Button type="button" variant="outline" className="h-9 flex-1 gap-1.5 px-2 text-[13px]" disabled={locked} onClick={onEdit}>
                        <Crop className="size-[15px]" />
                        Editar
                    </Button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            onReplace(e.target.files?.[0]);
                            e.target.value = '';
                        }}
                    />
                    <Hint label="Reemplazar imagen">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9 flex-none"
                            disabled={locked}
                            onClick={() => fileRef.current?.click()}
                            aria-label="Reemplazar imagen"
                        >
                            <ImageUp className="size-[15px]" />
                        </Button>
                    </Hint>
                </div>
            )}
        </div>
    );
}

/** Miniatura de cómo queda la galería en /nosotros. */
function WebStrip({ items, highlight, className }: { items: GalleryItem[]; highlight?: number; className?: string }) {
    return (
        <div className={cn('grid grid-cols-[1.25fr_1fr_1fr_1.25fr] items-end gap-1.5', className)}>
            {items.map((item, index) => (
                <motion.div
                    key={item.id}
                    layout
                    transition={SPRING}
                    className="relative overflow-hidden rounded-lg bg-muted"
                    style={{ aspectRatio: slotOf(index).ratio, borderRadius: 8 }}
                    animate={{ opacity: highlight === undefined || highlight === index ? 1 : 0.5 }}
                >
                    <motion.img
                        layout
                        transition={SPRING}
                        src={item.src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-[object-position] duration-300"
                        style={{ objectPosition: `${item.focus_x}% ${item.focus_y}%` }}
                    />
                    {highlight === index && (
                        <motion.span
                            layoutId="strip-ring"
                            transition={SPRING}
                            className="pointer-events-none absolute inset-0 rounded-[8px] ring-2 ring-orange-600 ring-inset"
                        />
                    )}
                </motion.div>
            ))}
        </div>
    );
}

function SaveBar({
    dirty,
    saving,
    progress,
    onSave,
    onDiscard,
}: {
    dirty: number;
    saving: boolean;
    progress: number | null;
    onSave: () => void;
    onDiscard: () => void;
}) {
    const label = saving
        ? progress !== null && progress < 100
            ? `Subiendo fotos… ${Math.round(progress)}%`
            : 'Guardando cambios…'
        : dirty
          ? `${dirty} ${dirty === 1 ? 'cambio' : 'cambios'} sin guardar`
          : 'Todo guardado';
    const active = dirty > 0 || saving;

    return (
        <motion.div
            initial={false}
            animate={{ y: 0, boxShadow: active ? '0 10px 30px -8px rgb(0 0 0 / .18)' : '0 4px 14px -6px rgb(0 0 0 / .08)' }}
            transition={FADE}
            className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2.5 overflow-hidden rounded-xl border bg-background/95 p-2.5 pl-3.5 backdrop-blur"
        >
            <span
                className={cn(
                    'flex min-w-[150px] flex-1 items-center gap-2 text-sm transition-colors duration-300',
                    active ? 'text-orange-600' : 'text-muted-foreground',
                )}
            >
                <span className="relative flex size-2 flex-none">
                    {active && <span className="absolute inset-0 animate-ping rounded-full bg-orange-500/60" />}
                    <span
                        className={cn(
                            'relative size-2 rounded-full transition-colors duration-300',
                            active ? 'bg-orange-600' : 'bg-muted-foreground/60',
                        )}
                    />
                </span>
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                        key={label}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={FADE}
                        className="tabular-nums"
                    >
                        {label}
                    </motion.span>
                </AnimatePresence>
            </span>
            <Button type="button" variant="outline" className="h-11 @lg:h-9" disabled={!dirty || saving} onClick={onDiscard}>
                Descartar
            </Button>
            <Button
                type="button"
                className="h-11 flex-1 gap-2 bg-orange-600 text-white hover:bg-orange-700 @lg:h-9 @lg:flex-none"
                disabled={!dirty || saving}
                onClick={onSave}
            >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? 'Guardando…' : 'Guardar galería'}
            </Button>
            {saving && progress !== null && (
                <motion.span
                    className="absolute bottom-0 left-0 h-0.5 bg-orange-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={FADE}
                />
            )}
        </motion.div>
    );
}

/* ─────────────────────────────── Editor de recorte ─────────────────────────────── */

interface CropEditorProps {
    open: boolean;
    draft: Draft | null;
    editing: number | null;
    items: GalleryItem[];
    onDraft: (patch: Partial<Draft>) => void;
    onReplace: (file: File | undefined) => void;
    onStep: (delta: number) => void;
    onApply: () => void;
    onClose: () => void;
}

function CropEditor({ open, draft, editing, items, onDraft, onReplace, onStep, onApply, onClose }: CropEditorProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const phone = useMediaQuery('(max-width: 639px)');

    // Vista previa con el borrador aplicado (incluido el cambio de posición)
    const preview = useMemo(() => {
        if (!draft || editing === null) return items;
        const { target, ...item } = draft;
        const next = items.map((it, i) => (i === editing ? item : it));
        return target !== editing ? swap(next, editing, target) : next;
    }, [draft, editing, items]);

    const sheet = phone
        ? {
              initial: { y: '100%' },
              animate: { y: 0 },
              exit: { y: '100%' },
              transition: { type: 'spring', stiffness: 320, damping: 36 } as Transition,
          }
        : {
              initial: { opacity: 0, scale: 0.96, x: '-50%', y: '-47%' },
              animate: { opacity: 1, scale: 1, x: '-50%', y: '-50%' },
              exit: { opacity: 0, scale: 0.97, x: '-50%', y: '-48%' },
              transition: { duration: 0.28, ease: EASE } as Transition,
          };

    const target = draft?.target ?? 0;
    const slot = slotOf(target);
    const altMissing = !!draft && !draft.alt.trim();

    return (
        <DialogPrimitive.Root open={open} onOpenChange={(value) => !value && onClose()}>
            <AnimatePresence>
                {open && draft && (
                    <DialogPrimitive.Portal forceMount>
                        <DialogPrimitive.Overlay asChild forceMount>
                            <motion.div
                                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={FADE}
                            />
                        </DialogPrimitive.Overlay>
                        <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                            <motion.div
                                {...sheet}
                                className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background shadow-2xl outline-none sm:inset-auto sm:top-1/2 sm:left-1/2 sm:max-h-[min(calc(100dvh-3rem),46rem)] sm:w-[min(calc(100vw-3rem),62rem)] sm:rounded-2xl sm:border"
                            >
                                {/* Encabezado */}
                                <div className="flex flex-none items-center gap-2 border-b px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:py-3.5 sm:pl-6">
                                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                                        <DialogPrimitive.Title className="text-[17px] font-semibold">Editar imagen</DialogPrimitive.Title>
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span
                                                key={`${target}`}
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                transition={FADE}
                                                className="text-[13px] text-muted-foreground"
                                            >
                                                Foto {target + 1} de {items.length} · {slot.kind} {slot.label}
                                            </motion.span>
                                        </AnimatePresence>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-10"
                                        disabled={target === 0}
                                        onClick={() => onStep(-1)}
                                        aria-label="Foto anterior"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        className="size-10"
                                        disabled={target === items.length - 1}
                                        onClick={() => onStep(1)}
                                        aria-label="Foto siguiente"
                                    >
                                        <ChevronRight className="size-4" />
                                    </Button>
                                    <DialogPrimitive.Close asChild>
                                        <Button type="button" variant="secondary" size="icon" className="size-10" aria-label="Cerrar">
                                            <X className="size-[18px]" />
                                        </Button>
                                    </DialogPrimitive.Close>
                                </div>

                                {/* Contenido */}
                                <div className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto p-4 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-6 md:p-6">
                                    <div className="flex min-w-0 flex-col gap-2.5">
                                        <span className="text-[13px] text-muted-foreground">
                                            Arrastra el marco: lo que queda dentro es lo que se ve en la web.
                                        </span>
                                        <CropArea
                                            key={draft.src}
                                            src={draft.src}
                                            aspect={slot.aspect}
                                            fx={draft.focus_x}
                                            fy={draft.focus_y}
                                            onChange={(focus_x, focus_y) => onDraft({ focus_x, focus_y })}
                                        />
                                        <div className="flex flex-wrap items-center gap-2">
                                            <input
                                                ref={fileRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                className="hidden"
                                                onChange={(e) => {
                                                    onReplace(e.target.files?.[0]);
                                                    e.target.value = '';
                                                }}
                                            />
                                            <Button type="button" variant="outline" className="h-10 gap-2" onClick={() => fileRef.current?.click()}>
                                                <ImageUp className="size-4" />
                                                Reemplazar imagen
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="h-10 gap-2"
                                                onClick={() => onDraft({ focus_x: 50, focus_y: 50 })}
                                            >
                                                <Focus className="size-4" />
                                                Centrar
                                            </Button>
                                            <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                                                Encuadre {draft.focus_x}% · {draft.focus_y}%
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex min-w-0 flex-col gap-5">
                                        <div className="grid gap-2">
                                            <span className="text-[13px] font-medium">Vista en /nosotros</span>
                                            <WebStrip items={preview} highlight={target} className="rounded-xl border bg-muted/40 p-2" />
                                        </div>

                                        <div className="grid gap-2">
                                            <span className="text-[13px] font-medium">Posición</span>
                                            <div
                                                className="grid grid-cols-4 gap-1 rounded-[10px] bg-muted p-[3px]"
                                                role="radiogroup"
                                                aria-label="Posición en la web"
                                            >
                                                {SLOTS.map((s, i) => {
                                                    const on = i === target;
                                                    return (
                                                        <button
                                                            key={i}
                                                            type="button"
                                                            role="radio"
                                                            aria-checked={on}
                                                            aria-label={`Posición ${i + 1} (${s.kind} ${s.label})`}
                                                            onClick={() => onDraft({ target: i })}
                                                            className={cn(
                                                                'relative flex h-11 flex-col items-center justify-center rounded-[7px] text-sm leading-tight transition-colors duration-200',
                                                                on
                                                                    ? 'font-bold text-orange-600'
                                                                    : 'font-medium text-foreground/70 hover:text-foreground',
                                                            )}
                                                        >
                                                            {on && (
                                                                <motion.span
                                                                    layoutId="position-pill"
                                                                    transition={SPRING}
                                                                    className="absolute inset-0 rounded-[7px] bg-background shadow-sm"
                                                                />
                                                            )}
                                                            <span className="relative">{i + 1}</span>
                                                            <span className="relative text-[10px] font-medium text-muted-foreground">{s.label}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <label className="grid gap-1.5">
                                            <span className="text-[13px] font-medium">Texto alternativo</span>
                                            <Input
                                                value={draft.alt}
                                                maxLength={150}
                                                aria-invalid={altMissing}
                                                onChange={(e) => onDraft({ alt: e.target.value })}
                                                className="h-10 focus-visible:border-orange-600 focus-visible:ring-orange-600/20"
                                            />
                                            <span
                                                className={cn(
                                                    'flex justify-between gap-2 text-xs',
                                                    altMissing ? 'text-red-600' : 'text-muted-foreground',
                                                )}
                                            >
                                                {altMissing
                                                    ? 'El texto alternativo es obligatorio.'
                                                    : 'Describe la foto para lectores de pantalla y buscadores.'}
                                                <span className="tabular-nums">{draft.alt.length}/150</span>
                                            </span>
                                        </label>

                                        {draft.file ? (
                                            <span className="text-xs text-red-600">Foto nueva: se subirá al guardar la galería.</span>
                                        ) : (
                                            draft.editor && <span className="text-xs text-muted-foreground">Editado por {draft.editor}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Pie */}
                                <div className="flex flex-none justify-end gap-2.5 border-t px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] md:px-6">
                                    <DialogPrimitive.Close asChild>
                                        <Button type="button" variant="outline" className="h-11 sm:h-10">
                                            Cancelar
                                        </Button>
                                    </DialogPrimitive.Close>
                                    <Button
                                        type="button"
                                        className="h-11 flex-1 bg-orange-600 font-semibold text-white hover:bg-orange-700 sm:h-10 sm:flex-none"
                                        disabled={altMissing}
                                        onClick={onApply}
                                    >
                                        Aplicar cambios
                                    </Button>
                                </div>
                            </motion.div>
                        </DialogPrimitive.Content>
                    </DialogPrimitive.Portal>
                )}
            </AnimatePresence>
        </DialogPrimitive.Root>
    );
}

interface CropAreaProps {
    src: string;
    /** Proporción (ancho / alto) del espacio en la web. */
    aspect: number;
    fx: number;
    fy: number;
    onChange: (fx: number, fy: number) => void;
}

/**
 * Foto completa con un marco del tamaño del espacio. El marco reproduce `object-position`:
 * su desplazamiento libre (1 - tamaño) multiplicado por el porcentaje de encuadre.
 */
function CropArea({ src, aspect, fx, fy, onChange }: CropAreaProps) {
    const boxRef = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; y: number; fx: number; fy: number } | null>(null);
    const [box, setBox] = useState({ w: 0, h: 0 });
    const [ratio, setRatio] = useState<number | null>(null);
    const [dragging, setDragging] = useState(false);

    useLayoutEffect(() => {
        const el = boxRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const a = ratio ?? aspect;
    const W = Math.max(box.w - 32, 0);
    const H = Math.max(box.h - 32, 0);
    const imgW = a > W / (H || 1) ? W : H * a;
    const imgH = a > W / (H || 1) ? W / a : H;

    // Tamaño del marco relativo a la foto
    const fw = a > aspect ? aspect / a : 1;
    const fh = a > aspect ? 1 : a / aspect;
    const left = (1 - fw) * (fx / 100);
    const top = (1 - fh) * (fy / 100);

    const toFocus = (px: number, py: number) =>
        [fw < 1 ? clamp(((px - fw / 2) / (1 - fw)) * 100) : fx, fh < 1 ? clamp(((py - fh / 2) / (1 - fh)) * 100) : fy] as const;

    const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        let start = [fx, fy] as const;
        // Fuera del marco: el marco salta a ese punto y luego se arrastra
        if (px < left || px > left + fw || py < top || py > top + fh) {
            start = toFocus(px, py);
            onChange(...start);
        }
        drag.current = { x: e.clientX, y: e.clientY, fx: start[0], fy: start[1] };
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
    };

    const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
        const d = drag.current;
        if (!d) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const dx = (e.clientX - d.x) / rect.width;
        const dy = (e.clientY - d.y) / rect.height;
        onChange(fw < 1 ? clamp(d.fx + (dx / (1 - fw)) * 100) : fx, fh < 1 ? clamp(d.fy + (dy / (1 - fh)) * 100) : fy);
    };

    const endDrag = () => {
        drag.current = null;
        setDragging(false);
    };

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        const delta = e.shiftKey ? 10 : 2;
        const moves: Record<string, [number, number]> = {
            ArrowLeft: [-delta, 0],
            ArrowRight: [delta, 0],
            ArrowUp: [0, -delta],
            ArrowDown: [0, delta],
        };
        const m = moves[e.key];
        if (!m) return;
        e.preventDefault();
        onChange(clamp(fx + m[0]), clamp(fy + m[1]));
    };

    const frameTransition = dragging
        ? 'none'
        : 'left .35s cubic-bezier(.22,1,.36,1), top .35s cubic-bezier(.22,1,.36,1), width .35s cubic-bezier(.22,1,.36,1), height .35s cubic-bezier(.22,1,.36,1)';

    return (
        <div
            ref={boxRef}
            className="flex h-[min(56vh,300px)] w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-900 sm:h-[380px] lg:h-[420px]"
        >
            <motion.div
                role="application"
                tabIndex={0}
                aria-label="Encuadre de la foto: arrastra o usa las flechas del teclado"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onKeyDown={onKeyDown}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: ratio ? 1 : 0, scale: ratio ? 1 : 0.98 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cn(
                    'relative touch-none overflow-hidden rounded-[3px] select-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 focus-visible:outline-none',
                    dragging ? 'cursor-grabbing' : 'cursor-grab',
                )}
                style={{ width: imgW, height: imgH }}
            >
                <img
                    src={src}
                    alt=""
                    draggable={false}
                    onLoad={(e) => {
                        const img = e.currentTarget;
                        if (img.naturalWidth) setRatio(img.naturalWidth / img.naturalHeight);
                    }}
                    className="pointer-events-none absolute inset-0 h-full w-full"
                />
                <span
                    className="pointer-events-none absolute rounded-[4px] border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/.58)]"
                    style={{
                        left: `${left * 100}%`,
                        top: `${top * 100}%`,
                        width: `${fw * 100}%`,
                        height: `${fh * 100}%`,
                        transition: frameTransition,
                    }}
                >
                    {/* Tercios: más visibles mientras se arrastra */}
                    <span className={cn('absolute inset-0 transition-opacity duration-300', dragging ? 'opacity-100' : 'opacity-50')}>
                        <span className="absolute inset-y-0 left-1/3 w-px bg-white/50" />
                        <span className="absolute inset-y-0 left-2/3 w-px bg-white/50" />
                        <span className="absolute inset-x-0 top-1/3 h-px bg-white/50" />
                        <span className="absolute inset-x-0 top-2/3 h-px bg-white/50" />
                    </span>
                    <span
                        className={cn(
                            'absolute top-1/2 left-1/2 flex size-[34px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-orange-600/90 text-white shadow-lg transition-transform duration-300 ease-out',
                            dragging && 'scale-90',
                        )}
                    >
                        <Move className="size-[18px]" />
                    </span>
                </span>
            </motion.div>
        </div>
    );
}
