import { useEffect, useLayoutEffect, useRef, useState, type FormEventHandler, type PointerEvent as ReactPointerEvent } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { type Page } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    Crosshair,
    ExternalLink,
    FileText,
    GripVertical,
    History,
    ImageIcon,
    ImageUp,
    Loader2,
    RotateCcw,
    Save,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Field } from '@/components/admin/form-shell';

interface Editor {
    id: number;
    name: string;
}

interface AboutPageData {
    title: string;
    title_highlight: string | null;
    intro: string;
    mission_title: string;
    mission: string;
    vision_title: string;
    vision: string;
    updated_at: string | null;
    editor: Editor | null;
}

interface AboutImage {
    id: number;
    position: number;
    image: string;
    image_url: string;
    alt: string;
    focus_x: number;
    focus_y: number;
    updated_at: string | null;
    editor: Editor | null;
}

interface AboutLog {
    id: number;
    user_name: string | null;
    action: string;
    field: string | null;
    old_value: { v: unknown } | null;
    new_value: { v: unknown } | null;
    ip: string | null;
    created_at: string;
}

interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
}

interface Props {
    page: AboutPageData;
    images: AboutImage[];
    logs: Paginated<AboutLog>;
    actions: Record<string, string>;
    fields: Record<string, string>;
    filters: { action: string };
    tab: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Nosotros', href: route('admin.about.index') },
];

/** Formato de cada posición en la web: 1 y 4 anchas, 2 y 3 angostas (igual que AboutPage). */
const SLOT_RATIO: Record<number, string> = { 1: '4 / 5', 2: '3 / 5', 3: '3 / 5', 4: '4 / 5' };

const ACTION_STYLE: Record<string, string> = {
    text_updated: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    image_replaced: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    image_focus: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    image_alt: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    image_moved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const formatDate = (value: string | null) =>
    value ? new Date(value).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

const assetUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `/${path.replace(/^\/+/, '')}`);

/** Muestra el mensaje flash que devuelve el servidor tras cada guardado. */
const flash = (page: Page) => {
    const messages = (page.props as { flash?: { success?: string; error?: string } }).flash;
    if (messages?.success) toast.success(messages.success);
    if (messages?.error) toast.error(messages.error);
};

