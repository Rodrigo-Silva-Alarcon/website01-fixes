import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/use-permissions';
import { useUnsavedChangesGuard } from '@/hooks/use-unsaved-changes';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    AlertTriangle,
    ArrowLeft,
    Check,
    CheckCircle2,
    Clock3,
    History,
    Loader2,
    MessageCircle,
    Minus,
    PackagePlus,
    Pencil,
    Plus,
    Save,
    Search,
    ShoppingBag,
    Trash2,
    Undo2,
    UserRound,
    XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { flash } from '../about/_shared';
import { dateTime, money, ProductThumb, StatusBadge, type OrderStatus } from './_shared';

interface OrderItem {
    id: number | null;
    product_id: number;
    name: string;
    quantity: number;
    unit_price: number;
    money: string;
    image: string | null;
    stock: number | null;
    current_price: number | null;
}

interface Order {
    id: number;
    code: string;
    reference: string | null;
    status: OrderStatus;
    customer_name: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    notes: string | null;
    money: string;
    total: number;
    created_at: string | null;
    edited_at: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    cancel_reason: string | null;
    editor: string | null;
    replacement: { id: number; code: string } | null;
    items: OrderItem[];
}

interface ProductOption {
    id: number;
    name: string;
    brand: string | null;
    image: string | null;
    price: number;
    regular_price: number;
    on_offer: boolean;
    stock: number;
    money: string;
}

type Line = OrderItem & { key: string };

const MAX_QTY = 999;

