import { useEffect, useState, type FormEventHandler } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import {
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    FileText,
    History,
    ImageIcon,
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
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes';
import { Gallery } from './_gallery';
import { type AboutImage, type Editor, flash, formatDate } from './_shared';

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

const ACTION_STYLE: Record<string, string> = {
    text_updated: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    image_replaced: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    image_focus: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    image_alt: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    image_moved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
};

const assetUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `/${path.replace(/^\/+/, '')}`);

export default function AboutIndex({ page, images, logs, actions, fields, filters, tab: initialTab }: Props) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('edit_about');
    const [tab, setTab] = useState(['texts', 'gallery', 'history'].includes(initialTab) ? initialTab : 'texts');
    const [textsDirty, setTextsDirty] = useState(false);
    const [galleryChanges, setGalleryChanges] = useState<string[]>([]);
    const leave = useUnsavedChangesGuard(textsDirty || galleryChanges.length > 0);

    const sections = [textsDirty && 'los textos', galleryChanges.length > 0 && 'la galería'].filter(Boolean).join(' y ');
    const leaveDetails = [...(textsDirty ? ['Textos modificados'] : []), ...galleryChanges];

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

                            {/* Textos y galería se mantienen montados para no perder los cambios sin guardar al cambiar de pestaña */}
                            <TabsContent value="texts" forceMount className="mt-2 data-[state=inactive]:hidden">
                                <TextsForm page={page} canEdit={canEdit} onDirtyChange={setTextsDirty} />
                            </TabsContent>
                            <TabsContent value="gallery" forceMount className="mt-2 data-[state=inactive]:hidden">
                                <Gallery images={images} canEdit={canEdit} onDirtyChange={setGalleryChanges} />
                            </TabsContent>
                            <TabsContent value="history" className="mt-2">
                                <HistoryList logs={logs} actions={actions} fields={fields} filters={filters} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <ConfirmDialog
                open={leave.open}
                title="Tienes cambios sin guardar"
                description={`Si sales ahora, se perderán los cambios en ${sections || 'esta página'}. Guárdalos antes de continuar o sal sin guardar.`}
                details={leaveDetails}
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                onConfirm={leave.confirm}
                onCancel={leave.cancel}
            />
        </AppLayout>
    );
}

/* ─────────────────────────────── Textos ─────────────────────────────── */

function TextsForm({ page, canEdit, onDirtyChange }: { page: AboutPageData; canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
    const [confirmDiscard, setConfirmDiscard] = useState(false);
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
            onError: (errs) =>
                toast.error('No se pudieron guardar los textos', { description: Object.values(errs)[0] ?? 'Revisa los campos marcados en rojo.' }),
        });
    };

    useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

    const discard = () => {
        reset();
        setConfirmDiscard(false);
        toast('Cambios descartados', { description: 'Los textos volvieron a como están publicados en la web.' });
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
                        <Button type="button" variant="outline" disabled={processing || !isDirty} onClick={() => setConfirmDiscard(true)}>
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

            <ConfirmDialog
                open={confirmDiscard}
                tone="danger"
                title="¿Descartar los cambios en los textos?"
                description="Los textos volverán a como están publicados en la web. Esta acción no se puede deshacer."
                confirmLabel="Descartar cambios"
                cancelLabel="Seguir editando"
                onConfirm={discard}
                onCancel={() => setConfirmDiscard(false)}
            />
        </form>
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