export default function AboutIndex({ page, images, logs, actions, fields, filters, tab: initialTab }: Props) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('edit_about');
    const [tab, setTab] = useState(['texts', 'gallery', 'history'].includes(initialTab) ? initialTab : 'texts');

    const changeTab = (value: string) => {
        setTab(value);
        // La pestaña queda en la URL para volver a ella al recargar o compartir el enlace
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        window.history.replaceState(window.history.state, '', url);
    };

    if (!hasPermission('view_about')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Nosotros" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid gap-1">
                            <CardTitle className="text-xl font-medium">Página Nosotros</CardTitle>
                            <CardDescription>
                                Edita los textos, la galería de imágenes y revisa el historial de cambios.
                                {page.updated_at && (
                                    <span className="block pt-1 text-xs">
                                        Última edición de textos: {formatDate(page.updated_at)}
                                        {page.editor && <> · {page.editor.name}</>}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                            <a href="/nosotros" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver página
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!canEdit && (
                            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                Solo lectura: tu rol no tiene el permiso <code>edit_about</code>.
                            </p>
                        )}
                        <Tabs value={tab} onValueChange={changeTab} className="gap-4">
                            <TabsList className="grid h-auto w-full grid-cols-3 sm:inline-flex sm:w-auto">
                                <TabsTrigger value="texts" className="gap-1.5 px-2 sm:px-4">
                                    <FileText className="h-4 w-4" />
                                    Textos
                                </TabsTrigger>
                                <TabsTrigger value="gallery" className="gap-1.5 px-2 sm:px-4">
                                    <ImageIcon className="h-4 w-4" />
                                    Galería
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-1.5 px-2 sm:px-4">
                                    <History className="h-4 w-4" />
                                    Historial
                                    {logs.total > 0 && (
                                        <Badge variant="secondary" className="ml-1 hidden px-1.5 py-0 text-[11px] sm:inline-flex">
                                            {logs.total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="texts" className="mt-2">
                                <TextsForm page={page} canEdit={canEdit} />
                            </TabsContent>
                            <TabsContent value="gallery" className="mt-2">
                                <Gallery images={images} canEdit={canEdit} />
                            </TabsContent>
                            <TabsContent value="history" className="mt-2">
                                <HistoryList logs={logs} actions={actions} fields={fields} filters={filters} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

/* ─────────────────────────────── Textos ─────────────────────────────── */

function TextsForm({ page, canEdit }: { page: AboutPageData; canEdit: boolean }) {
    const { data, setData, put, processing, errors, isDirty, reset } = useForm({
        title: page.title ?? '',
        title_highlight: page.title_highlight ?? '',
        intro: page.intro ?? '',
        mission_title: page.mission_title ?? 'Misión',
        mission: page.mission ?? '',
        vision_title: page.vision_title ?? 'Visión',
        vision: page.vision ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.about.texts'), {
            preserveScroll: true,
            onSuccess: (page) => {
                flash(page);
                // Los valores guardados pasan a ser la nueva base (isDirty vuelve a false)
                reset();
            },
            onError: () => toast.error('Por favor corrige los errores en el formulario'),
        });
    };

    const counter = (value: string, max: number) => (
        <span className={`text-xs ${value.length > max ? 'text-red-500' : 'text-muted-foreground'}`}>
            {value.length}/{max}
        </span>
    );

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
            <fieldset disabled={!canEdit || processing} className="grid min-w-0 gap-6">
                <section className="grid gap-4 rounded-xl border p-4 sm:p-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Encabezado</h3>
                    <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
                        <Field label="Título" htmlFor="title" error={errors.title}>
                            <Input id="title" value={data.title} maxLength={120} onChange={(e) => setData('title', e.target.value)} />
                        </Field>
                        <Field label="Palabra destacada (naranja)" htmlFor="title_highlight" error={errors.title_highlight}>
                            <Input
                                id="title_highlight"
                                value={data.title_highlight}
                                maxLength={60}
                                placeholder="Opcional"
                                onChange={(e) => setData('title_highlight', e.target.value)}
                            />
                        </Field>
                    </div>
                    <Field label="Descripción" htmlFor="intro" error={errors.intro}>
                        <Textarea id="intro" rows={5} value={data.intro} onChange={(e) => setData('intro', e.target.value)} />
                        <div className="text-right">{counter(data.intro, 1500)}</div>
                    </Field>
                </section>

                <div className="grid gap-6 xl:grid-cols-2">
                    <section className="grid content-start gap-4 rounded-xl border border-orange-200 bg-orange-50/40 p-4 sm:p-5 dark:border-orange-900/60 dark:bg-orange-950/20">
                        <Field label="Título de misión" htmlFor="mission_title" error={errors.mission_title}>
                            <Input id="mission_title" value={data.mission_title} maxLength={60} onChange={(e) => setData('mission_title', e.target.value)} />
                        </Field>
                        <Field label="Misión" htmlFor="mission" error={errors.mission}>
                            <Textarea id="mission" rows={6} value={data.mission} onChange={(e) => setData('mission', e.target.value)} />
                            <div className="text-right">{counter(data.mission, 1500)}</div>
                        </Field>
                    </section>
                    <section className="grid content-start gap-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5 dark:border-blue-900/60 dark:bg-blue-950/20">
                        <Field label="Título de visión" htmlFor="vision_title" error={errors.vision_title}>
                            <Input id="vision_title" value={data.vision_title} maxLength={60} onChange={(e) => setData('vision_title', e.target.value)} />
                        </Field>
                        <Field label="Visión" htmlFor="vision" error={errors.vision}>
                            <Textarea id="vision" rows={6} value={data.vision} onChange={(e) => setData('vision', e.target.value)} />
                            <div className="text-right">{counter(data.vision, 1500)}</div>
                        </Field>
                    </section>
                </div>

                {canEdit && (
                    <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                        <Button type="submit" disabled={processing || !isDirty}>
                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Guardar textos
                        </Button>
                        <Button type="button" variant="outline" disabled={processing || !isDirty} onClick={() => reset()}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Descartar
                        </Button>
                        {isDirty && <span className="text-sm text-orange-600">Hay cambios sin guardar</span>}
                    </div>
                )}
            </fieldset>

            {/* Vista previa con la misma estética de la web */}
            <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa</p>
                <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#fff4ec] via-white to-[#eef3ff] p-5 text-center text-[#191c1f]">
                    <h2 className="text-[28px] font-bold leading-none tracking-[-.04em] [text-wrap:balance]">
                        {data.title || 'Título'} {data.title_highlight && <span className="text-[#fa8232]">{data.title_highlight}</span>}
                    </h2>
                    <p className="mt-3 line-clamp-6 text-[13px] leading-relaxed text-[#3d4247]">{data.intro}</p>
                </div>
                <div className="mt-3 grid grid-cols-1 overflow-hidden rounded-2xl text-[#191c1f] sm:grid-cols-2 lg:grid-cols-1">
                    <div className="bg-[#fff4ec] p-4">
                        <p className="text-lg font-bold tracking-[-.02em]">{data.mission_title}</p>
                        <p className="mt-1 line-clamp-5 text-[12px] leading-relaxed text-[#3d4247]">{data.mission}</p>
                    </div>
                    <div className="bg-[#eef3ff] p-4">
                        <p className="text-lg font-bold tracking-[-.02em]">{data.vision_title}</p>
                        <p className="mt-1 line-clamp-5 text-[12px] leading-relaxed text-[#3d4247]">{data.vision}</p>
                    </div>
                </div>
            </aside>
        </form>
    );
}

/* ─────────────────────────────── Galería ─────────────────────────────── */

interface GalleryItem {
    id: number;
    image_url: string;
    focus_x: number;
    focus_y: number;
    editor: Editor | null;
    updated_at: string | null;
    /** Foto nueva elegida pero todavía sin guardar */
    file?: File;
    preview?: string;
}

const toItems = (images: AboutImage[]): GalleryItem[] =>
    images.map(({ id, image_url, focus_x, focus_y, editor, updated_at }) => ({ id, image_url, focus_x, focus_y, editor, updated_at }));

/** Escritorio (≥1024px): cuadrícula de 4 con arrastrar y soltar. Móvil/tablet: lista vertical con flechas. */
function useIsDesktop() {
    const [desktop, setDesktop] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
    useEffect(() => {
        const query = window.matchMedia('(min-width: 1024px)');
        const update = () => setDesktop(query.matches);
        query.addEventListener('change', update);
        return () => query.removeEventListener('change', update);
    }, []);
    return desktop;
}

interface DragState {
    id: number;
    dx: number;
    dy: number;
    overId: number | null;
}

function Gallery({ images, canEdit }: { images: AboutImage[]; canEdit: boolean }) {
    const desktop = useIsDesktop();
    const [items, setItems] = useState<GalleryItem[]>(() => toItems(images));
    const [saving, setSaving] = useState(false);
    const [drag, setDrag] = useState<DragState | null>(null);

    const cards = useRef(new Map<number, HTMLElement>());
    const startRects = useRef(new Map<number, DOMRect>());
    const dragOrigin = useRef({ x: 0, y: 0 });
    const flipFrom = useRef<Map<number, DOMRect> | null>(null);

    // Tras guardar, el servidor devuelve el estado real: se vuelve a partir de él
    useEffect(() => {
        setItems((prev) => {
            prev.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
            return toItems(images);
        });
    }, [images]);

    const dirty =
        items.some((item, i) => item.id !== images[i]?.id || item.file || item.focus_x !== images[i]?.focus_x || item.focus_y !== images[i]?.focus_y) &&
        items.length > 0;

    const measure = () => {
        const rects = new Map<number, DOMRect>();
        cards.current.forEach((el, id) => rects.set(id, el.getBoundingClientRect()));
        return rects;
    };

    /** Cambia el orden animando cada tarjeta desde donde estaba hasta su nuevo lugar (FLIP). */
    const commitOrder = (next: GalleryItem[]) => {
        flipFrom.current = measure();
        setItems(next);
    };

    useLayoutEffect(() => {
        const from = flipFrom.current;
        flipFrom.current = null;
        if (!from) return;
        cards.current.forEach((el, id) => {
            const first = from.get(id);
            if (!first) return;
            const last = el.getBoundingClientRect();
            const dx = first.left - last.left;
            const dy = first.top - last.top;
            const sx = first.width / last.width;
            const sy = first.height / last.height;
            if (!dx && !dy && sx === 1 && sy === 1) return;
            el.animate(
                [
                    { transformOrigin: 'top left', transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
                    { transformOrigin: 'top left', transform: 'none' },
                ],
                { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' },
            );
        });
    }, [items, drag]);

    const swap = (a: number, b: number) => {
        const next = [...items];
        [next[a], next[b]] = [next[b], next[a]];
        commitOrder(next);
    };

    const moveBy = (index: number, delta: number) => {
        const target = index + delta;
        if (target >= 0 && target < items.length) swap(index, target);
    };

    const startDrag = (e: ReactPointerEvent<HTMLElement>, id: number) => {
        if (!canEdit || saving) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        startRects.current = measure();
        dragOrigin.current = { x: e.clientX, y: e.clientY };
        setDrag({ id, dx: 0, dy: 0, overId: null });
    };

    const moveDrag = (e: ReactPointerEvent<HTMLElement>) => {
        if (!drag) return;
        let overId: number | null = null;
        startRects.current.forEach((rect, id) => {
            if (id !== drag.id && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) overId = id;
        });
        setDrag({ id: drag.id, dx: e.clientX - dragOrigin.current.x, dy: e.clientY - dragOrigin.current.y, overId });
    };

    const endDrag = () => {
        if (!drag) return;
        const from = items.findIndex((item) => item.id === drag.id);
        const to = items.findIndex((item) => item.id === drag.overId);
        if (to >= 0 && from !== to) {
            swap(from, to);
        } else {
            // Sin destino: la tarjeta vuelve suavemente a su lugar
            flipFrom.current = measure();
        }
        setDrag(null);
    };

    const patchItem = (id: number, patch: Partial<GalleryItem>) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));

    const pickFile = (id: number, file: File) => {
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return toast.error('Formato no permitido: usa JPG, PNG o WebP');
        if (file.size > 8 * 1024 * 1024) return toast.error('La imagen no debe superar los 8MB');
        const current = items.find((item) => item.id === id);
        if (current?.preview) URL.revokeObjectURL(current.preview);
        patchItem(id, { file, preview: URL.createObjectURL(file), focus_x: 50, focus_y: 50 });
    };

    const discard = () => {
        items.forEach((item) => item.preview && URL.revokeObjectURL(item.preview));
        setItems(toItems(images));
    };

    const save = () => {
        setSaving(true);
        router.post(
            route('admin.about.gallery'),
            { images: items.map(({ id, focus_x, focus_y, file }) => ({ id, focus_x, focus_y, ...(file ? { image: file } : {}) })) },
            {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: flash,
                onError: (errs) => toast.error(Object.values(errs)[0] ?? 'No se pudo guardar la galería'),
                onFinish: () => setSaving(false),
            },
        );
    };

    return (
        <div className="grid gap-4">
            <p className="text-sm text-muted-foreground">
                {desktop
                    ? 'Arrastra una tarjeta desde el asa y suéltala sobre otra para intercambiar sus posiciones. Las posiciones 1 y 4 son anchas, la 2 y 3 angostas.'
                    : 'Usa las flechas para subir o bajar cada foto. Las posiciones 1 y 4 son anchas, la 2 y 3 angostas.'}
                {canEdit && ' Toca o arrastra sobre una foto para elegir el punto que queda centrado.'}
            </p>

            <div className={desktop ? 'grid grid-cols-[1.25fr_1fr_1fr_1.25fr] items-start gap-4' : 'mx-auto grid w-full max-w-md gap-4'}>
                {items.map((item, index) => (
                    <ImageCard
                        key={item.id}
                        item={item}
                        index={index}
                        total={items.length}
                        canEdit={canEdit}
                        saving={saving}
                        desktop={desktop}
                        drag={drag}
                        registerEl={(el) => (el ? cards.current.set(item.id, el) : cards.current.delete(item.id))}
                        onHandleDown={(e) => startDrag(e, item.id)}
                        onHandleMove={moveDrag}
                        onHandleUp={endDrag}
                        onMove={(delta) => moveBy(index, delta)}
                        onFocus={(x, y) => patchItem(item.id, { focus_x: x, focus_y: y })}
                        onFile={(file) => pickFile(item.id, file)}
                    />
                ))}
            </div>

            {canEdit && (
                <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                    <Button type="button" disabled={saving || !dirty} onClick={save} className="flex-1 sm:flex-none">
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar galería
                    </Button>
                    <Button type="button" variant="outline" disabled={saving || !dirty} onClick={discard}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Descartar
                    </Button>
                    {dirty && <span className="text-sm text-orange-600">Hay cambios sin guardar</span>}
                </div>
            )}
        </div>
    );
}

interface ImageCardProps {
    item: GalleryItem;
    index: number;
    total: number;
    canEdit: boolean;
    saving: boolean;
    desktop: boolean;
    drag: DragState | null;
    registerEl: (el: HTMLElement | null) => void;
    onHandleDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onHandleMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onHandleUp: () => void;
    onMove: (delta: number) => void;
    onFocus: (x: number, y: number) => void;
    onFile: (file: File) => void;
}

function ImageCard({ item, index, total, canEdit, saving, desktop, drag, registerEl, onHandleDown, onHandleMove, onHandleUp, onMove, onFocus, onFile }: ImageCardProps) {
    const fileRef = useRef<HTMLInputElement>(null);
    const picking = useRef(false);
    // En móvil el encuadre se activa a propósito para no bloquear el scroll al tocar la foto
    const [adjusting, setAdjusting] = useState(false);

    const position = index + 1;
    const wide = position === 1 || position === 4;
    const isDragged = drag?.id === item.id;
    const isTarget = !!drag && drag.overId === item.id;
    const focusActive = canEdit && !saving && !drag && (desktop || adjusting);

    const setFocusFromPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clamp = (n: number) => Math.round(Math.min(100, Math.max(0, n)));
        onFocus(clamp(((e.clientX - rect.left) / rect.width) * 100), clamp(((e.clientY - rect.top) / rect.height) * 100));
    };

    return (
        <div
            ref={registerEl}
            className={`flex min-w-0 flex-col gap-3 rounded-2xl border bg-card p-2.5 shadow-sm transition-shadow ${isTarget ? 'ring-2 ring-[#fa8232] ring-offset-2 ring-offset-background' : ''} ${isDragged ? 'relative z-50 shadow-2xl' : ''}`}
            style={isDragged ? { transform: `translate(${drag.dx}px, ${drag.dy}px) scale(1.03)`, willChange: 'transform' } : undefined}
        >
            <div className="flex items-center justify-between gap-2 px-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#fa8232] text-xs text-white">{position}</span>
                    <span className="text-muted-foreground">{wide ? 'Ancha' : 'Angosta'}</span>
                </span>
                {canEdit &&
                    (desktop ? (
                        <div
                            role="button"
                            aria-label="Arrastrar para cambiar de posición"
                            title="Arrastrar para cambiar de posición"
                            className={`flex size-8 touch-none select-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted ${saving ? 'opacity-40' : isDragged ? 'cursor-grabbing' : 'cursor-grab'}`}
                            onPointerDown={onHandleDown}
                            onPointerMove={onHandleMove}
                            onPointerUp={onHandleUp}
                            onPointerCancel={onHandleUp}
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                    ) : (
                        <div className="flex gap-1">
                            <Button type="button" size="icon" variant="outline" className="size-9" disabled={saving || index === 0} onClick={() => onMove(-1)} aria-label="Subir">
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="outline" className="size-9" disabled={saving || index === total - 1} onClick={() => onMove(1)} aria-label="Bajar">
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
            </div>

            <div
                className={`relative w-full select-none overflow-hidden rounded-[18px] bg-muted ${focusActive ? 'touch-none cursor-crosshair' : ''} ${!desktop ? 'mx-auto max-w-[17rem]' : ''}`}
                style={{ aspectRatio: SLOT_RATIO[position] ?? '4 / 5' }}
                onPointerDown={(e) => {
                    if (!focusActive) return;
                    picking.current = true;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setFocusFromPointer(e);
                }}
                onPointerMove={(e) => picking.current && focusActive && setFocusFromPointer(e)}
                onPointerUp={() => (picking.current = false)}
                onPointerCancel={() => (picking.current = false)}
            >
                <img
                    src={item.preview ?? item.image_url}
                    alt=""
                    draggable={false}
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                    style={{ objectPosition: `${item.focus_x}% ${item.focus_y}%` }}
                />
                {canEdit && (desktop || adjusting) && (
                    <span
                        className="pointer-events-none absolute flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-[#fa8232]/80 text-white shadow-md"
                        style={{ left: `${item.focus_x}%`, top: `${item.focus_y}%` }}
                    >
                        <Crosshair className="h-4 w-4" />
                    </span>
                )}
                {item.file && <span className="absolute left-2 top-2 rounded-full bg-[#fa8232] px-2 py-0.5 text-[11px] font-medium text-white">Nueva</span>}
                {saving && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </span>
                )}
            </div>

            <p className="px-1 text-xs text-muted-foreground">
                Encuadre: {item.focus_x}% · {item.focus_y}%
                {item.editor && (
                    <span className="block truncate">
                        Editado por {item.editor.name} · {formatDate(item.updated_at)}
                    </span>
                )}
            </p>

            {canEdit && (
                <div className={`mt-auto grid gap-2 ${desktop ? '' : 'grid-cols-2'}`}>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onFile(file);
                            e.target.value = '';
                        }}
                    />
                    {!desktop && (
                        <Button type="button" size="sm" variant={adjusting ? 'default' : 'outline'} disabled={saving} onClick={() => setAdjusting((v) => !v)}>
                            <Crosshair className="mr-1.5 h-4 w-4" />
                            {adjusting ? 'Listo' : 'Encuadre'}
                        </Button>
                    )}
                    <Button type="button" variant="outline" size="sm" disabled={saving} onClick={() => fileRef.current?.click()}>
                        <ImageUp className="mr-1.5 h-4 w-4" />
                        Cambiar imagen
                    </Button>
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────── Historial ─────────────────────────────── */

function HistoryList({ logs, actions, fields, filters }: Pick<Props, 'logs' | 'actions' | 'fields' | 'filters'>) {
    const visit = (params: Record<string, string | number>) =>
        router.get(route('admin.about.index'), { tab: 'history', action: filters.action || undefined, ...params }, { preserveScroll: true, preserveState: true, only: ['logs', 'filters'] });

    const fieldLabel = (field: string | null) => {
        if (!field) return 'Galería';
        const slot = field.match(/^position_(\d)$/);
        return slot ? `Imagen ${slot[1]}` : (fields[field] ?? field);
    };

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                    {logs.total} {logs.total === 1 ? 'cambio registrado' : 'cambios registrados'}
                </p>
                <Select value={filters.action || 'all'} onValueChange={(value) => visit({ action: value === 'all' ? '' : value, page: 1 })}>
                    <SelectTrigger className="w-full sm:w-60">
                        <SelectValue placeholder="Todas las acciones" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las acciones</SelectItem>
                        {Object.entries(actions).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {logs.data.length === 0 ? (
                <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
                    <History className="h-8 w-8" />
                    <p className="text-sm">Todavía no hay cambios registrados.</p>
                </div>
            ) : (
                <ol className="grid gap-3">
                    {logs.data.map((log) => (
                        <li key={log.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[200px_minmax(0,1fr)] sm:p-4">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-col sm:items-start">
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_STYLE[log.action] ?? 'bg-muted'}`}>
                                    {actions[log.action] ?? log.action}
                                </span>
                                <span className="text-sm font-medium">{fieldLabel(log.field)}</span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(log.created_at)}
                                    <span className="block">
                                        {log.user_name ?? 'Sistema'}
                                        {log.ip && <> · {log.ip}</>}
                                    </span>
                                </span>
                            </div>
                            <ChangeDetail log={log} />
                        </li>
                    ))}
                </ol>
            )}

            {logs.last_page > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" disabled={logs.current_page <= 1} onClick={() => visit({ page: logs.current_page - 1 })}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {logs.current_page} de {logs.last_page}
                    </span>
                    <Button variant="outline" size="sm" disabled={logs.current_page >= logs.last_page} onClick={() => visit({ page: logs.current_page + 1 })}>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

function ChangeDetail({ log }: { log: AboutLog }) {
    const before = log.old_value?.v;
    const after = log.new_value?.v;

    if (log.action === 'image_replaced') {
        return (
            <div className="flex items-center gap-3">
                <Thumb path={before as string} label="Antes" />
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <Thumb path={after as string} label="Después" />
            </div>
        );
    }

    if (log.action === 'image_moved' && Array.isArray(before) && Array.isArray(after)) {
        return (
            <div className="grid gap-2">
                {[
                    ['Antes', before],
                    ['Después', after],
                ].map(([label, list]) => (
                    <div key={label as string} className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-xs text-muted-foreground">{label as string}</span>
                        <div className="flex gap-1.5">
                            {(list as string[]).map((path, i) => (
                                <img key={i} src={assetUrl(path)} alt="" className="size-10 rounded-md object-cover sm:size-12" loading="lazy" />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid min-w-0 gap-2 text-sm">
            <p className="min-w-0 break-words rounded-lg bg-red-50 px-3 py-2 text-red-900 line-through decoration-red-300 dark:bg-red-950/40 dark:text-red-200">
                {String(before ?? '') || <em className="no-underline">vacío</em>}
            </p>
            <p className="min-w-0 break-words rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                {String(after ?? '') || <em>vacío</em>}
            </p>
        </div>
    );
}

function Thumb({ path, label }: { path?: string; label: string }) {
    return (
        <figure className="grid gap-1">
            {path ? (
                <a href={assetUrl(path)} target="_blank" rel="noopener noreferrer">
                    <img src={assetUrl(path)} alt={label} className="h-20 w-16 rounded-lg object-cover sm:h-24 sm:w-20" loading="lazy" />
                </a>
            ) : (
                <span className="flex h-20 w-16 items-center justify-center rounded-lg bg-muted sm:h-24 sm:w-20">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </span>
            )}
            <figcaption className="text-center text-xs text-muted-foreground">{label}</figcaption>
        </figure>
    );
}
