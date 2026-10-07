import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clock3, ClipboardList, Search, TrendingUp, X, XCircle, type LucideIcon } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { route } from 'ziggy-js';
import { money, relative, StatusBadge, type OrderStatus } from './_shared';

interface OrderRow {
    id: number;
    code: string;
    status: OrderStatus;
    customer_name: string | null;
    customer_phone: string | null;
    total: number;
    money: string;
    items_count: number;
    units: number;
    preview: string[];
    created_at: string | null;
    edited: boolean;
}

interface Props {
    records: {
        data: OrderRow[];
        current_page: number;
        last_page: number;
        total: number;
        from: number | null;
        to: number | null;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: { status: OrderStatus | null; search: string };
    counts: Record<'all' | OrderStatus, number>;
    month: { confirmed: number; revenue: number; pending_total: number };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Pedidos', href: route('admin.orders.index') },
];

const TABS: { value: OrderStatus | null; label: string }[] = [
    { value: null, label: 'Todos' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmados' },
    { value: 'cancelled', label: 'Cancelados' },
];

function Stat({ icon: Icon, label, value, hint, tone }: { icon: LucideIcon; label: string; value: string; hint?: string; tone: string }) {
    return (
        <div className="flex flex-col items-start gap-2 rounded-xl border bg-card p-3 @lg:flex-row @lg:items-center @lg:gap-3 sm:p-4">
            <span className={cn('flex size-9 flex-none items-center justify-center rounded-full @lg:size-11', tone)}>
                <Icon className="size-5" />
            </span>
            <div className="grid min-w-0">
                <span className="text-xs text-muted-foreground sm:text-sm">{label}</span>
                <span className="text-lg font-semibold whitespace-nowrap tabular-nums sm:text-xl">{value}</span>
                {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
            </div>
        </div>
    );
}

function Customer({ order }: { order: OrderRow }) {
    if (!order.customer_name && !order.customer_phone) {
        return <span className="text-sm text-muted-foreground">Sin datos del cliente</span>;
    }
    return (
        <div className="grid min-w-0">
            <span className="truncate font-medium">{order.customer_name || 'Cliente'}</span>
            {order.customer_phone && <span className="truncate text-xs text-muted-foreground">{order.customer_phone}</span>}
        </div>
    );
}

function Products({ order }: { order: OrderRow }) {
    const more = order.items_count - order.preview.length;
    return (
        <div className="grid min-w-0">
            <span className="truncate text-sm">{order.preview.join(', ') || '—'}</span>
            <span className="text-xs text-muted-foreground">
                {more > 0 && `+${more} más · `}
                {order.units} {order.units === 1 ? 'unidad' : 'unidades'}
            </span>
        </div>
    );
}

export default function Index({ records, filters, counts, month }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    const visit = (params: { status?: OrderStatus | null; search?: string }) => {
        const next = { status: filters.status, search: filters.search, ...params };
        router.get(
            route('admin.orders.index'),
            { status: next.status || undefined, search: next.search || undefined },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        visit({ search });
    };

    const open = (order: OrderRow) => router.visit(route('admin.orders.show', order.id));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pedidos" />
            <div className="@container flex h-full min-w-0 flex-1 flex-col gap-4 rounded-xl p-3 sm:p-4">
                <div className="grid gap-1">
                    <h1 className="text-xl font-semibold sm:text-2xl">Pedidos</h1>
                    <p className="text-sm text-muted-foreground">
                        Pedidos enviados por WhatsApp desde el carrito. Al confirmar un pedido se descuenta el stock.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 @4xl:grid-cols-4">
                    <Stat
                        icon={Clock3}
                        label="Pendientes"
                        value={String(counts.pending)}
                        hint={counts.pending ? `${money(month.pending_total)} por confirmar` : 'Todo al día'}
                        tone="bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400"
                    />
                    <Stat
                        icon={CheckCircle2}
                        label="Confirmados (mes)"
                        value={String(month.confirmed)}
                        tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                    />
                    <Stat
                        icon={TrendingUp}
                        label="Ventas del mes"
                        value={money(month.revenue)}
                        tone="bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400"
                    />
                    <Stat
                        icon={XCircle}
                        label="Cancelados"
                        value={String(counts.cancelled)}
                        tone="bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
                    />
                </div>

                <Card className="min-w-0 gap-4">
                    <CardHeader className="gap-4">
                        <div className="grid gap-1">
                            <CardTitle className="text-lg font-medium">Lista de pedidos</CardTitle>
                            <CardDescription>Los pendientes aparecen primero. Busca por referencia, cliente, teléfono o producto.</CardDescription>
                        </div>
                        <div className="flex flex-col gap-3 @4xl:flex-row @4xl:items-center @4xl:justify-between">
                            <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filtrar por estado">
                                {TABS.map((tab) => {
                                    const active = (filters.status ?? null) === tab.value;
                                    const count = counts[tab.value ?? 'all'];
                                    return (
                                        <button
                                            key={tab.label}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            onClick={() => visit({ status: tab.value })}
                                            className={cn(
                                                'inline-flex h-9 flex-none items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
                                                active ? 'border-foreground bg-foreground text-background' : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                                            )}
                                        >
                                            {tab.label}
                                            <span
                                                className={cn(
                                                    'rounded-full px-1.5 text-xs tabular-nums',
                                                    active ? 'bg-background/20' : tab.value === 'pending' && count > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-muted',
                                                )}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <form onSubmit={submit} className="flex w-full gap-2 @4xl:max-w-sm">
                                <div className="relative flex-1">
                                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="SH-7K3P9Q, cliente o producto"
                                        aria-label="Buscar pedidos"
                                        className="pl-9"
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    Buscar
                                </Button>
                                {filters.search && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Limpiar búsqueda"
                                        onClick={() => {
                                            setSearch('');
                                            visit({ search: '' });
                                        }}
                                    >
                                        <X className="size-4" />
                                    </Button>
                                )}
                            </form>
                        </div>
                    </CardHeader>

                    <CardContent className="min-w-0">
                        {records.data.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-12 text-center">
                                <span className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <ClipboardList className="size-6 text-muted-foreground" />
                                </span>
                                <p className="font-medium">{filters.search || filters.status ? 'No hay pedidos con estos filtros' : 'Aún no hay pedidos'}</p>
                                <p className="max-w-sm text-sm text-muted-foreground">
                                    Cada vez que un cliente pulsa «Pedir por WhatsApp» en el carrito, su pedido aparece aquí como pendiente.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Tablet y escritorio */}
                                <div className="hidden @2xl:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Pedido</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead className="hidden @4xl:table-cell">Productos</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead>Estado</TableHead>
                                                <TableHead className="w-10">
                                                    <span className="sr-only">Abrir</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {records.data.map((order) => (
                                                <TableRow key={order.id} className="cursor-pointer" onClick={() => open(order)}>
                                                    <TableCell>
                                                        <div className="grid">
                                                            <span className="font-semibold tracking-wide whitespace-nowrap">{order.code}</span>
                                                            <span className="text-xs whitespace-nowrap text-muted-foreground">{relative(order.created_at)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[180px]">
                                                        <Customer order={order} />
                                                    </TableCell>
                                                    <TableCell className="hidden max-w-[260px] @4xl:table-cell">
                                                        <Products order={order} />
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold whitespace-nowrap tabular-nums">{money(order.total, order.money)}</TableCell>
                                                    <TableCell>
                                                        <StatusBadge status={order.status} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={route('admin.orders.show', order.id)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                                                            aria-label={`Abrir pedido ${order.code}`}
                                                        >
                                                            <ChevronRight className="size-4" />
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Móvil */}
                                <ul className="grid gap-2 @2xl:hidden">
                                    {records.data.map((order) => (
                                        <li key={order.id}>
                                            <Link
                                                href={route('admin.orders.show', order.id)}
                                                className="grid gap-2 rounded-xl border p-3 transition-colors hover:bg-muted/50 active:bg-muted"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="font-semibold tracking-wide">{order.code}</span>
                                                    <StatusBadge status={order.status} />
                                                </div>
                                                <Products order={order} />
                                                <div className="flex items-end justify-between gap-2 border-t pt-2">
                                                    <div className="grid min-w-0 text-xs text-muted-foreground">
                                                        <span className="truncate">{order.customer_name || order.customer_phone || 'Sin datos del cliente'}</span>
                                                        <span>{relative(order.created_at)}</span>
                                                    </div>
                                                    <span className="font-semibold whitespace-nowrap tabular-nums">{money(order.total, order.money)}</span>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}

                        {records.last_page > 1 && (
                            <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground sm:flex-row">
                                <span>
                                    Mostrando {records.from}–{records.to} de {records.total}
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" disabled={!records.prev_page_url} asChild={!!records.prev_page_url}>
                                        {records.prev_page_url ? (
                                            <Link href={records.prev_page_url} preserveScroll>
                                                <ChevronLeft className="size-4" /> Anterior
                                            </Link>
                                        ) : (
                                            <span>
                                                <ChevronLeft className="size-4" /> Anterior
                                            </span>
                                        )}
                                    </Button>
                                    <span className="tabular-nums">
                                        {records.current_page} / {records.last_page}
                                    </span>
                                    <Button variant="outline" size="sm" disabled={!records.next_page_url} asChild={!!records.next_page_url}>
                                        {records.next_page_url ? (
                                            <Link href={records.next_page_url} preserveScroll>
                                                Siguiente <ChevronRight className="size-4" />
                                            </Link>
                                        ) : (
                                            <span>
                                                Siguiente <ChevronRight className="size-4" />
                                            </span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
