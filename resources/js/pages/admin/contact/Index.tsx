import { useEffect, useState, type FormEventHandler, type ReactNode } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { type FormDataType } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import {
    ArrowLeft,
    ArrowRight,
    Clock,
    Copy,
    ExternalLink,
    FileText,
    History,
    Loader2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    RotateCcw,
    Save,
    Share2,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Field } from '@/components/admin/form-shell';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes';
import { formatWhatsappIntl } from '@/lib/cms';
import { autoSummary, DAY_NAMES, groupSchedule, type ScheduleDay, type ScheduleMode } from '@/lib/schedule';
import { flash, formatDate, type Editor } from '../about/_shared';

interface ContactData {
    whatsapp: string;
    phone: string | null;
    email: string;
    address: string;
    city: string | null;
    maps_url: string | null;
    website: string | null;
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    schedule: ScheduleDay[];
    schedule_summary: string | null;
    hero_title: string;
    hero_subtitle: string | null;
    show_map: boolean;
    hours_title: string;
    hours_note: string | null;
    updated_at: string | null;
    editor: Editor | null;
}

interface ContactLog {
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
    contact: ContactData;
    logs: Paginated<ContactLog>;
    actions: Record<string, string>;
    fields: Record<string, string>;
    filters: { action: string };
    tab: string;
}

const TABS = ['data', 'schedule', 'texts', 'history'];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Contacto', href: route('admin.contact.index') },
];

const ACTION_STYLE: Record<string, string> = {
    data_updated: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    schedule_updated: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    text_updated: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
};

