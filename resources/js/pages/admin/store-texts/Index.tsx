import { useState, type FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { ExternalLink, Loader2, MessageCircle, Package, RotateCcw, Save, ShoppingCart, Undo2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { usePermissions } from '@/hooks/use-permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/admin/form-shell';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes';
import { type Editor, flash, formatDate } from '../about/_shared';

interface StoreField {
    name: string;
    label: string;
    max: number;
    default: string;
}

interface StoreGroup {
    key: string;
    title: string;
    fields: StoreField[];
}

interface Props {
    groups: StoreGroup[];
    texts: Record<string, string>;
    updatedAt: string | null;
    editor: Editor | null;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Textos de la tienda', href: route('admin.store-texts.index') },
];

const GROUP_INFO: Record<string, { icon: typeof ShoppingCart; hint: string }> = {
    cart: { icon: ShoppingCart, hint: 'Carrito lateral y página /carrito. La dirección de retiro sale de Admin › Contacto.' },
    product: { icon: Package, hint: 'Ventajas bajo el botón de compra y datos que se muestran cuando el producto no tiene descripción o características.' },
    whatsapp: { icon: MessageCircle, hint: 'Primera línea de los mensajes que se abren en WhatsApp. El detalle del pedido o del producto se añade solo.' },
};

export default function StoreTextsIndex({ groups, texts, updatedAt, editor }: Props) {
    const { hasPermission } = usePermissions();
    const canEdit = hasPermission('edit_store_texts');
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const { data, setData, setDefaults, put, processing, errors, isDirty, reset } = useForm<Record<string, string>>({ ...texts });
    const leave = useUnsavedChangesGuard(isDirty);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.store-texts.update'), {
            preserveScroll: true,
            onSuccess: (page) => {
                flash(page);
                const saved = { ...(page.props as unknown as Props).texts };
                setData(saved);
                setDefaults(saved);
            },
            onError: (errs) =>
                toast.error('No se pudieron guardar los textos', { description: Object.values(errs)[0] ?? 'Revisa los campos marcados en rojo.' }),
        });
    };

    const discard = () => {
        reset();
        setConfirmDiscard(false);
        toast('Cambios descartados', { description: 'Los textos volvieron a como están publicados en la web.' });
    };

    if (!hasPermission('view_store_texts')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Textos de la tienda" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <Card>
                    <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="grid gap-1">
                            <CardTitle className="text-xl font-medium">Textos de la tienda</CardTitle>
                            <CardDescription>
                                Textos del carrito, la ficha de producto y los mensajes de WhatsApp. Teléfono, dirección y horario se editan en Contacto.
                                {updatedAt && (
                                    <span className="block pt-1 text-xs">
                                        Última edición: {formatDate(updatedAt)}
                                        {editor && <> · {editor.name}</>}
                                    </span>
                                )}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild className="self-start sm:self-auto">
                            <a href="/carrito" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Ver web
                            </a>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {!canEdit && (
                            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                Solo lectura: tu rol no tiene el permiso <code>edit_store_texts</code>.
                            </p>
                        )}

                        <form onSubmit={submit}>
                            <fieldset disabled={!canEdit || processing} className="grid min-w-0 gap-6">
                                {groups.map((group) => {
                                    const info = GROUP_INFO[group.key];
                                    const Icon = info?.icon ?? MessageCircle;
                                    return (
                                        <section key={group.key} className="grid gap-4 rounded-xl border p-4 sm:p-5">
                                            <div className="grid gap-1">
                                                <h2 className="flex items-center gap-2 font-medium">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {group.title}
                                                </h2>
                                                {info && <p className="text-sm text-muted-foreground">{info.hint}</p>}
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                {group.fields.map((field) => {
                                                    const value = data[field.name] ?? '';
                                                    const changed = value !== field.default;
                                                    return (
                                                        <Field key={field.name} label={field.label} htmlFor={field.name} error={errors[field.name]}>
                                                            <Input
                                                                id={field.name}
                                                                value={value}
                                                                maxLength={field.max}
                                                                onChange={(e) => setData(field.name, e.target.value)}
                                                            />
                                                            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                                                {changed && canEdit ? (
                                                                    <button
                                                                        type="button"
                                                                        className="inline-flex items-center gap-1 hover:text-foreground"
                                                                        title={`Original: ${field.default}`}
                                                                        onClick={() => setData(field.name, field.default)}
                                                                    >
                                                                        <Undo2 className="h-3 w-3" />
                                                                        Usar el texto original
                                                                    </button>
                                                                ) : (
                                                                    <span />
                                                                )}
                                                                <span className="tabular-nums">
                                                                    {value.length}/{field.max}
                                                                </span>
                                                            </div>
                                                        </Field>
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    );
                                })}

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
                        </form>
                    </CardContent>
                </Card>
            </div>

            <ConfirmDialog
                open={confirmDiscard}
                tone="danger"
                title="¿Descartar los cambios?"
                description="Los textos volverán a como están publicados en la web. Esta acción no se puede deshacer."
                confirmLabel="Descartar cambios"
                cancelLabel="Seguir editando"
                onConfirm={discard}
                onCancel={() => setConfirmDiscard(false)}
            />
            <ConfirmDialog
                open={leave.open}
                title="Tienes cambios sin guardar"
                description="Si sales ahora, se perderán los cambios de los textos. Guárdalos antes de continuar o sal sin guardar."
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                onConfirm={leave.confirm}
                onCancel={leave.cancel}
            />
        </AppLayout>
    );
}