export default function Show({ order }: { order: Order }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel de Control', href: route('admin.dashboard') },
        { title: 'Pedidos', href: route('admin.orders.index') },
        { title: order.code, href: route('admin.orders.show', order.id) },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Pedido ${order.code}`} />
            {/* Tras guardar, confirmar o cancelar se vuelve a montar con los datos del servidor */}
            <OrderDetail key={`${order.id}-${order.status}-${order.edited_at}`} order={order} />
        </AppLayout>
    );
}

function OrderDetail({ order }: { order: Order }) {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('edit_orders');
    const editable = canManage && order.status === 'pending';

    const form = useForm({
        items: order.items.map((item): Line => ({ ...item, key: String(item.id) })),
        customer_name: order.customer_name ?? '',
        customer_phone: order.customer_phone ?? '',
        notes: order.notes ?? '',
    });
    const { data, setData, isDirty, processing, errors } = form;
    const guard = useUnsavedChangesGuard(editable && isDirty);

    const [picker, setPicker] = useState(false);
    const [dialog, setDialog] = useState<'confirm' | 'cancel' | null>(null);
    const [reason, setReason] = useState('');
    const [busy, setBusy] = useState(false);

    const totals = useMemo(() => {
        const byMoney: Record<string, number> = {};
        for (const line of data.items) {
            byMoney[line.money] = (byMoney[line.money] ?? 0) + Math.round(line.unit_price * 100) * line.quantity;
        }
        return byMoney;
    }, [data.items]);
    const units = data.items.reduce((sum, line) => sum + line.quantity, 0);
    const shortages = data.items.filter((line) => line.stock === null || line.quantity > line.stock);

    const setQty = (key: string, quantity: number) =>
        setData(
            'items',
            data.items.map((line) => (line.key === key ? { ...line, quantity: Math.min(MAX_QTY, Math.max(1, Math.floor(quantity) || 1)) } : line)),
        );

    const removeLine = (key: string) => setData('items', data.items.filter((line) => line.key !== key));

    const addProduct = (product: ProductOption) => {
        const existing = data.items.find((line) => line.product_id === product.id);
        if (existing) {
            setQty(existing.key, existing.quantity + 1);
            toast.success(`${product.name}: cantidad ${existing.quantity + 1}`);
            return;
        }
        setData('items', [
            ...data.items,
            {
                id: null,
                key: `new-${product.id}`,
                product_id: product.id,
                name: product.name,
                quantity: 1,
                unit_price: product.price,
                money: product.money,
                image: product.image,
                stock: product.stock,
                current_price: product.price,
            },
        ]);
        toast.success(`${product.name} agregado al pedido`);
    };

    const save = () => {
        form.transform((d) => ({
            items: d.items.map(({ id, product_id, quantity }) => ({ id, product_id, quantity })),
            customer_name: d.customer_name.trim() || null,
            customer_phone: d.customer_phone.trim() || null,
            notes: d.notes.trim() || null,
        }));
        form.put(route('admin.orders.update', order.id), {
            preserveScroll: true,
            onSuccess: (page) => flash(page),
            onError: (errs) => toast.error('No se pudo guardar el pedido', { description: Object.values(errs)[0] }),
        });
    };

    const runAction = (action: 'confirm' | 'cancel') => {
        setBusy(true);
        router.post(route(`admin.orders.${action}`, order.id), action === 'cancel' ? { reason: reason.trim() || null } : {}, {
            preserveScroll: true,
            onSuccess: (page) => flash(page),
            onFinish: () => {
                setBusy(false);
                setDialog(null);
            },
        });
    };

    const phoneDigits = data.customer_phone.replace(/\D/g, '');

    return (
        <div className={cn('@container flex h-full min-w-0 flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4', editable && isDirty && 'pb-24 sm:pb-4')}>
            {/* Encabezado */}
            <div className="flex flex-col gap-3 @3xl:flex-row @3xl:items-start @3xl:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <Button variant="outline" size="icon" asChild className="flex-none">
                        <Link href={route('admin.orders.index')} aria-label="Volver a pedidos">
                            <ArrowLeft className="size-4" />
                        </Link>
                    </Button>
                    <div className="grid min-w-0 gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-xl font-semibold tracking-wide sm:text-2xl">Pedido {order.code}</h1>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">Recibido por WhatsApp el {dateTime(order.created_at)}</p>
                    </div>
                </div>

                {canManage && order.status !== 'cancelled' && (
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                        <Button
                            variant="outline"
                            className={cn('text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950', order.status === 'confirmed' && 'col-span-2')}
                            onClick={() => {
                                setReason('');
                                setDialog('cancel');
                            }}
                            disabled={busy}
                        >
                            <XCircle className="size-4" />
                            {order.status === 'confirmed' ? 'Cancelar venta' : 'Cancelar pedido'}
                        </Button>
                        {order.status === 'pending' && (
                            <Button
                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                onClick={() => setDialog('confirm')}
                                disabled={busy || isDirty}
                                title={isDirty ? 'Guarda los cambios antes de confirmar' : undefined}
                            >
                                <Check className="size-4" />
                                Confirmar pedido
                            </Button>
                        )}
                    </div>
                )}
            </div>

            <StatusBanner order={order} canManage={canManage} />

            <div className="grid min-w-0 gap-4 @5xl:grid-cols-3 @5xl:items-start">
                {/* Productos */}
                <Card className="@container/items min-w-0 gap-0 overflow-hidden py-0 @5xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="size-4 text-muted-foreground" />
                            <h2 className="font-medium">Productos</h2>
                            <span className="rounded-full bg-muted px-2 text-xs tabular-nums">{data.items.length}</span>
                        </div>
                        {editable && (
                            <Button size="sm" variant="outline" onClick={() => setPicker(true)}>
                                <PackagePlus className="size-4" />
                                Agregar producto
                            </Button>
                        )}
                    </div>

                    {errors.items && <p className="border-b bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{errors.items}</p>}

                    {data.items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
                            <ShoppingBag className="size-6" />
                            El pedido no tiene productos. Agrega al menos uno para guardarlo.
                        </div>
                    ) : (
                        <ul className="divide-y">
                            {data.items.map((line) => (
                                <ItemRow
                                    key={line.key}
                                    line={line}
                                    editable={editable}
                                    canRemove={data.items.length > 1}
                                    checkStock={order.status === 'pending'}
                                    onQty={(q) => setQty(line.key, q)}
                                    onRemove={() => removeLine(line.key)}
                                />
                            ))}
                        </ul>
                    )}

                    <div className="grid gap-1 border-t bg-muted/30 px-4 py-4 sm:px-5">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>
                                {data.items.length} {data.items.length === 1 ? 'producto' : 'productos'} · {units} {units === 1 ? 'unidad' : 'unidades'}
                            </span>
                            {isDirty && editable && <span className="text-orange-700 dark:text-orange-400">Total sin guardar</span>}
                        </div>
                        {Object.entries(totals).map(([currency, cents]) => (
                            <div key={currency} className="flex items-baseline justify-between gap-3">
                                <span className="text-base font-semibold">Total</span>
                                <span className="text-2xl font-bold tabular-nums">{money(cents / 100, currency)}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid min-w-0 gap-4 @3xl:grid-cols-2 @5xl:grid-cols-1">
                    {/* Cliente */}
                    <Card className="gap-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base font-medium">
                                <UserRound className="size-4 text-muted-foreground" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {editable ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer_name">Nombre</Label>
                                        <Input
                                            id="customer_name"
                                            value={data.customer_name}
                                            maxLength={120}
                                            placeholder="Nombre del cliente"
                                            onChange={(e) => setData('customer_name', e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="customer_phone">Teléfono / WhatsApp</Label>
                                        <Input
                                            id="customer_phone"
                                            type="tel"
                                            inputMode="tel"
                                            value={data.customer_phone}
                                            maxLength={40}
                                            placeholder="+591 70000000"
                                            onChange={(e) => setData('customer_phone', e.target.value)}
                                            aria-invalid={!!errors.customer_phone}
                                            className={errors.customer_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.customer_phone && <p className="text-sm text-red-600">{errors.customer_phone}</p>}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="notes">Notas</Label>
                                        <Textarea
                                            id="notes"
                                            rows={3}
                                            value={data.notes}
                                            maxLength={1000}
                                            placeholder="Entrega, forma de pago, acuerdos con el cliente…"
                                            onChange={(e) => setData('notes', e.target.value)}
                                        />
                                    </div>
                                </>
                            ) : (
                                <dl className="grid gap-3 text-sm">
                                    <div className="grid gap-0.5">
                                        <dt className="text-muted-foreground">Nombre</dt>
                                        <dd className="font-medium">{order.customer_name || '—'}</dd>
                                    </div>
                                    <div className="grid gap-0.5">
                                        <dt className="text-muted-foreground">Teléfono / WhatsApp</dt>
                                        <dd className="font-medium">{order.customer_phone || '—'}</dd>
                                    </div>
                                    {order.customer_address && (
                                        <div className="grid gap-0.5">
                                            <dt className="text-muted-foreground">Dirección</dt>
                                            <dd>{order.customer_address}</dd>
                                        </div>
                                    )}
                                    <div className="grid gap-0.5">
                                        <dt className="text-muted-foreground">Notas</dt>
                                        <dd className="whitespace-pre-line">{order.notes || '—'}</dd>
                                    </div>
                                </dl>
                            )}
                            {phoneDigits.length >= 6 && (
                                <Button variant="outline" size="sm" asChild className="justify-self-start">
                                    <a href={`https://wa.me/${phoneDigits}`} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle className="size-4" />
                                        Abrir chat de WhatsApp
                                    </a>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Timeline order={order} />
                </div>
            </div>

            {/* Barra de guardado */}
            {editable && isDirty && (
                <div className="fixed inset-x-3 bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur sm:sticky sm:inset-x-auto sm:bottom-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Pencil className="size-4" />
                        Cambios sin guardar
                    </span>
                    <div className="flex flex-1 gap-2 sm:flex-none">
                        <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => form.reset()} disabled={processing}>
                            <Undo2 className="size-4" />
                            Descartar
                        </Button>
                        <Button className="flex-1 sm:flex-none" onClick={save} disabled={processing || data.items.length === 0}>
                            {processing ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                            Guardar cambios
                        </Button>
                    </div>
                </div>
            )}

            <AddProductDialog open={picker} onOpenChange={setPicker} inOrder={new Set(data.items.map((line) => line.product_id))} onPick={addProduct} />

            <ConfirmDialog
                open={dialog === 'confirm'}
                tone="success"
                title={`¿Confirmar el pedido ${order.code}?`}
                description="Se registrará como venta y se descontarán estas unidades del stock."
                confirmLabel={busy ? 'Confirmando…' : 'Confirmar y descontar stock'}
                confirmDisabled={busy || shortages.length > 0}
                onConfirm={() => runAction('confirm')}
                onCancel={() => !busy && setDialog(null)}
            >
                <ul className="grid max-h-60 gap-1.5 overflow-y-auto rounded-lg border p-2 text-sm">
                    {data.items.map((line) => {
                        const short = line.stock === null || line.quantity > line.stock;
                        return (
                            <li key={line.key} className={cn('flex items-center justify-between gap-3 rounded-md px-2 py-1', short && 'bg-red-50 dark:bg-red-950/50')}>
                                <span className="min-w-0 truncate">
                                    {line.name} <span className="text-muted-foreground">× {line.quantity}</span>
                                </span>
                                <span className={cn('flex-none text-xs tabular-nums', short ? 'font-medium text-red-700 dark:text-red-300' : 'text-muted-foreground')}>
                                    {line.stock === null ? 'Sin stock registrado' : short ? `Solo hay ${line.stock}` : `Stock ${line.stock} → ${line.stock - line.quantity}`}
                                </span>
                            </li>
                        );
                    })}
                </ul>
                {shortages.length > 0 && (
                    <p className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 size-4 flex-none" />
                        Ajusta las cantidades o repón el stock antes de confirmar.
                    </p>
                )}
            </ConfirmDialog>

            <ConfirmDialog
                open={dialog === 'cancel'}
                tone="danger"
                icon={XCircle}
                title={order.status === 'confirmed' ? `¿Cancelar la venta ${order.code}?` : `¿Cancelar el pedido ${order.code}?`}
                description={
                    order.status === 'confirmed'
                        ? 'La venta quedará anulada y las unidades volverán al stock.'
                        : 'El pedido quedará cancelado. El stock no cambia porque aún no se había descontado.'
                }
                confirmLabel={busy ? 'Cancelando…' : 'Sí, cancelar'}
                cancelLabel="Volver"
                confirmDisabled={busy}
                onConfirm={() => runAction('cancel')}
                onCancel={() => !busy && setDialog(null)}
            >
                <div className="grid gap-2">
                    <Label htmlFor="cancel-reason">Motivo (opcional)</Label>
                    <Input
                        id="cancel-reason"
                        value={reason}
                        maxLength={160}
                        placeholder="Ej.: el cliente ya no lo quiere"
                        onChange={(e) => setReason(e.target.value)}
                    />
                </div>
            </ConfirmDialog>

            <ConfirmDialog
                open={guard.open}
                title="¿Salir sin guardar?"
                description="Los cambios del pedido se perderán."
                confirmLabel="Salir sin guardar"
                cancelLabel="Seguir editando"
                onConfirm={guard.confirm}
                onCancel={guard.cancel}
            />
        </div>
    );
}

