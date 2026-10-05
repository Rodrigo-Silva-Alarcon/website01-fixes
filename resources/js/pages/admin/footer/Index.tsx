import { useEffect, useRef, useState, type FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { ExternalLink, ImageIcon, Loader2, Moon, RotateCcw, Save, Sparkles, Sun, Trash2, Upload } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/admin/form-shell';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes';
import { type Editor, flash, formatDate } from '../about/_shared';

interface FooterData {
    logo_light_url: string | null;
    logo_dark_url: string | null;
    logo_transparent: boolean;
    logo_alt: string;
    copyright: string;
    credits: string | null;
    updated_at: string | null;
    editor: Editor | null;
}

interface Props {
    footer: FooterData;
    defaultLogo: string;
    yearToken: string;
}

type Mode = 'light' | 'dark';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Footer', href: route('admin.footer.index') },
];

/** Valores del formulario a partir de lo publicado (sin archivos pendientes). */
const formValues = (footer: FooterData) => ({
    logo_light: null as File | null,
    logo_dark: null as File | null,
    remove_logo_light: false,
    remove_logo_dark: false,
    logo_transparent: footer.logo_transparent,
    logo_alt: footer.logo_alt ?? '',
    copyright: footer.copyright ?? '',
    credits: footer.credits ?? '',
});

const MAX_SIZE = 4 * 1024 * 1024;
const ACCEPT = 'image/png,image/webp,image/jpeg';

/** Mismos fondos que el footer de la web en cada modo (ver storefront-dark.css). */
const THEME = {
    light: { footer: '#f6f7f8', pill: '#ffffff', border: '#eceef0', text: '#6b7076' },
    dark: { footer: '#12161a', pill: '#1d2227', border: '#2a3036', text: '#a8aeb4' },
} as const;

/**
 * ¿La imagen tiene fondo transparente? Se revisa el borde de la imagen: si la mayoría de
 * los píxeles del contorno son transparentes, el logo se puede usar sobre cualquier fondo.
 */
async function hasTransparentBackground(file: File): Promise<boolean> {
    if (file.type === 'image/jpeg') return false;

    const url = URL.createObjectURL(file);
    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
        const scale = Math.min(1, 200 / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) return false;
        context.drawImage(image, 0, 0, width, height);
        const { data } = context.getImageData(0, 0, width, height);

        let edge = 0;
        let clear = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) continue;
                edge++;
                if (data[(y * width + x) * 4 + 3] < 16) clear++;
            }
        }

        return edge > 0 && clear / edge >= 0.5;
    } catch {
        return false;
    } finally {
        URL.revokeObjectURL(url);
    }
}

