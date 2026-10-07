import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { AlertTriangle, CheckCircle2, Trash2, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ConfirmDialogProps {
    open: boolean;
    /** warning: acción reversible pero con pérdida (salir); danger: borra algo; success: confirma algo. */
    tone?: 'warning' | 'danger' | 'success';
    icon?: LucideIcon;
    title: string;
    description: ReactNode;
    /** Resumen opcional de lo que se pierde, en chips bajo la descripción. */
    details?: string[];
    /** Contenido extra bajo la descripción (resúmenes, campos opcionales). */
    children?: ReactNode;
    /** Desactiva el botón de confirmar (p. ej. falta stock). */
    confirmDisabled?: boolean;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const TONES = {
    warning: { icon: AlertTriangle, badge: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400', action: 'bg-orange-600 hover:bg-orange-700' },
    danger: { icon: Trash2, badge: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400', action: 'bg-red-600 hover:bg-red-700' },
    success: { icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400', action: 'bg-emerald-600 hover:bg-emerald-700' },
};

/**
 * Confirmación con el estilo del panel, en lugar de window.confirm.
 * El foco inicial queda en «Cancelar»: la opción segura.
 */
export function ConfirmDialog({ open, tone = 'warning', icon, title, description, details, children, confirmDisabled, confirmLabel, cancelLabel = 'Cancelar', onConfirm, onCancel }: ConfirmDialogProps) {
    const style = TONES[tone];
    const Icon = icon ?? style.icon;

    return (
        <AlertDialogPrimitive.Root open={open} onOpenChange={(value) => !value && onCancel()}>
            <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
                <AlertDialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl border bg-background p-5 shadow-2xl duration-200 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:p-6">
                    <div className="flex gap-4">
                        <span className={cn('flex size-11 flex-none items-center justify-center rounded-full', style.badge)}>
                            <Icon className="size-5" />
                        </span>
                        <div className="grid min-w-0 gap-1.5 pt-0.5">
                            <AlertDialogPrimitive.Title className="text-[17px] leading-snug font-semibold">{title}</AlertDialogPrimitive.Title>
                            <AlertDialogPrimitive.Description className="text-sm leading-relaxed text-muted-foreground">{description}</AlertDialogPrimitive.Description>
                            {details && details.length > 0 && (
                                <ul className="flex flex-wrap gap-1.5 pt-1.5">
                                    {details.map((d) => (
                                        <li key={d} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">
                                            {d}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    {children}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <AlertDialogPrimitive.Cancel className={cn(buttonVariants({ variant: 'outline' }), 'h-11 sm:h-10')}>{cancelLabel}</AlertDialogPrimitive.Cancel>
                        <AlertDialogPrimitive.Action
                            onClick={onConfirm}
                            disabled={confirmDisabled}
                            className={cn(buttonVariants(), 'h-11 font-semibold text-white sm:h-10', style.action)}
                        >
                            {confirmLabel}
                        </AlertDialogPrimitive.Action>
                    </div>
                </AlertDialogPrimitive.Content>
            </AlertDialogPrimitive.Portal>
        </AlertDialogPrimitive.Root>
    );
}