function StatusBanner({ order, canManage }: { order: Order; canManage: boolean }) {
    if (order.status === 'pending') {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                <Clock3 className="mt-0.5 size-4 flex-none" />
                <p>
                    {canManage
                        ? 'Pendiente: todavía no descuenta stock. Coordina con el cliente por WhatsApp, ajusta los productos si cambia algo y confirma cuando se cierre la venta.'
                        : 'Pendiente: todavía no descuenta stock. Tu rol solo puede ver los pedidos.'}
                </p>
            </div>
        );
    }
    if (order.status === 'confirmed') {
        return (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                <CheckCircle2 className="mt-0.5 size-4 flex-none" />
                <p>Venta confirmada · {dateTime(order.confirmed_at)}. El stock ya se descontó.</p>
            </div>
        );
    }
    return (
        <div className="flex items-start gap-3 rounded-xl border bg-muted/50 px-4 py-3 text-sm">
            <XCircle className="mt-0.5 size-4 flex-none text-muted-foreground" />
            <div className="grid gap-1">
                <p>Pedido cancelado · {dateTime(order.cancelled_at)}</p>
                {order.cancel_reason && <p className="text-muted-foreground">Motivo: {order.cancel_reason}</p>}
                {order.replacement && (
                    <Link href={route('admin.orders.show', order.replacement.id)} className="font-medium text-orange-700 hover:underline dark:text-orange-400">
                        Ver el pedido {order.replacement.code}
                    </Link>
                )}
            </div>
        </div>
    );
}

