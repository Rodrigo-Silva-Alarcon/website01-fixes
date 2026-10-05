import { useEffect, useRef, useState, type FormEventHandler } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { type Page } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent, type Modifier } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
    ArrowDown,
    ArrowUp,
    Award,
    ExternalLink,
    Eye,
    EyeOff,
    GalleryHorizontal,
    GripVertical,
    ImageOff,
    ImagePlus,
    LayoutGrid,
    Loader2,
    Lock,
    MapPin,
    Pencil,
    Plus,
    Search,
    ShoppingBag,
    Sparkles,
    Trash2,
    X,
    type LucideIcon,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Field } from '@/components/admin/form-shell';

type SectionType = 'hero' | 'features' | 'categories' | 'products' | 'promo' | 'brands' | 'showroom';

interface PickerProduct {
    id: number;
    name: string;
    active: boolean;
    image: string | null;
    category: string | null;
    brand: string | null;
}

interface Settings {
    source?: string;
    category_id?: number | null;
    limit?: number;
    product_ids?: number[];
}

interface Section {
    id: number;
    type: SectionType;
    title: string | null;
    subtitle: string | null;
    position: number;
    active: boolean;
    locked: boolean;
    settings: Settings;
    products: PickerProduct[];
}

interface TypeInfo {
    label: string;
    single: boolean;
    locked: boolean;
}

interface Props {
    sections: Section[];
    categories: { id: number; name: string; active: boolean; image: string | null }[];
    types: Record<SectionType, TypeInfo>;
    sources: Record<string, string>;
    maxProducts: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Página de inicio', href: route('admin.home.index') },
];