export default function ContactIndex({ contact, logs, actions, fields, filters, tab: initialTab }: Props) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('edit_contact');
    const [tab, setTab] = useState(TABS.includes(initialTab) ? initialTab : 'data');
    const [dirty, setDirty] = useState({ data: false, schedule: false, texts: false });
    const leave = useUnsavedChangesGuard(dirty.data || dirty.schedule || dirty.texts);

    const leaveDetails = [
        ...(dirty.data ? ['Datos de contacto modificados'] : []),
        ...(dirty.schedule ? ['Horario modificado'] : []),
        ...(dirty.texts ? ['Textos modificados'] : []),
    ];

    const changeTab = (value: string) => {
        setTab(value);
        // La pestaña queda en la URL para volver a ella al recargar o compartir el enlace
        const url = new URL(window.location.href);
        url.searchParams.set('tab', value);
        window.history.replaceState(window.history.state, '', url);
    };

    if (!hasPermission('view_contact')) {
        return null;
    }

    const dot = (on: boolean) => on && <span className="size-1.5 rounded-full bg-orange-500" aria-label="Cambios sin guardar" />;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Contacto" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid gap-1">
                            <CardTitle className="text-xl font-medium">Contacto</CardTitle>
                            <CardDescription>
                                Teléfono, correo, dirección y horario de atención que se muestran en toda la web, y los textos de la página
                                Contáctanos.
                                {contact.updated_at && (
                                    <span className="block pt-1 text-xs">
                                        Última edición: {formatDate(contact.updated_at)}
                                        {contact.editor && <> · {contact.editor.name}</>}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                            <a href="/contactanos" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver página
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!canEdit && (
                            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                Solo lectura: tu rol no tiene el permiso <code>edit_contact</code>.
                            </p>
                        )}
                        <Tabs value={tab} onValueChange={changeTab} className="gap-4">
                            <TabsList className="grid h-auto w-full grid-cols-4 sm:inline-flex sm:w-auto">
                                <TabsTrigger value="data" className="gap-1.5 px-2 sm:px-4">
                                    <Phone className="hidden h-4 w-4 sm:block" />
                                    Datos
                                    {dot(dirty.data)}
                                </TabsTrigger>
                                <TabsTrigger value="schedule" className="gap-1.5 px-2 sm:px-4">
                                    <Clock className="hidden h-4 w-4 sm:block" />
                                    Horario
                                    {dot(dirty.schedule)}
                                </TabsTrigger>
                                <TabsTrigger value="texts" className="gap-1.5 px-2 sm:px-4">
                                    <FileText className="hidden h-4 w-4 sm:block" />
                                    Textos
                                    {dot(dirty.texts)}
                                </TabsTrigger>
                                <TabsTrigger value="history" className="gap-1.5 px-2 sm:px-4">
                                    <History className="hidden h-4 w-4 sm:block" />
                                    Historial
                                    {logs.total > 0 && (
                                        <Badge variant="secondary" className="ml-1 hidden px-1.5 py-0 text-[11px] sm:inline-flex">
                                            {logs.total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* Los formularios se mantienen montados para no perder cambios sin guardar al cambiar de pestaña */}
                            <TabsContent value="data" forceMount className="mt-2 data-[state=inactive]:hidden">
                                <DataForm
                                    contact={contact}
                                    canEdit={canEdit}
                                    onDirtyChange={(v) => setDirty((d) => (d.data === v ? d : { ...d, data: v }))}
                                />
                            </TabsContent>
                            <TabsContent value="schedule" forceMount className="mt-2 data-[state=inactive]:hidden">
                                <ScheduleForm
                                    contact={contact}
                                    canEdit={canEdit}
                                    onDirtyChange={(v) => setDirty((d) => (d.schedule === v ? d : { ...d, schedule: v }))}
                                />
                            </TabsContent>
                            <TabsContent value="texts" forceMount className="mt-2 data-[state=inactive]:hidden">
                                <TextsForm
                                    contact={contact}
                                    canEdit={canEdit}
                                    onDirtyChange={(v) => setDirty((d) => (d.texts === v ? d : { ...d, texts: v }))}
                                />
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
                description="Si sales ahora, se perderán los cambios. Guárdalos antes de continuar o sal sin guardar."
                details={leaveDetails}
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                onConfirm={leave.confirm}
                onCancel={leave.cancel}
            />
        </AppLayout>
    );
}

/* ─────────────────────────────── Piezas comunes ─────────────────────────────── */

function Section({ title, icon, children, className = '' }: { title: string; icon?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={`grid content-start gap-4 rounded-xl border p-4 sm:p-5 ${className}`}>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {icon}
                {title}
            </h3>
            {children}
        </section>
    );
}

function Hint({ children }: { children: ReactNode }) {
    return <p className="text-xs text-muted-foreground">{children}</p>;
}

function SaveBar({ label, processing, isDirty, onDiscard }: { label: string; processing: boolean; isDirty: boolean; onDiscard: () => void }) {
    return (
        <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            <Button type="submit" disabled={processing || !isDirty}>
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {label}
            </Button>
            <Button type="button" variant="outline" disabled={processing || !isDirty} onClick={onDiscard}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Descartar
            </Button>
            {isDirty && <span className="text-sm text-orange-600">Hay cambios sin guardar</span>}
        </div>
    );
}

/** useForm + guardado + descarte con confirmación, igual en las tres pestañas. */
function useSection<T extends FormDataType<T>>(initial: T, url: string, what: string, onDirtyChange: (dirty: boolean) => void) {
    const form = useForm<T>(initial);
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    useEffect(() => onDirtyChange(form.isDirty), [form.isDirty, onDirtyChange]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        form.put(url, {
            preserveScroll: true,
            onSuccess: (page) => {
                flash(page);
                // Lo guardado pasa a ser la nueva base (isDirty vuelve a false)
                const saved = (page.props as unknown as { contact: Record<string, unknown> }).contact;
                const next = Object.fromEntries(Object.keys(initial).map((k) => [k, saved[k] ?? ''])) as unknown as T;
                form.setDefaults(next);
                form.setData(next);
            },
            onError: (errs) =>
                toast.error(`No se pudo guardar ${what}`, { description: Object.values(errs)[0] ?? 'Revisa los campos marcados en rojo.' }),
        });
    };

    const discardDialog = (
        <ConfirmDialog
            open={confirmDiscard}
            tone="danger"
            title={`¿Descartar los cambios en ${what}?`}
            description="Volverá a como está publicado en la web. Esta acción no se puede deshacer."
            confirmLabel="Descartar cambios"
            cancelLabel="Seguir editando"
            onConfirm={() => {
                form.reset();
                form.clearErrors();
                setConfirmDiscard(false);
                toast('Cambios descartados');
            }}
            onCancel={() => setConfirmDiscard(false)}
        />
    );

    return { ...form, submit, askDiscard: () => setConfirmDiscard(true), discardDialog };
}

/* ─────────────────────────────── Datos ─────────────────────────────── */

/** Igual que la validación del backend: "+591 68210861". */
const WHATSAPP_FORMAT = /^\+?\d{1,4} \d{6,12}$/;

const DATA_KEYS = ['whatsapp', 'phone', 'email', 'address', 'city', 'maps_url', 'website', 'facebook', 'instagram', 'twitter', 'tiktok'] as const;

function DataForm({ contact, canEdit, onDirtyChange }: { contact: ContactData; canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
    const initial = Object.fromEntries(DATA_KEYS.map((k) => [k, contact[k] ?? ''])) as Record<(typeof DATA_KEYS)[number], string>;
    const { data, setData, errors, processing, isDirty, submit, askDiscard, discardDialog } = useSection(
        initial,
        route('admin.contact.data'),
        'los datos de contacto',
        onDirtyChange,
    );

    const bind = (key: (typeof DATA_KEYS)[number]) => ({
        id: key,
        value: data[key],
        'aria-invalid': errors[key] ? true : undefined,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setData(key, e.target.value),
    });

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            <fieldset disabled={!canEdit || processing} className="grid min-w-0 gap-6">
                <div className="grid gap-6 xl:grid-cols-2">
                    <Section title="Teléfono" icon={<MessageCircle className="h-4 w-4" />}>
                        <Field label="WhatsApp (con código de país)" htmlFor="whatsapp" error={errors.whatsapp}>
                            <Input {...bind('whatsapp')} inputMode="tel" placeholder="+591 68210861" maxLength={20} />
                            <Hint>
                                {WHATSAPP_FORMAT.test(data.whatsapp.trim()) ? (
                                    <>
                                        Se verá como <strong>{formatWhatsappIntl(data.whatsapp)}</strong> en toda la web.
                                    </>
                                ) : (
                                    'Formato: +código de país, un espacio y el número seguido (ej. +591 68210861). Se usa en todos los botones de WhatsApp, pedidos y consultas de productos.'
                                )}
                            </Hint>
                        </Field>
                        <Field label="Teléfono fijo (opcional)" htmlFor="phone" error={errors.phone}>
                            <Input {...bind('phone')} inputMode="tel" placeholder="(2) 2441234" maxLength={40} />
                            <Hint>Si lo llenas, aparece como canal adicional en Contáctanos.</Hint>
                        </Field>
                    </Section>

                    <Section title="Correo" icon={<Mail className="h-4 w-4" />}>
                        <Field label="Correo público" htmlFor="email" error={errors.email}>
                            <Input {...bind('email')} type="email" placeholder="contacto@empresa.com" />
                            <Hint>Se muestra en el footer y en Contáctanos.</Hint>
                        </Field>
                    </Section>
                </div>

                <Section title="Ubicación" icon={<MapPin className="h-4 w-4" />}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Dirección del showroom" htmlFor="address" error={errors.address}>
                            <Textarea {...bind('address')} rows={3} placeholder={'Av. 20 de Octubre\nEsq. Rosendo Gutierrez'} />
                            <Hint>
                                Un renglón por línea. En el showroom se ve en renglones; en otros lugares, separada por comas. El mapa de
                                Contáctanos busca esta dirección.
                            </Hint>
                        </Field>
                        <div className="grid content-start gap-4">
                            <Field label="Ciudad / país" htmlFor="city" error={errors.city}>
                                <Input {...bind('city')} placeholder="La Paz, Bolivia" maxLength={120} />
                                <Hint>Aparece al pie de la página (footer).</Hint>
                            </Field>
                            <Field label="Sitio web" htmlFor="website" error={errors.website}>
                                <Input {...bind('website')} placeholder="www.smarthousebo.com" />
                            </Field>
                        </div>
                    </div>
                    <Field label="Enlace de Google Maps (opcional)" htmlFor="maps_url" error={errors.maps_url}>
                        <Input {...bind('maps_url')} type="url" placeholder="https://maps.app.goo.gl/..." />
                        <Hint>Para los botones «Cómo llegar» y «Ubicación». Si queda vacío se busca la dirección en Google Maps.</Hint>
                    </Field>
                </Section>

                <Section title="Redes sociales" icon={<Share2 className="h-4 w-4" />}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {(
                            [
                                ['facebook', 'Facebook', 'https://www.facebook.com/...'],
                                ['instagram', 'Instagram', 'https://www.instagram.com/...'],
                                ['tiktok', 'TikTok', 'https://www.tiktok.com/@...'],
                                ['twitter', 'X / Twitter', 'https://x.com/...'],
                            ] as const
                        ).map(([key, label, placeholder]) => (
                            <Field key={key} label={label} htmlFor={key} error={errors[key]}>
                                <Input {...bind(key)} type="url" placeholder={placeholder} />
                            </Field>
                        ))}
                    </div>
                    <Hint>Solo se muestran en el footer las redes que tengan enlace.</Hint>
                </Section>

                {canEdit && <SaveBar label="Guardar datos" processing={processing} isDirty={isDirty} onDiscard={askDiscard} />}
            </fieldset>

            <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dónde se usan</p>
                <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
                    <p className="text-muted-foreground">Al guardar, estos datos reemplazan a los que se muestran en toda la web:</p>
                    <ul className="grid gap-2">
                        {[
                            ['WhatsApp', 'Footer, barra de beneficios, showroom, Nosotros, Contáctanos, carrito, checkout y fichas de producto.'],
                            ['Correo', 'Footer y Contáctanos.'],
                            ['Dirección y mapa', 'Showroom de inicio, Nosotros, carrito y Contáctanos (mapa incluido).'],
                            ['Ciudad', 'Pie de página.'],
                            ['Redes', 'Botones del footer.'],
                        ].map(([what, where]) => (
                            <li key={what} className="grid gap-0.5">
                                <span className="font-medium">{what}</span>
                                <span className="text-xs text-muted-foreground">{where}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            {discardDialog}
        </form>
    );
}

/* ─────────────────────────────── Horario ─────────────────────────────── */

const MODES: { value: ScheduleMode; label: string }[] = [
    { value: 'continuous', label: 'Continuo' },
    { value: 'split', label: 'Con pausa' },
    { value: 'closed', label: 'Cerrado' },
];

function ScheduleForm({ contact, canEdit, onDirtyChange }: { contact: ContactData; canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
    const { data, setData, errors, processing, isDirty, submit, askDiscard, discardDialog } = useSection(
        { schedule: [...contact.schedule].sort((a, b) => a.day - b.day), schedule_summary: contact.schedule_summary ?? '' },
        route('admin.contact.schedule'),
        'el horario',
        onDirtyChange,
    );

    const update = (index: number, patch: Partial<ScheduleDay>) =>
        setData(
            'schedule',
            data.schedule.map((d, i) => {
                if (i !== index) return d;
                const next = { ...d, ...patch };
                // Al abrir un día o pasar a "con pausa" se proponen horas razonables
                if (next.mode !== 'closed' && !next.open) Object.assign(next, { open: '09:00', close: '18:00' });
                if (next.mode === 'split' && !next.open2) {
                    Object.assign(next, d.mode === 'continuous' ? { open2: '14:30', close2: next.close, close: '12:30' } : { open2: '14:30', close2: '19:00' });
                }
                return next;
            }),
        );

    const copyTo = (from: number, days: number[]) => {
        const source = data.schedule[from];
        setData(
            'schedule',
            data.schedule.map((d) => (days.includes(d.day) ? { ...source, day: d.day } : d)),
        );
        toast(`Horario de ${DAY_NAMES[source.day].toLowerCase()} copiado`);
    };

    const rowErrors = (i: number) =>
        Object.entries(errors)
            .filter(([k]) => k.startsWith(`schedule.${i}.`))
            .map(([, v]) => v);
    const fieldError = (i: number, key: string) => !!(errors as Record<string, string>)[`schedule.${i}.${key}`];

    const groups = groupSchedule(data.schedule);
    const summaryAuto = autoSummary(data.schedule);

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
            <fieldset disabled={!canEdit || processing} className="grid min-w-0 gap-6">
                <Section title="Horario por día" icon={<Clock className="h-4 w-4" />}>
                    <Hint>
                        <strong>Continuo</strong>: abre y cierra una vez. <strong>Con pausa</strong>: dos franjas, por ejemplo mañana y tarde con
                        el mediodía cerrado. Cada día puede tener su propio horario (p. ej. sábado más corto).
                    </Hint>
                    <ol className="grid divide-y rounded-lg border">
                        {data.schedule.map((d, i) => {
                            const rowErr = rowErrors(i);
                            return (
                                <li key={d.day} className={`grid gap-3 p-3 sm:p-4 ${rowErr.length ? 'bg-red-50/60 dark:bg-red-950/20' : ''}`}>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <span className="w-24 font-medium">{DAY_NAMES[d.day]}</span>
                                        <div role="radiogroup" aria-label={`Modo de ${DAY_NAMES[d.day]}`} className="inline-flex rounded-lg border p-0.5">
                                            {MODES.map((m) => (
                                                <button
                                                    key={m.value}
                                                    type="button"
                                                    role="radio"
                                                    aria-checked={d.mode === m.value}
                                                    onClick={() => update(i, { mode: m.value })}
                                                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
                                                        d.mode === m.value
                                                            ? m.value === 'closed'
                                                                ? 'bg-muted text-foreground'
                                                                : 'bg-primary text-primary-foreground'
                                                            : 'text-muted-foreground hover:bg-muted'
                                                    }`}
                                                >
                                                    {m.label}
                                                </button>
                                            ))}
                                        </div>
                                        {canEdit && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button type="button" variant="ghost" size="sm" className="ml-auto h-8 px-2 text-muted-foreground">
                                                        <Copy className="h-4 w-4" />
                                                        <span className="sr-only sm:not-sr-only sm:ml-1.5">Copiar</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Copiar el horario de {DAY_NAMES[d.day].toLowerCase()} a…</DropdownMenuLabel>
                                                    <DropdownMenuItem onSelect={() => copyTo(i, [1, 2, 3, 4, 5])}>Lunes a viernes</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => copyTo(i, [1, 2, 3, 4, 5, 6])}>Lunes a sábado</DropdownMenuItem>
                                                    <DropdownMenuItem onSelect={() => copyTo(i, [1, 2, 3, 4, 5, 6, 7])}>Todos los días</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>

                                    {d.mode !== 'closed' && (
                                        <div className="flex flex-wrap items-center gap-2 sm:pl-28">
                                            <TimeRange
                                                label={d.mode === 'split' ? 'Mañana' : 'Horario'}
                                                from={d.open}
                                                to={d.close}
                                                invalidFrom={fieldError(i, 'open')}
                                                invalidTo={fieldError(i, 'close')}
                                                onChange={(open, close) => update(i, { open, close })}
                                            />
                                            {d.mode === 'split' && (
                                                <>
                                                    <span className="hidden px-1 text-xs text-muted-foreground sm:inline">pausa</span>
                                                    <TimeRange
                                                        label="Tarde"
                                                        from={d.open2}
                                                        to={d.close2}
                                                        invalidFrom={fieldError(i, 'open2')}
                                                        invalidTo={fieldError(i, 'close2')}
                                                        onChange={(open2, close2) => update(i, { open2, close2 })}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {rowErr.map((msg) => (
                                        <p key={msg} className="text-sm text-red-500 sm:pl-28">
                                            {msg}
                                        </p>
                                    ))}
                                </li>
                            );
                        })}
                    </ol>
                </Section>

                <Section title="Resumen corto">
                    <Field label="Texto breve del horario" htmlFor="schedule_summary" error={errors.schedule_summary}>
                        <Input
                            id="schedule_summary"
                            value={data.schedule_summary}
                            maxLength={120}
                            placeholder={summaryAuto}
                            onChange={(e) => setData('schedule_summary', e.target.value)}
                        />
                        <Hint>
                            Se usa en la barra superior y en el showroom de inicio. Si lo dejas vacío se genera solo: «{summaryAuto}».
                        </Hint>
                    </Field>
                </Section>

                {canEdit && <SaveBar label="Guardar horario" processing={processing} isDirty={isDirty} onDiscard={askDiscard} />}
            </fieldset>

            <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa</p>
                <div className="grid gap-3 rounded-2xl border border-[#fde3cf] bg-[#fff4ec] p-5 text-[#191c1f]">
                    <span className="text-lg font-bold">{contact.hours_title || 'Horario de atención'}</span>
                    {groups.map((g) => (
                        <div key={g.days.join('-')} className="flex justify-between gap-3 border-b border-[#fde3cf] pb-2.5 text-sm">
                            <span className="text-[#3d4247]">{g.label}</span>
                            {g.closed ? (
                                <span className="font-semibold text-[#c2410c]">Cerrado</span>
                            ) : (
                                <span className="flex flex-col text-right font-semibold tabular-nums">
                                    {g.hours.map((h) => (
                                        <span key={h} className="whitespace-nowrap">
                                            {h}
                                        </span>
                                    ))}
                                </span>
                            )}
                        </div>
                    ))}
                    {contact.hours_note && <p className="text-xs text-[#6b7076]">{contact.hours_note}</p>}
                </div>
                <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                    Barra superior: <span className="font-medium text-foreground">{data.schedule_summary || summaryAuto}</span>
                </p>
            </aside>
            {discardDialog}
        </form>
    );
}

function TimeRange({
    label,
    from,
    to,
    invalidFrom,
    invalidTo,
    onChange,
}: {
    label: string;
    from: string | null;
    to: string | null;
    invalidFrom?: boolean;
    invalidTo?: boolean;
    onChange: (from: string, to: string) => void;
}) {
    const input = 'h-9 w-[7.25rem] tabular-nums';
    return (
        <div className="flex items-center gap-1.5">
            <span className="w-14 text-xs text-muted-foreground sm:w-auto">{label}</span>
            <Input
                type="time"
                aria-label={`${label}: abre`}
                value={from ?? ''}
                aria-invalid={invalidFrom || undefined}
                onChange={(e) => onChange(e.target.value, to ?? '')}
                className={input}
            />
            <span className="text-muted-foreground">–</span>
            <Input
                type="time"
                aria-label={`${label}: cierra`}
                value={to ?? ''}
                aria-invalid={invalidTo || undefined}
                onChange={(e) => onChange(from ?? '', e.target.value)}
                className={input}
            />
        </div>
    );
}

/* ─────────────────────────────── Textos ─────────────────────────────── */

const TEXT_KEYS = ['hero_title', 'hero_subtitle', 'hours_title', 'hours_note'] as const;

function TextsForm({ contact, canEdit, onDirtyChange }: { contact: ContactData; canEdit: boolean; onDirtyChange: (dirty: boolean) => void }) {
    const initial = {
        ...(Object.fromEntries(TEXT_KEYS.map((k) => [k, contact[k] ?? ''])) as Record<(typeof TEXT_KEYS)[number], string>),
        show_map: contact.show_map ?? true,
    };
    const { data, setData, errors, processing, isDirty, submit, askDiscard, discardDialog } = useSection(
        initial,
        route('admin.contact.texts'),
        'los textos',
        onDirtyChange,
    );

    const input = (key: (typeof TEXT_KEYS)[number], label: string, max: number, opts: { area?: boolean; placeholder?: string } = {}) => (
        <Field label={label} htmlFor={key} error={errors[key]}>
            {opts.area ? (
                <Textarea id={key} rows={3} value={data[key]} placeholder={opts.placeholder} onChange={(e) => setData(key, e.target.value)} />
            ) : (
                <Input id={key} value={data[key]} maxLength={max} placeholder={opts.placeholder} onChange={(e) => setData(key, e.target.value)} />
            )}
            <div className={`text-right text-xs ${data[key].length > max ? 'text-red-500' : 'text-muted-foreground'}`}>
                {data[key].length}/{max}
            </div>
        </Field>
    );

    return (
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
            <fieldset disabled={!canEdit || processing} className="grid min-w-0 gap-6">
                <Section title="Encabezado">
                    {input('hero_title', 'Título principal', 80)}
                    {input('hero_subtitle', 'Descripción', 300, { area: true, placeholder: 'Opcional' })}
                </Section>
                <div className="grid gap-6 xl:grid-cols-2">
                    <Section title="Mapa" icon={<MapPin className="h-4 w-4" />}>
                        <div className="flex items-start justify-between gap-4">
                            <Label htmlFor="show_map" className="grid gap-1 font-normal">
                                <span className="font-medium">Mostrar mapa del showroom</span>
                                <Hint>
                                    Google Maps con la dirección de la pestaña Datos, a la izquierda del horario. Si lo desactivas, los datos de
                                    contacto y el horario quedan centrados.
                                </Hint>
                            </Label>
                            <Switch id="show_map" checked={data.show_map} onCheckedChange={(v) => setData('show_map', v)} />
                        </div>
                    </Section>
                    <Section title="Horario">
                        {input('hours_title', 'Título del recuadro', 60)}
                        {input('hours_note', 'Nota al pie', 200, { area: true, placeholder: 'Opcional. Ej.: Feriados nacionales: cerrado.' })}
                    </Section>
                </div>
                {canEdit && <SaveBar label="Guardar textos" processing={processing} isDirty={isDirty} onDiscard={askDiscard} />}
            </fieldset>

            {/* Vista previa con la misma estética de la web */}
            <aside className="min-w-0 lg:sticky lg:top-4 lg:self-start">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa</p>
                <div className="overflow-hidden rounded-2xl border bg-gradient-to-br from-[#fff4ec] via-white to-[#fff] p-5 text-center text-[#191c1f]">
                    <h2 className="text-[30px] font-bold leading-none tracking-[-.04em] [text-wrap:balance]">{data.hero_title || 'Título'}</h2>
                    {data.hero_subtitle && <p className="mt-3 text-[13px] leading-relaxed text-[#3d4247]">{data.hero_subtitle}</p>}
                </div>
                <div className={`mt-3 flex gap-3 ${data.show_map ? '' : 'justify-center'}`}>
                    {data.show_map && (
                        <div className="flex min-h-24 flex-1 items-center justify-center rounded-2xl border bg-[#f4f5f6] text-xs text-[#6b7076]">
                            <MapPin className="mr-1 h-4 w-4 text-[#c2410c]" />
                            Mapa
                        </div>
                    )}
                    <div className="w-1/2 rounded-2xl border border-[#fde3cf] bg-[#fff4ec] p-4 text-[#191c1f]">
                        <p className="font-bold">{data.hours_title || 'Horario'}</p>
                        {data.hours_note && <p className="mt-1 text-xs text-[#6b7076]">{data.hours_note}</p>}
                    </div>
                </div>
            </aside>
            {discardDialog}
        </form>
    );
}

/* ─────────────────────────────── Historial ─────────────────────────────── */

function HistoryList({ logs, actions, fields, filters }: Pick<Props, 'logs' | 'actions' | 'fields' | 'filters'>) {
    const visit = (params: Record<string, string | number>) =>
        router.get(
            route('admin.contact.index'),
            { tab: 'history', action: filters.action || undefined, ...params },
            { preserveScroll: true, preserveState: true, only: ['logs', 'filters'] },
        );

    const fieldLabel = (field: string | null) => {
        const day = field?.match(/^day_(\d)$/);
        if (day) return DAY_NAMES[Number(day[1])];
        return field ? (fields[field] ?? field) : '—';
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
                            <div className="grid min-w-0 gap-2 text-sm">
                                <p className="min-w-0 whitespace-pre-line break-words rounded-lg bg-red-50 px-3 py-2 text-red-900 line-through decoration-red-300 dark:bg-red-950/40 dark:text-red-200">
                                    {String(log.old_value?.v ?? '') || <em className="no-underline">vacío</em>}
                                </p>
                                <p className="min-w-0 whitespace-pre-line break-words rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                                    {String(log.new_value?.v ?? '') || <em>vacío</em>}
                                </p>
                            </div>
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