function ItemRow({
    line,
    editable,
    canRemove,
    checkStock,
    onQty,
    onRemove,
}: {
    line: Line;
    editable: boolean;
    canRemove: boolean;
    checkStock: boolean;
    onQty: (quantity: number) => void;
    onRemove: () => void;
}) {
    const subtotal = (Math.round(line.unit_price * 100) * line.quantity) / 100;
    const priceChanged = line.current_price !== null && Math.abs(line.current_price - line.unit_price) >= 0.005;

    return (
        <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 @lg/items:flex-nowrap @lg/items:px-5">
            <ProductThumb src={line.image} name={line.name} />
            <div className="grid min-w-0 flex-1 gap-0.5">
                <span className="line-clamp-2 font-medium">{line.name}</span>
                <span className="text-sm text-muted-foreground tabular-nums">{money(line.unit_price, line.money)} c/u</span>
                {priceChanged && (
                    <span className="text-xs text-muted-foreground">Precio actual en la tienda: {money(line.current_price!, line.money)}</span>
                )}
                {checkStock && line.stock === null && (
                    <span className="flex items-center gap-1 text-xs font-medium text-red-700 dark:text-red-300">
                        <AlertTriangle className="size-3.5" /> Sin registro de stock
                    </span>
                )}
                {checkStock && line.stock !== null && line.quantity > line.stock && (
                    <span className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                        <AlertTriangle className="size-3.5" /> Solo hay {line.stock} en stock
                    </span>
                )}
            </div>
            <div className="flex w-full items-center justify-between gap-3 pl-15 @lg/items:w-auto @lg/items:justify-end @lg/items:pl-0">
                {editable ? (
                    <div className="flex items-center rounded-lg border" role="group" aria-label={`Cantidad de ${line.name}`}>
                        <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-l-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                            onClick={() => onQty(line.quantity - 1)}
                            disabled={line.quantity <= 1}
                            aria-label="Quitar una unidad"
                        >
                            <Minus className="size-4" />
                        </button>
                        <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={MAX_QTY}
                            value={line.quantity}
                            onChange={(e) => onQty(Number(e.target.value))}
                            className="h-9 w-12 border-x bg-transparent text-center text-sm font-medium tabular-nums outline-none [appearance:textfield] focus:bg-muted/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                            aria-label="Cantidad"
                        />
                        <button
                            type="button"
                            className="flex size-9 items-center justify-center rounded-r-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                            onClick={() => onQty(line.quantity + 1)}
                            disabled={line.quantity >= MAX_QTY}
                            aria-label="Agregar una unidad"
                        >
                            <Plus className="size-4" />
                        </button>
                    </div>
                ) : (
                    <span className="text-sm text-muted-foreground tabular-nums">× {line.quantity}</span>
                )}
                <span className="min-w-24 text-right font-semibold whitespace-nowrap tabular-nums">{money(subtotal, line.money)}</span>
                {editable && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-9 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        onClick={onRemove}
                        disabled={!canRemove}
                        title={canRemove ? 'Quitar del pedido' : 'El pedido necesita al menos un producto (para anularlo usa «Cancelar pedido»)'}
                        aria-label={`Quitar ${line.name} del pedido`}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                )}
            </div>
        </li>
    );
}

