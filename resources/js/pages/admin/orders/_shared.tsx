import { cn } from '@/lib/utils';
import { CheckCircle2, Clock3, XCircle, type LucideIcon } from 'lucide-react';

export type OrderStatus = 'pending' | 'confirmed' | 'cancelled';

export const STATUS: Record<OrderStatus, { label: string; icon: LucideIcon; badge: string; dot: string }> = {
    pending: {
        label: 'Pendiente',
        icon: Clock3,
        badge: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300',
        dot: 'bg-amber-500',
    },
    confirmed: {
        label: 'Confirmado',
        icon: CheckCircle2,
        badge: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
        dot: 'bg-emerald-500',
    },
    cancelled: {
        label: 'Cancelado',
        icon: XCircle,
        badge: 'border-zinc-200 bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
        dot: 'bg-zinc-400',
    },
};

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
    const info = STATUS[status] ?? STATUS.pending;
    const Icon = info.icon;
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', info.badge, className)}>
            <Icon className="size-3.5" />
            {info.label}
        </span>
    );
}

/** Mismo formato que el carrito de la web: "Bs. 3.299,00". */
export function money(value: number, currency = 'Bs.') {
    return `${currency} ${Number(value || 0).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function dateTime(iso?: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** "hace 5 min", "hace 3 h", "ayer", o la fecha si es más antigua. */
export function relative(iso?: string | null) {
    if (!iso) return '—';
    const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return 'ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    if (hours < 48) return 'ayer';
    return new Date(iso).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ProductThumb({ src, name, className }: { src?: string | null; name: string; className?: string }) {
    return (
        <span className={cn('flex size-12 flex-none items-center justify-center overflow-hidden rounded-lg border bg-muted/40', className)}>
            {src ? (
                <img src={src} alt="" loading="lazy" className="size-full object-contain" />
            ) : (
                <span className="text-sm font-semibold text-muted-foreground uppercase" aria-hidden="true">
                    {name.slice(0, 2)}
                </span>
            )}
        </span>
    );
}