/** Icono, color y explicación de cada tipo de sección. */
const TYPE_META: Record<SectionType, { icon: LucideIcon; tone: string; hint: string }> = {
    hero: { icon: GalleryHorizontal, tone: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300', hint: 'Carrusel principal. Las imágenes se gestionan en Banners (página Inicio).' },
    features: { icon: Award, tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', hint: 'Barra de envíos, garantía y formas de pago.' },
    categories: { icon: LayoutGrid, tone: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300', hint: 'Mosaico con las categorías publicadas. Sección fija: no se puede eliminar.' },
    products: { icon: ShoppingBag, tone: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300', hint: 'Fila de productos: elegidos a mano, populares, en oferta o de una categoría.' },
    promo: { icon: Sparkles, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300', hint: 'Dos tarjetas grandes (naranja y azul) con el producto que elijas en cada una.' },
    brands: { icon: Award, tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', hint: 'Cinta con los logos de las marcas publicadas.' },
    showroom: { icon: MapPin, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', hint: 'Dirección, horario, WhatsApp y mapa (datos en Admin › Contacto).' },
};

/** Tipos cuyo título y subtítulo se ven en la web. */
const HAS_TITLE: SectionType[] = ['categories', 'products', 'brands', 'showroom'];
const HAS_SUBTITLE: SectionType[] = ['categories', 'brands', 'showroom'];

const PROMO_SLOTS = [
    { label: 'Tarjeta naranja', ring: 'ring-[#fa8232]', dot: 'bg-[#fa8232]', bg: 'bg-[#fff4ec] dark:bg-orange-950/40' },
    { label: 'Tarjeta azul', ring: 'ring-[#155eef]', dot: 'bg-[#155eef]', bg: 'bg-[#eef3ff] dark:bg-blue-950/40' },
];

/** Al arrastrar, la fila solo se mueve en vertical. */
const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

/** Muestra el mensaje flash que devuelve el servidor tras cada guardado. */
const flash = (page: Page) => {
    const messages = (page.props as { flash?: { success?: string; error?: string } }).flash;
    if (messages?.success) toast.success(messages.success);
    if (messages?.error) toast.error(messages.error);
};

export default function HomeSectionsIndex({ sections, categories, types, sources, maxProducts }: Props) {
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('create_home');
    const canEdit = hasPermission('edit_home');
    const canDelete = hasPermission('delete_home');

    const [items, setItems] = useState(sections);
    const [adding, setAdding] = useState(false);
    const [editing, setEditing] = useState<Section | { type: SectionType; id?: undefined } | null>(null);
    const [deleting, setDeleting] = useState<Section | null>(null);

    useEffect(() => setItems(sections), [sections]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        // En táctil se mantiene presionado el asa para arrastrar, así no interfiere con el scroll
        useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const saveOrder = (next: Section[]) => {
        const previous = items;
        setItems(next);
        router.put(
            route('admin.home.reorder'),
            { sections: next.map((s) => s.id) },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: flash,
                onError: () => {
                    setItems(previous);
                    toast.error('No se pudo guardar el orden.');
                },
            },
        );
    };

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;
        const from = items.findIndex((s) => s.id === active.id);
        const to = items.findIndex((s) => s.id === over.id);
        saveOrder(arrayMove(items, from, to));
    };

    const move = (index: number, delta: number) => {
        const to = index + delta;
        if (to < 0 || to >= items.length) return;
        saveOrder(arrayMove(items, index, to));
    };

    const toggle = (section: Section) => {
        setItems((list) => list.map((s) => (s.id === section.id ? { ...s, active: !s.active } : s)));
        router.patch(route('admin.home.toggle', section.id), {}, { preserveScroll: true, preserveState: true, onSuccess: flash });
    };

    const confirmDelete = () => {
        if (!deleting) return;
        router.delete(route('admin.home.destroy', deleting.id), {
            preserveScroll: true,
            onSuccess: flash,
            onFinish: () => setDeleting(null),
        });
    };

    const existing = new Set(items.map((s) => s.type));
    const visibleCount = items.filter((s) => s.active).length;

    if (!hasPermission('view_home')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Página de inicio" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <Card className="@container/home gap-4">
                    <CardHeader className="gap-3 px-4 sm:px-6 @2xl/home:flex-row @2xl/home:items-center @2xl/home:justify-between">
                        <div className="grid gap-1">
                            <CardTitle className="text-xl font-medium">Página de inicio</CardTitle>
                            <CardDescription>
                                Ordena, muestra u oculta y edita las secciones del inicio. Los cambios se ven en la web al instante.
                            </CardDescription>
                        </div>
                        <div className="flex shrink-0 gap-2 self-stretch @2xl/home:self-auto">
                            <Button variant="outline" size="sm" asChild className="flex-1 @2xl/home:flex-none">
                                <a href="/" target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Ver página
                                </a>
                            </Button>
                            {canCreate && (
                                <Button size="sm" onClick={() => setAdding(true)} className="flex-1 @2xl/home:flex-none">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Agregar sección
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6">
                        <p className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span>
                                {items.length} secciones · {visibleCount} visibles
                            </span>
                            {canEdit && (
                                <span className="hidden sm:inline">Arrastra desde <GripVertical className="inline h-3.5 w-3.5" /> o usa las flechas para reordenar.</span>
                            )}
                            {canEdit && <span className="sm:hidden">Mantén presionado <GripVertical className="inline h-3.5 w-3.5" /> para arrastrar, o usa las flechas.</span>}
                        </p>

                        <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
                            <SortableContext items={items.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                <ol className="@container/list grid gap-2">
                                    {items.map((section, index) => (
                                        <SectionRow
                                            key={section.id}
                                            section={section}
                                            index={index}
                                            total={items.length}
                                            types={types}
                                            sources={sources}
                                            categories={categories}
                                            canEdit={canEdit}
                                            canDelete={canDelete}
                                            onMove={(delta) => move(index, delta)}
                                            onToggle={() => toggle(section)}
                                            onEdit={() => setEditing(section)}
                                            onDelete={() => setDeleting(section)}
                                        />
                                    ))}
                                </ol>
                            </SortableContext>
                        </DndContext>
                    </CardContent>
                </Card>
            </div>

            {/* Elegir el tipo de la sección nueva */}
            <Dialog open={adding} onOpenChange={setAdding}>
                <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Agregar sección</DialogTitle>
                        <DialogDescription>Se agrega al final de la página; luego puedes moverla.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2 sm:grid-cols-2">
                        {(Object.keys(types) as SectionType[]).map((type) => {
                            const meta = TYPE_META[type];
                            const taken = types[type].single && existing.has(type);
                            return (
                                <button
                                    key={type}
                                    type="button"
                                    disabled={taken}
                                    onClick={() => {
                                        setAdding(false);
                                        setEditing({ type });
                                    }}
                                    className="flex items-start gap-3 rounded-xl border p-3 text-left transition-colors hover:border-primary hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border disabled:hover:bg-transparent"
                                >
                                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                                        <meta.icon className="size-4" />
                                    </span>
                                    <span className="grid gap-0.5">
                                        <span className="text-sm font-medium">{types[type].label}</span>
                                        <span className="text-xs text-muted-foreground">{taken ? 'Ya está en la página.' : meta.hint}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Editor lateral (pantalla completa en móvil) */}
            <Sheet open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
                <SheetContent className="w-full gap-0 p-0 sm:max-w-xl">
                    {editing && (
                        <SectionForm
                            key={editing.id ?? `new-${editing.type}`}
                            section={'position' in editing ? editing : null}
                            type={editing.type}
                            types={types}
                            sources={sources}
                            categories={categories}
                            maxProducts={maxProducts}
                            readOnly={'position' in editing ? !canEdit : !canCreate}
                            onDone={() => setEditing(null)}
                        />
                    )}
                </SheetContent>
            </Sheet>

            <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar esta sección?</AlertDialogTitle>
                        <AlertDialogDescription>
                            «{deleting && sectionName(deleting, types)}» dejará de mostrarse en la página de inicio. Si solo quieres esconderla un tiempo,
                            usa el interruptor de visibilidad.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}

const sectionName = (section: Pick<Section, 'type' | 'title'>, types: Props['types']) => section.title || types[section.type]?.label || section.type;

/** Resumen de una línea de lo que muestra la sección. */
function summary(section: Section, sources: Props['sources'], categories: Props['categories']): string {
    const s = section.settings ?? {};
    if (section.type === 'products') {
        if (s.source === 'manual') return `${section.products.length} producto${section.products.length === 1 ? '' : 's'} elegido${section.products.length === 1 ? '' : 's'}`;
        if (s.source === 'category') {
            const cat = categories.find((c) => c.id === s.category_id);
            return `Categoría ${cat?.name ?? '—'} · hasta ${s.limit ?? 8}`;
        }
        return `${sources[s.source ?? 'popular'] ?? s.source} · hasta ${s.limit ?? 8}`;
    }
    if (section.type === 'promo') return section.products.map((p) => p.name).join(' / ') || 'Sin productos elegidos';
    return TYPE_META[section.type]?.hint ?? '';
}

interface RowProps {
    section: Section;
    index: number;
    total: number;
    types: Props['types'];
    sources: Props['sources'];
    categories: Props['categories'];
    canEdit: boolean;
    canDelete: boolean;
    onMove: (delta: number) => void;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

function SectionRow({ section, index, total, types, sources, categories, canEdit, canDelete, onMove, onToggle, onEdit, onDelete }: RowProps) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: section.id, disabled: !canEdit });
    const meta = TYPE_META[section.type] ?? TYPE_META.products;

    return (
        <li
            ref={setNodeRef}
            style={{ transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
            className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-card p-2.5 @2xl/list:flex-nowrap @2xl/list:p-3 ${
                isDragging ? 'relative z-10 shadow-lg ring-2 ring-primary/40' : ''
            } ${section.active ? '' : 'bg-muted/40'}`}
        >
            {canEdit && (
                <button
                    ref={setActivatorNodeRef}
                    type="button"
                    aria-label={`Mover ${sectionName(section, types)}`}
                    className="-ml-1 flex h-10 w-7 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-accent active:cursor-grabbing"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            )}

            <span className={`relative flex size-10 shrink-0 items-center justify-center rounded-lg ${meta.tone} ${section.active ? '' : 'opacity-50'}`}>
                <meta.icon className="size-4" />
                <span className="absolute -top-1.5 -left-1.5 flex size-5 items-center justify-center rounded-full border bg-background text-[10px] font-semibold text-foreground">
                    {index + 1}
                </span>
            </span>

            <div className={`min-w-0 flex-1 ${section.active ? '' : 'opacity-60'}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium">{sectionName(section, types)}</span>
                    {section.title && <span className="hidden text-xs text-muted-foreground md:inline">· {types[section.type]?.label}</span>}
                    {section.locked && (
                        <Badge variant="secondary" className="gap-1 px-1.5 py-0 text-[11px]">
                            <Lock className="size-3" /> Fija
                        </Badge>
                    )}
                    {!section.active && (
                        <Badge variant="outline" className="px-1.5 py-0 text-[11px]">
                            Oculta
                        </Badge>
                    )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                    {section.type === 'promo' && section.products.length > 0 && (
                        <span className="flex shrink-0 -space-x-1.5">
                            {section.products.map((p, i) => (
                                <Thumb key={p.id} src={p.image} className={`size-5 ring-2 ${PROMO_SLOTS[i]?.ring ?? ''}`} />
                            ))}
                        </span>
                    )}
                    <p className="line-clamp-1 text-xs text-muted-foreground">{summary(section, sources, categories)}</p>
                </div>
            </div>

            {/* En móvil las acciones bajan a su propia fila, alineadas a la derecha */}
            <div className="flex w-full shrink-0 items-center justify-end gap-1 border-t pt-2 @2xl/list:w-auto @2xl/list:border-t-0 @2xl/list:pt-0">
                {canEdit && (
                    <>
                        <Button variant="ghost" size="icon" className="size-9" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Subir">
                            <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-9" disabled={index === total - 1} onClick={() => onMove(1)} aria-label="Bajar">
                            <ArrowDown className="h-4 w-4" />
                        </Button>
                        <label
                            className={`mx-1 flex items-center gap-1.5 ${section.locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            title={section.locked ? 'Esta sección siempre está visible' : section.active ? 'Ocultar en la web' : 'Mostrar en la web'}
                        >
                            {section.active ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                            <Switch checked={section.active} disabled={section.locked} onCheckedChange={onToggle} aria-label="Visible en la web" />
                        </label>
                    </>
                )}
                <Button variant="outline" size="sm" className="h-9" onClick={onEdit}>
                    <Pencil className="h-4 w-4 @3xl/list:mr-1.5" />
                    <span className="hidden @3xl/list:inline">{canEdit ? 'Editar' : 'Ver'}</span>
                </Button>
                {canDelete && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-9 text-red-600 hover:text-red-700 disabled:text-muted-foreground"
                        disabled={section.locked}
                        title={section.locked ? 'Esta sección no se puede eliminar' : 'Eliminar'}
                        onClick={onDelete}
                        aria-label="Eliminar"
                    >
                        {section.locked ? <Lock className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                )}
            </div>
        </li>
    );
}

function Thumb({ src, className = 'size-10' }: { src: string | null; className?: string }) {
    return src ? (
        <img src={src} alt="" loading="lazy" className={`shrink-0 rounded-md border bg-white object-contain ${className}`} />
    ) : (
        <span className={`flex shrink-0 items-center justify-center rounded-md border bg-muted ${className}`}>
            <ShoppingBag className="size-1/2 text-muted-foreground" />
        </span>
    );
}

/* ─────────────────────────────── Editor ─────────────────────────────── */

interface FormProps {
    section: Section | null;
    type: SectionType;
    types: Props['types'];
    sources: Props['sources'];
    categories: Props['categories'];
    maxProducts: number;
    readOnly: boolean;
    onDone: () => void;
}

function SectionForm({ section, type, types, sources, categories, maxProducts, readOnly, onDone }: FormProps) {
    const settings = section?.settings ?? {};
    const [picked, setPicked] = useState<PickerProduct[]>(section?.products ?? []);
    const [promo, setPromo] = useState<(PickerProduct | null)[]>(
        type === 'promo' ? [section?.products[0] ?? null, section?.products[1] ?? null] : [],
    );
    const [promoSlot, setPromoSlot] = useState<number | null>(null);

    const { data, setData, transform, post, put, processing, errors } = useForm({
        type,
        title: section?.title ?? '',
        subtitle: section?.subtitle ?? '',
        active: section?.active ?? true,
        source: settings.source ?? (type === 'products' ? 'manual' : ''),
        category_id: settings.category_id ? String(settings.category_id) : '',
        limit: String(settings.limit ?? 8),
    });

    transform((d) => ({
        type: d.type,
        title: d.title || null,
        subtitle: d.subtitle || null,
        active: d.active,
        settings:
            type === 'products'
                ? {
                      source: d.source,
                      category_id: d.source === 'category' && d.category_id ? Number(d.category_id) : null,
                      limit: Number(d.limit),
                      product_ids: d.source === 'manual' ? picked.map((p) => p.id) : null,
                  }
                : type === 'promo'
                  ? { product_ids: promo.filter(Boolean).map((p) => p!.id) }
                  : {},
    }));

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: (page: Page) => {
                flash(page);
                const err = (page.props as { flash?: { error?: string } }).flash?.error;
                if (!err) onDone();
            },
            onError: () => toast.error('Por favor corrige los errores en el formulario'),
        };
        if (section) put(route('admin.home.update', section.id), options);
        else post(route('admin.home.store'), options);
    };

    const meta = TYPE_META[type];
    const err = errors as Record<string, string | undefined>;
    const productsError = err['settings.product_ids'] ?? Object.entries(err).find(([k]) => k.startsWith('settings.product_ids.'))?.[1];

    const movePicked = (index: number, delta: number) => {
        const to = index + delta;
        if (to < 0 || to >= picked.length) return;
        setPicked((list) => arrayMove(list, index, to));
    };

    return (
        <form onSubmit={submit} className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b px-4 py-4 pr-12 sm:px-6">
                <div className="flex items-center gap-3">
                    <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}>
                        <meta.icon className="size-4" />
                    </span>
                    <div className="grid min-w-0 gap-0.5 text-left">
                        <SheetTitle className="truncate">{section ? `Editar: ${sectionName(section, types)}` : `Nueva sección: ${types[type].label}`}</SheetTitle>
                        <SheetDescription className="line-clamp-2">{meta.hint}</SheetDescription>
                    </div>
                </div>
            </SheetHeader>

            <fieldset disabled={readOnly || processing} className="grid min-h-0 flex-1 content-start gap-5 overflow-y-auto px-4 py-5 sm:px-6">
                {HAS_TITLE.includes(type) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={type === 'products' ? 'Título *' : 'Título'} htmlFor="title" error={errors.title} className={`grid gap-2 ${HAS_SUBTITLE.includes(type) ? '' : 'sm:col-span-2'}`}>
                            <Input
                                id="title"
                                value={data.title}
                                maxLength={120}
                                placeholder={type === 'products' ? 'Ej.: Lo más vendido' : 'Se usa el título por defecto'}
                                onChange={(e) => setData('title', e.target.value)}
                            />
                        </Field>
                        {HAS_SUBTITLE.includes(type) && (
                            <Field label="Texto pequeño superior" htmlFor="subtitle" error={errors.subtitle}>
                                <Input id="subtitle" value={data.subtitle} maxLength={80} placeholder="Opcional" onChange={(e) => setData('subtitle', e.target.value)} />
                            </Field>
                        )}
                    </div>
                )}

                {type === 'products' && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="¿Qué productos mostrar?" error={err['settings.source']} className={`grid gap-2 ${data.source === 'manual' ? 'sm:col-span-2' : ''}`}>
                                <Select value={data.source} onValueChange={(v) => setData('source', v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(sources).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            {data.source !== 'manual' && (
                                <Field label="Cantidad máxima" error={err['settings.limit']}>
                                    <Select value={data.limit} onValueChange={(v) => setData('limit', v)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: maxProducts }, (_, i) => String(i + 1)).map((n) => (
                                                <SelectItem key={n} value={n}>
                                                    {n} producto{n === '1' ? '' : 's'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                            {data.source === 'category' && (
                                <Field label="Categoría" error={err['settings.category_id']} className="grid gap-2 sm:col-span-2">
                                    <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Elige una categoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name}
                                                    {!c.active && ' (no publicada)'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        </div>

                        {data.source !== 'manual' ? (
                            <p className="rounded-lg border border-dashed px-3 py-2.5 text-xs text-muted-foreground">
                                Se muestran automáticamente
                                {data.source === 'popular' && ' los productos marcados como «Popular»'}
                                {data.source === 'featured' && ' los productos marcados como «Destacado»'}
                                {data.source === 'offers' && ' los productos con oferta vigente (con botón «Ver más» hacia las ofertas)'}
                                {data.source === 'latest' && ' los últimos productos publicados'}
                                {data.source === 'category' && ' los productos de la categoría, con botón «Ver más» hacia ella'}
                                , en el orden definido en Productos. Para elegirlos uno por uno usa «Elegidos a mano».
                            </p>
                        ) : (
                            <div className="grid gap-3">
                                <div className="flex items-baseline justify-between">
                                    <h3 className="text-sm font-medium">Productos elegidos</h3>
                                    <span className={`text-xs ${picked.length >= maxProducts ? 'text-amber-600' : 'text-muted-foreground'}`}>
                                        {picked.length}/{maxProducts}
                                    </span>
                                </div>
                                {picked.length === 0 ? (
                                    <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                                        Aún no elegiste productos. Búscalos abajo.
                                    </p>
                                ) : (
                                    <ol className="grid gap-1.5">
                                        {picked.map((p, i) => (
                                            <li key={p.id} className="flex items-center gap-2 rounded-lg border p-1.5 pr-1">
                                                <span className="w-5 shrink-0 text-center text-xs font-semibold text-muted-foreground">{i + 1}</span>
                                                <Thumb src={p.image} />
                                                <ProductText product={p} />
                                                <div className="flex shrink-0">
                                                    <Button type="button" variant="ghost" size="icon" className="size-8" disabled={i === 0} onClick={() => movePicked(i, -1)} aria-label="Subir">
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button type="button" variant="ghost" size="icon" className="size-8" disabled={i === picked.length - 1} onClick={() => movePicked(i, 1)} aria-label="Bajar">
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-red-600"
                                                        onClick={() => setPicked((list) => list.filter((x) => x.id !== p.id))}
                                                        aria-label="Quitar"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                                {productsError && <p className="text-sm text-red-500">{productsError}</p>}
                                {!readOnly && (
                                    <ProductPicker
                                        selected={picked.map((p) => p.id)}
                                        full={picked.length >= maxProducts}
                                        onPick={(p) => setPicked((list) => (list.some((x) => x.id === p.id) ? list : [...list, p]))}
                                    />
                                )}
                            </div>
                        )}
                    </>
                )}

                {type === 'promo' && (
                    <div className="grid gap-3">
                        <p className="text-xs text-muted-foreground">
                            En escritorio se ven las dos tarjetas lado a lado; en móvil y tablet se alternan cada 7 segundos.
                        </p>
                        {PROMO_SLOTS.map((slot, i) => {
                            const product = promo[i];
                            return (
                                <div key={slot.label} className={`grid gap-3 rounded-xl p-3 ${slot.bg}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`size-2.5 rounded-full ${slot.dot}`} />
                                        <span className="text-sm font-medium">{slot.label}</span>
                                    </div>
                                    {product ? (
                                        <div className="flex items-center gap-2 rounded-lg border bg-background p-1.5">
                                            <Thumb src={product.image} className="size-12" />
                                            <ProductText product={product} />
                                            {!readOnly && (
                                                <Button type="button" variant="outline" size="sm" onClick={() => setPromoSlot(promoSlot === i ? null : i)}>
                                                    {promoSlot === i ? 'Cerrar' : 'Cambiar'}
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        !readOnly &&
                                        promoSlot !== i && (
                                            <Button type="button" variant="outline" className="justify-start bg-background" onClick={() => setPromoSlot(i)}>
                                                <Plus className="mr-2 h-4 w-4" /> Elegir producto
                                            </Button>
                                        )
                                    )}
                                    {promoSlot === i && (
                                        <ProductPicker
                                            selected={promo.filter(Boolean).map((p) => p!.id)}
                                            autoFocus
                                            onPick={(p) => {
                                                setPromo((list) => list.map((x, j) => (j === i ? p : x)));
                                                setPromoSlot(null);
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                        {productsError && <p className="text-sm text-red-500">{productsError}</p>}
                    </div>
                )}

                {type === 'categories' && section && <CategoryImages categories={categories} readOnly={readOnly} />}

                {!HAS_TITLE.includes(type) && type !== 'promo' && (
                    <p className="rounded-lg border border-dashed px-3 py-2.5 text-sm text-muted-foreground">
                        Esta sección no tiene opciones propias: solo puedes moverla, ocultarla o eliminarla.
                        {type === 'hero' && ' Las imágenes del carrusel se cambian en Banners.'}
                    </p>
                )}

                {!section?.locked && (
                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                        <span className="grid">
                            <span className="text-sm font-medium">Visible en la web</span>
                            <span className="text-xs text-muted-foreground">Si la apagas se guarda pero no se muestra.</span>
                        </span>
                        <Switch checked={data.active} onCheckedChange={(v) => setData('active', v)} />
                    </label>
                )}
            </fieldset>

            <SheetFooter className="flex-row justify-end gap-2 border-t px-4 py-3 sm:px-6">
                <Button type="button" variant="outline" onClick={onDone} className="flex-1 sm:flex-none">
                    {readOnly ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!readOnly && (
                    <Button type="submit" disabled={processing} className="flex-1 sm:flex-none">
                        {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {section ? 'Guardar cambios' : 'Agregar sección'}
                    </Button>
                )}
            </SheetFooter>
        </form>
    );
}

/** Imágenes del mosaico «Explora por categoría»: cada tarjeta muestra la imagen de su categoría. Se guardan al instante. */
function CategoryImages({ categories, readOnly }: { categories: Props['categories']; readOnly: boolean }) {
    const [busy, setBusy] = useState<number | null>(null);
    const [removing, setRemoving] = useState<Props['categories'][number] | null>(null);
    const [errors, setErrors] = useState<Record<number, string>>({});

    const options = (id: number) => ({
        preserveScroll: true,
        preserveState: true,
        onStart: () => setBusy(id),
        onSuccess: (page: Page) => {
            flash(page);
            setErrors((list) => Object.fromEntries(Object.entries(list).filter(([key]) => Number(key) !== id)));
        },
        onError: (e: Record<string, string>) => {
            const message = e.image ?? 'No se pudo guardar la imagen.';
            setErrors((list) => ({ ...list, [id]: message }));
            toast.error(message);
        },
        onFinish: () => setBusy(null),
    });

    const upload = (id: number, file: File | undefined) => {
        if (!file) return;
        router.post(route('admin.home.category-image', id), { image: file }, { ...options(id), forceFormData: true });
    };

    const remove = () => {
        if (!removing) return;
        router.delete(route('admin.home.category-image.destroy', removing.id), options(removing.id));
        setRemoving(null);
    };

    return (
        <div className="grid gap-3">
            <div className="grid gap-0.5">
                <h3 className="text-sm font-medium">Imágenes del carrusel</h3>
                <p className="text-xs text-muted-foreground">
                    Cada tarjeta muestra la imagen de su categoría. Usa PNG con fondo transparente o blanco (JPG, PNG, GIF o WEBP, máx. 5 MB). Los cambios
                    se guardan al instante.
                </p>
            </div>
            {categories.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">Aún no hay categorías.</p>
            ) : (
                <ul className="grid gap-1.5">
                    {categories.map((c) => (
                        <li key={c.id} className="grid gap-1 rounded-lg border p-1.5 pr-1">
                            <div className="flex items-center gap-2">
                                {busy === c.id ? (
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted">
                                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                                    </span>
                                ) : c.image ? (
                                    <img src={c.image} alt="" loading="lazy" className="size-12 shrink-0 rounded-md border bg-white object-contain p-0.5" />
                                ) : (
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-dashed bg-muted">
                                        <ImageOff className="size-4 text-muted-foreground" />
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-sm font-medium">{c.name}</p>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {c.image ? 'Con imagen' : 'Sin imagen'}
                                        {!c.active && <span className="ml-1 text-amber-600">· no publicada (no se ve en la web)</span>}
                                    </p>
                                </div>
                                {!readOnly && (
                                    <div className="flex shrink-0 items-center gap-1">
                                        <Button type="button" variant="outline" size="sm" className="h-8" asChild>
                                            <label className={busy !== null ? 'pointer-events-none opacity-50' : 'cursor-pointer'}>
                                                <ImagePlus className="h-4 w-4 sm:mr-1.5" />
                                                <span className="hidden sm:inline">{c.image ? 'Cambiar' : 'Agregar'}</span>
                                                <input
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/gif,image/webp"
                                                    className="sr-only"
                                                    disabled={busy !== null}
                                                    aria-label={`${c.image ? 'Cambiar' : 'Agregar'} imagen de ${c.name}`}
                                                    onChange={(e) => {
                                                        upload(c.id, e.target.files?.[0]);
                                                        e.target.value = '';
                                                    }}
                                                />
                                            </label>
                                        </Button>
                                        {c.image && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-red-600"
                                                disabled={busy !== null}
                                                onClick={() => setRemoving(c)}
                                                aria-label={`Quitar imagen de ${c.name}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors[c.id] && <p className="px-1 text-xs text-red-500">{errors[c.id]}</p>}
                        </li>
                    ))}
                </ul>
            )}

            <AlertDialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Quitar la imagen?</AlertDialogTitle>
                        <AlertDialogDescription>
                            La tarjeta de «{removing?.name}» se mostrará sin imagen en el carrusel. Puedes subir otra cuando quieras.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={remove} className="bg-red-600 text-white hover:bg-red-700">
                            Quitar imagen
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ProductText({ product }: { product: PickerProduct }) {
    return (
        <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium">{product.name}</p>
            <p className="line-clamp-1 text-xs text-muted-foreground">
                {[product.category, product.brand].filter(Boolean).join(' · ') || '—'}
                {!product.active && <span className="ml-1 text-amber-600">· no publicado</span>}
            </p>
        </div>
    );
}

/** Buscador de productos publicados (nombre, marca o categoría) con resultados en lista. */
function ProductPicker({ selected, full = false, autoFocus = false, onPick }: { selected: number[]; full?: boolean; autoFocus?: boolean; onPick: (p: PickerProduct) => void }) {
    const [term, setTerm] = useState('');
    const [results, setResults] = useState<PickerProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const request = useRef<AbortController | null>(null);

    useEffect(() => {
        const timer = setTimeout(async () => {
            request.current?.abort();
            const controller = new AbortController();
            request.current = controller;
            setLoading(true);
            try {
                const res = await fetch(route('admin.home.products', { q: term.trim() }), {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    signal: controller.signal,
                });
                if (res.ok) setResults(await res.json());
            } catch {
                /* búsqueda cancelada por otra más nueva */
            } finally {
                if (request.current === controller) setLoading(false);
            }
        }, 250);
        return () => clearTimeout(timer);
    }, [term]);

    useEffect(() => () => request.current?.abort(), []);

    return (
        <div className="grid gap-2 rounded-xl border bg-background p-2">
            <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={term}
                    autoFocus={autoFocus}
                    onChange={(e) => setTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    placeholder="Buscar por nombre, marca o categoría…"
                    className="pl-8"
                    aria-label="Buscar productos"
                />
                {loading && <Loader2 className="absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
            </div>
            <ul className="grid max-h-72 gap-1 overflow-y-auto overscroll-contain">
                {results.length === 0 && !loading && <li className="px-2 py-4 text-center text-sm text-muted-foreground">Sin resultados.</li>}
                {results.map((p) => {
                    const isSelected = selected.includes(p.id);
                    return (
                        <li key={p.id}>
                            <button
                                type="button"
                                disabled={isSelected || full}
                                onClick={() => onPick(p)}
                                className="flex w-full items-center gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <Thumb src={p.image} />
                                <ProductText product={p} />
                                <span className="shrink-0 px-1 text-xs font-medium text-primary">{isSelected ? 'Elegido' : full ? 'Límite' : 'Agregar'}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