function Timeline({ order }: { order: Order }) {
    const events = [
        { at: order.created_at, label: 'Pedido recibido', hint: 'Desde el carrito de la web por WhatsApp', tone: 'bg-orange-500' },
        order.edited_at && { at: order.edited_at, label: 'Pedido editado', hint: null, tone: 'bg-sky-500' },
        order.confirmed_at && { at: order.confirmed_at, label: 'Venta confirmada', hint: 'Stock descontado', tone: 'bg-emerald-500' },
        order.cancelled_at && {
            at: order.cancelled_at,
            label: 'Pedido cancelado',
            hint: order.confirmed_at ? 'Unidades devueltas al stock' : null,
            tone: 'bg-zinc-400',
        },
    ].filter(Boolean) as { at: string; label: string; hint: string | null; tone: string }[];
    events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

    return (
        <Card className="gap-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                    <History className="size-4 text-muted-foreground" />
                    Historial
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ol className="relative grid gap-4 border-l pl-5">
                    {events.map((event) => (
                        <li key={event.label} className="relative grid gap-0.5 text-sm">
                            <span className={cn('absolute top-1.5 -left-[25px] size-2.5 rounded-full ring-4 ring-background', event.tone)} />
                            <span className="font-medium">{event.label}</span>
                            <span className="text-xs text-muted-foreground">{dateTime(event.at)}</span>
                            {event.hint && <span className="text-xs text-muted-foreground">{event.hint}</span>}
                        </li>
                    ))}
                </ol>
                {order.editor && <p className="mt-4 text-xs text-muted-foreground">Último cambio por {order.editor}</p>}
            </CardContent>
        </Card>
    );
}

