import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { DatabaseBackup, Download, ImageIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';
import { flash, formatDate } from '../about/_shared';

interface BackupFile {
    name: string;
    size: number;
    created_at: string;
    label?: string | null;
}

interface Props {
    database: BackupFile[];
    images: BackupFile | null;
    retention: {
        keep_all_hours: number;
        keep_daily_days: number;
        keep_weekly_weeks: number;
        keep_monthly_months: number;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Copias de seguridad', href: route('admin.backups.index') },
];

const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const LABELS: Record<string, string> = {
    manual: 'Manual',
    'pre-restore': 'Antes de restaurar',
};

export default function Index({ database, images, retention }: Props) {
    const [busy, setBusy] = useState<'database' | 'images' | null>(null);
    const total = database.reduce((sum, b) => sum + b.size, 0);

    const create = (kind: 'database' | 'images') => {
        setBusy(kind);
        router.post(route(kind === 'database' ? 'admin.backups.store' : 'admin.backups.images'), {}, {
            preserveScroll: true,
            onSuccess: (page) => flash(page),
            onFinish: () => setBusy(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Copias de seguridad" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                <div>
                    <h1 className="mb-3 text-2xl font-bold">Copias de seguridad</h1>
                    <p className="text-muted-foreground">
                        La base de datos se copia sola cada 6 horas y las imágenes una vez al día. Se guardan todas las copias de las
                        últimas {retention.keep_all_hours} h, una por día durante {retention.keep_daily_days} días, una por semana durante{' '}
                        {retention.keep_weekly_weeks} semanas y una por mes durante {retention.keep_monthly_months} meses.
                    </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="mb-3">Base de datos</CardTitle>
                            <CardDescription>
                                {database.length} copias · {formatSize(total)} en total
                            </CardDescription>
                        </div>
                        <Button onClick={() => create('database')} disabled={busy !== null}>
                            {busy === 'database' ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseBackup className="h-4 w-4" />}
                            Crear copia ahora
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Tamaño</TableHead>
                                    <TableHead className="text-right">Descargar</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {database.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Todavía no hay copias
                                        </TableCell>
                                    </TableRow>
                                )}
                                {database.map((backup) => (
                                    <TableRow key={backup.name}>
                                        <TableCell className="font-medium">{formatDate(backup.created_at)}</TableCell>
                                        <TableCell>
                                            {backup.label ? (
                                                <Badge variant="secondary">{LABELS[backup.label] ?? backup.label}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">Automática</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{formatSize(backup.size)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="icon" asChild>
                                                <a
                                                    href={route('admin.backups.download', backup.name)}
                                                    aria-label={`Descargar copia del ${formatDate(backup.created_at)}`}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle className="mb-3">Imágenes</CardTitle>
                            <CardDescription>Una sola copia que se reemplaza cada vez.</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => create('images')} disabled={busy !== null}>
                            {busy === 'images' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                            Copiar imágenes ahora
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {images ? (
                            <div className="flex items-center justify-between gap-4">
                                <p>
                                    Última copia: <span className="font-medium">{formatDate(images.created_at)}</span> ·{' '}
                                    {formatSize(images.size)}
                                </p>
                                <Button variant="outline" size="icon" asChild>
                                    <a href={route('admin.backups.download', images.name)} aria-label="Descargar copia de imágenes">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Todavía no hay copia de las imágenes.</p>
                        )}
                    </CardContent>
                </Card>

                <p className="text-sm text-muted-foreground">
                    Para restaurar una copia: <code>php artisan backup:restore</code> (antes de reemplazar nada guarda una copia del estado
                    actual).
                </p>
            </div>
        </AppLayout>
    );
}