export default function FooterIndex({ footer, defaultLogo, yearToken }: Props) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('edit_footer');
    const [confirmDiscard, setConfirmDiscard] = useState(false);
    const [previews, setPreviews] = useState<Record<Mode, string | null>>({ light: null, dark: null });
    const [detected, setDetected] = useState<boolean | null>(null);
    const [formKey, setFormKey] = useState(0);

    const { data, setData, setDefaults, post, processing, errors, isDirty, reset } = useForm(formValues(footer));

    const leave = useUnsavedChangesGuard(isDirty);

    // Libera las vistas previas locales al reemplazarlas o salir
    useEffect(() => () => Object.values(previews).forEach((url) => url && URL.revokeObjectURL(url)), [previews]);

    /** URL que se verá en la web para cada modo con lo que hay en el formulario. */
    const current = (mode: Mode): string | null => {
        if (previews[mode]) return previews[mode];
        if (data[`remove_logo_${mode}`]) return null;
        return mode === 'light' ? footer.logo_light_url : footer.logo_dark_url;
    };
    const lightUrl = current('light') ?? defaultLogo;
    const darkUrl = data.logo_transparent ? null : current('dark');

    const pickFile = async (mode: Mode, file: File | undefined) => {
        if (!file) return;
        if (!ACCEPT.split(',').includes(file.type)) {
            toast.error('Formato no admitido', { description: 'Usa una imagen PNG, WebP o JPG.' });
            return;
        }
        if (file.size > MAX_SIZE) {
            toast.error('La imagen es muy pesada', { description: 'El logo no debe superar los 4 MB.' });
            return;
        }

        setData((prev) => ({ ...prev, [`logo_${mode}`]: file, [`remove_logo_${mode}`]: false }));
        setPreviews((prev) => ({ ...prev, [mode]: URL.createObjectURL(file) }));

        // El sistema detecta si el logo claro tiene fondo transparente y marca la casilla
        if (mode === 'light') {
            const transparent = await hasTransparentBackground(file);
            setDetected(transparent);
            setData('logo_transparent', transparent);
            toast(transparent ? 'Fondo transparente detectado' : 'La imagen tiene fondo', {
                description: transparent
                    ? 'Se usará esta misma imagen en modo claro y oscuro. Puedes desmarcar la casilla si prefieres subir otra para el modo oscuro.'
                    : 'Sube también una versión para el modo oscuro, o se mostrará esta sobre una pastilla blanca.',
            });
        }
    };

    const removeLogo = (mode: Mode) => {
        setData((prev) => ({ ...prev, [`logo_${mode}`]: null, [`remove_logo_${mode}`]: true }));
        setPreviews((prev) => ({ ...prev, [mode]: null }));
        if (mode === 'light') setDetected(null);
    };

    const clearLocal = () => {
        setPreviews({ light: null, dark: null });
        setDetected(null);
        // Reinicia los <input type="file"> para poder volver a elegir el mismo archivo
        setFormKey((key) => key + 1);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.footer.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                flash(page);
                // Lo publicado pasa a ser la nueva base: sin archivos ni marcas de "quitar" pendientes
                const saved = formValues((page.props as unknown as Props).footer);
                setData(saved);
                setDefaults(saved);
                clearLocal();
            },
            onError: (errs) =>
                toast.error('No se pudo guardar el footer', { description: Object.values(errs)[0] ?? 'Revisa los campos marcados en rojo.' }),
        });
    };

    const discard = () => {
        reset();
        clearLocal();
        setConfirmDiscard(false);
        toast('Cambios descartados', { description: 'El footer volvió a como está publicado en la web.' });
    };

    if (!hasPermission('view_footer')) {
        return null;
    }

    const year = String(new Date().getFullYear());
    const copyrightPreview = data.copyright.split(yearToken).join(year);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Footer" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid gap-1">
                            <CardTitle className="text-xl font-medium">Footer</CardTitle>
                            <CardDescription>
                                Logo del pie de página para modo claro y oscuro, y los textos de la franja inferior.
                                {footer.updated_at && (
                                    <span className="block pt-1 text-xs">
                                        Última edición: {formatDate(footer.updated_at)}
                                        {footer.editor && <> · {footer.editor.name}</>}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                            <a href="/" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver web
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!canEdit && (
                            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                Solo lectura: tu rol no tiene el permiso <code>edit_footer</code>.
                            </p>
                        )}

                        <form key={formKey} onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
                            <fieldset disabled={!canEdit || processing} className="grid min-w-0 content-start gap-6">
                                <section className="grid gap-4 rounded-xl border p-4 sm:p-5">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Logo</h3>
                                    </div>

                                    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3">
                                        <Checkbox
                                            id="logo_transparent"
                                            checked={data.logo_transparent}
                                            onCheckedChange={(value) => setData('logo_transparent', value === true)}
                                            className="mt-0.5"
                                        />
                                        <div className="grid gap-1">
                                            <Label htmlFor="logo_transparent" className="cursor-pointer leading-snug">
                                                El logo tiene fondo transparente
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Con fondo transparente basta una sola imagen: se usa igual en modo claro y oscuro y no cambia.
                                                Se marca sola al subir el logo si detectamos transparencia.
                                            </p>
                                            {detected !== null && (
                                                <p className="flex items-center gap-1 text-xs font-medium text-orange-600">
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                    {detected ? 'Detectado: la imagen tiene fondo transparente.' : 'Detectado: la imagen tiene fondo sólido.'}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <LogoSlot
                                            mode="light"
                                            title={data.logo_transparent ? 'Logo (ambos modos)' : 'Logo para modo claro'}
                                            url={current('light')}
                                            placeholder={defaultLogo}
                                            placeholderNote="Se usa el logo por defecto del sitio."
                                            error={errors.logo_light}
                                            canEdit={canEdit}
                                            onPick={(file) => pickFile('light', file)}
                                            onRemove={() => removeLogo('light')}
                                        />
                                        {data.logo_transparent ? (
                                            <div className="grid content-center gap-2 rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                                                <Moon className="mx-auto h-5 w-5" />
                                                <p>
                                                    En modo oscuro se muestra la misma imagen.
                                                    {footer.logo_dark_url && !data.remove_logo_dark && (
                                                        <span className="block pt-1 text-xs">
                                                            El logo oscuro guardado se conserva y vuelve a usarse si desmarcas la casilla.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        ) : (
                                            <LogoSlot
                                                mode="dark"
                                                title="Logo para modo oscuro"
                                                url={current('dark')}
                                                placeholder={lightUrl}
                                                placeholderNote="Sin versión oscura: se muestra el logo claro sobre una pastilla blanca."
                                                error={errors.logo_dark}
                                                canEdit={canEdit}
                                                onPick={(file) => pickFile('dark', file)}
                                                onRemove={() => removeLogo('dark')}
                                            />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">PNG, WebP o JPG de hasta 4 MB. Se muestra a 72 px de alto; para fondo transparente usa PNG o WebP.</p>

                                    <Field label="Texto alternativo del logo" htmlFor="logo_alt" error={errors.logo_alt}>
                                        <Input id="logo_alt" value={data.logo_alt} maxLength={150} onChange={(e) => setData('logo_alt', e.target.value)} />
                                    </Field>
                                </section>

                                <section className="grid gap-4 rounded-xl border p-4 sm:p-5">
                                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Franja inferior</h3>
                                    <Field label="Derechos reservados" htmlFor="copyright" error={errors.copyright}>
                                        <Input id="copyright" value={data.copyright} maxLength={200} onChange={(e) => setData('copyright', e.target.value)} />
                                        <p className="text-xs text-muted-foreground">
                                            Escribe <code className="rounded bg-muted px-1">{yearToken}</code> para mostrar el año actual automáticamente.
                                        </p>
                                    </Field>
                                    <Field label="Créditos" htmlFor="credits" error={errors.credits}>
                                        <Input
                                            id="credits"
                                            value={data.credits}
                                            maxLength={120}
                                            placeholder="Opcional: déjalo vacío para ocultarlo"
                                            onChange={(e) => setData('credits', e.target.value)}
                                        />
                                    </Field>
                                </section>

                                {canEdit && (
                                    <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                                        <Button type="submit" disabled={processing || !isDirty}>
                                            {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Guardar footer
                                        </Button>
                                        <Button type="button" variant="outline" disabled={processing || !isDirty} onClick={() => setConfirmDiscard(true)}>
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Descartar
                                        </Button>
                                        {isDirty && <span className="text-sm text-orange-600">Hay cambios sin guardar</span>}
                                    </div>
                                )}
                            </fieldset>

                            {/* Vista previa del footer en ambos modos */}
                            <aside className="grid min-w-0 content-start gap-3 lg:sticky lg:top-4 lg:self-start">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Vista previa</p>
                                <FooterPreview
                                    mode="light"
                                    url={lightUrl}
                                    themed={false}
                                    alt={data.logo_alt}
                                    copyright={copyrightPreview}
                                    credits={data.credits}
                                />
                                <FooterPreview
                                    mode="dark"
                                    url={darkUrl ?? lightUrl}
                                    themed={darkUrl !== null || (data.logo_transparent && current('light') !== null)}
                                    alt={data.logo_alt}
                                    copyright={copyrightPreview}
                                    credits={data.credits}
                                />
                            </aside>
                        </form>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmDiscard}
                tone="danger"
                title="¿Descartar los cambios del footer?"
                description="El logo y los textos volverán a como están publicados en la web. Esta acción no se puede deshacer."
                confirmLabel="Descartar cambios"
                cancelLabel="Seguir editando"
                onConfirm={discard}
                onCancel={() => setConfirmDiscard(false)}
            />
            <ConfirmDialog
                open={leave.open}
                title="Tienes cambios sin guardar"
                description="Si sales ahora, se perderán los cambios del footer. Guárdalos antes de continuar o sal sin guardar."
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                onConfirm={leave.confirm}
                onCancel={leave.cancel}
            />
        </AppLayout>
    );
}

/* ─────────────────────────────── Logo ─────────────────────────────── */

interface LogoSlotProps {
    mode: Mode;
    title: string;
    url: string | null;
    placeholder: string;
    placeholderNote: string;
    error?: string;
    canEdit: boolean;
    onPick: (file: File | undefined) => void;
    onRemove: () => void;
}

function LogoSlot({ mode, title, url, placeholder, placeholderNote, error, canEdit, onPick, onRemove }: LogoSlotProps) {
    const input = useRef<HTMLInputElement>(null);
    const theme = THEME[mode];
    const Icon = mode === 'light' ? Sun : Moon;

    return (
        <div className="grid content-start gap-2">
            <Label htmlFor={`logo_${mode}`} className="flex items-center gap-1.5">
                <Icon className="h-4 w-4" />
                {title}
            </Label>
            {/* Fondo a cuadros: deja ver si la imagen es transparente */}
            <div
                className="flex h-32 items-center justify-center rounded-xl border p-4"
                style={{
                    backgroundColor: theme.footer,
                    backgroundImage: `conic-gradient(${mode === 'light' ? '#e7e9ec' : '#1b2025'} 25%, transparent 0 50%, ${mode === 'light' ? '#e7e9ec' : '#1b2025'} 0 75%, transparent 0)`,
                    backgroundSize: '16px 16px',
                }}
            >
                <img
                    src={url ?? placeholder}
                    alt=""
                    className={`max-h-full max-w-full object-contain ${url ? '' : 'opacity-40 grayscale'}`}
                />
            </div>
            {!url && <p className="text-xs text-muted-foreground">{placeholderNote}</p>}
            <input
                ref={input}
                id={`logo_${mode}`}
                type="file"
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => onPick(e.target.files?.[0])}
            />
            {canEdit && (
                <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        {url ? 'Cambiar' : 'Subir imagen'}
                    </Button>
                    {url && (
                        <Button type="button" variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={onRemove}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Quitar
                        </Button>
                    )}
                </div>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

/* ─────────────────────────────── Vista previa ─────────────────────────────── */

interface FooterPreviewProps {
    mode: Mode;
    url: string;
    themed: boolean;
    alt: string;
    copyright: string;
    credits: string;
}

function FooterPreview({ mode, url, themed, alt, copyright, credits }: FooterPreviewProps) {
    const theme = THEME[mode];
    // En la web, la pastilla es blanca salvo que el logo siga el tema (transparente o con versión oscura)
    const pill = mode === 'dark' && themed ? theme.pill : '#ffffff';
    const border = mode === 'dark' && themed ? theme.border : '#eceef0';

    return (
        <div className="overflow-hidden rounded-2xl border" style={{ backgroundColor: theme.footer, borderColor: theme.border }}>
            <div className="flex items-center justify-between gap-3 px-4 pt-4" style={{ color: theme.text }}>
                <span className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide">
                    {mode === 'light' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    {mode === 'light' ? 'Modo claro' : 'Modo oscuro'}
                </span>
                <span className="rounded-full bg-[#fa8232] px-2.5 py-0.5 text-[10px] text-white">WhatsApp</span>
            </div>
            <div className="px-4 py-4">
                <div className="inline-flex rounded-[10px] border px-3 py-2" style={{ backgroundColor: pill, borderColor: border }}>
                    <img src={url} alt={alt} className="h-10 w-auto object-contain" />
                </div>
            </div>
            <div className="grid gap-1 border-t px-4 py-3 text-[11px]" style={{ borderColor: theme.border, color: theme.text }}>
                <span>{copyright}</span>
                {credits && <span>{credits}</span>}
            </div>
        </div>
    );
}