function AddProductDialog({
    open,
    onOpenChange,
    inOrder,
    onPick,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    inOrder: Set<number>;
    onPick: (product: ProductOption) => void;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open) return;
        let active = true;
        setLoading(true);
        const timer = setTimeout(() => {
            axios
                .get<ProductOption[]>(route('admin.orders.products'), { params: { q: query.trim() || undefined } })
                .then((res) => active && setResults(res.data))
                .catch(() => active && toast.error('No se pudieron cargar los productos'))
                .finally(() => active && setLoading(false));
        }, 250);
        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [open, query]);

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                onOpenChange(value);
                if (!value) setQuery('');
            }}
        >
            <DialogContent className="flex max-h-[min(640px,calc(100dvh-2rem))] w-[calc(100vw-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="gap-1 border-b p-4 text-left">
                    <DialogTitle>Agregar producto</DialogTitle>
                    <DialogDescription>Se agrega con el precio vigente (con oferta si la tiene).</DialogDescription>
                    <div className="relative mt-2">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            autoFocus
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Buscar producto por nombre"
                            aria-label="Buscar producto"
                            className="pl-9"
                        />
                    </div>
                </DialogHeader>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {loading && results.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" /> Buscando…
                        </div>
                    ) : results.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">No se encontraron productos con precio.</p>
                    ) : (
                        <ul className={cn('grid gap-1', loading && 'opacity-60')}>
                            {results.map((product) => {
                                const added = inOrder.has(product.id);
                                return (
                                    <li key={product.id}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onPick(product);
                                                onOpenChange(false);
                                                setQuery('');
                                            }}
                                            className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
                                        >
                                            <ProductThumb src={product.image} name={product.name} className="size-11" />
                                            <span className="grid min-w-0 flex-1">
                                                <span className="truncate text-sm font-medium">{product.name}</span>
                                                <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                                                    {product.brand && <span>{product.brand}</span>}
                                                    <span className={product.stock <= 0 ? 'font-medium text-red-700 dark:text-red-300' : ''}>
                                                        {product.stock <= 0 ? 'Sin stock' : `Stock: ${product.stock}`}
                                                    </span>
                                                    {added && <span className="font-medium text-foreground">· En el pedido (+1)</span>}
                                                </span>
                                            </span>
                                            <span className="grid flex-none text-right">
                                                <span className={cn('text-sm font-semibold tabular-nums', product.on_offer && 'text-orange-700 dark:text-orange-400')}>
                                                    {money(product.price, product.money)}
                                                </span>
                                                {product.on_offer && (
                                                    <span className="text-xs text-muted-foreground tabular-nums line-through">{money(product.regular_price, product.money)}</span>
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
