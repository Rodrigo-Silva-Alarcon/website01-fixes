import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Banner } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    banner: Banner;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Banners', href: route('banners.index') },
    { title: 'Ver', href: '#' },
];

export default function Show({ banner }: Props) {
    const { hasPermission } = usePermissions();

    useEffect(() => {
        if (!hasPermission('show_banners')) {
            toast.error('No tienes permisos para ver banners');
            router.visit(route('banners.index'));
        }
    }, [hasPermission]);

    if (!hasPermission('show_banners')) {
        return null;
    }

    const formatDate = (value?: string | null) =>
        value ? new Date(value).toLocaleDateString() : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Banner: ${banner.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('banners.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Banner</CardTitle>
                                    <CardDescription>
                                        Información completa de {banner.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_banners') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('banners.edit', banner.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {/* Información General */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información General</CardTitle>
                                    <CardDescription>Datos básicos del banner</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                            <p className="text-sm">{banner.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                                            <p className="text-sm">{banner.type || '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Enlace</label>
                                            <p className="text-sm">
                                                {banner.url ? (
                                                    <a href={banner.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                                                        {banner.url}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <Badge variant={banner.active ? 'default' : 'secondary'}>
                                                    {banner.active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                                {banner.sw_title && <Badge variant="outline">Muestra título</Badge>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Vigencia</label>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                <p className="text-sm">
                                                    {formatDate(banner.start_date) ?? '—'} → {formatDate(banner.end_date) ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                        {Array.isArray(banner.pages) && banner.pages.length > 0 && (
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Páginas</label>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {banner.pages.map((page, index) => (
                                                        <Badge key={index} variant="secondary" className="text-xs">
                                                            {page}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Imagen */}
                            {banner.image_url && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Imagen
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative w-full max-w-md">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.name}
                                                className="w-full h-auto rounded-lg border"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resumen */}
                            {banner.summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumen</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{banner.summary}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Metadatos */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Metadatos</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="font-medium text-muted-foreground">Creado</label>
                                                <p>{banner.created_at ? new Date(banner.created_at).toLocaleString() : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="font-medium text-muted-foreground">Última actualización</label>
                                                <p>{banner.updated_at ? new Date(banner.updated_at).toLocaleString() : '—'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
