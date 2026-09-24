import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Brand } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    brand: Brand;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Marcas', href: route('brands.index') },
    { title: 'Ver', href: '#' },
];

export default function Show({ brand }: Props) {
    const { hasPermission } = usePermissions();

    useEffect(() => {
        if (!hasPermission('show_brands')) {
            toast.error('No tienes permisos para ver marcas');
            router.visit(route('brands.index'));
        }
    }, [hasPermission]);

    if (!hasPermission('show_brands')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Marca: ${brand.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('brands.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles de la Marca</CardTitle>
                                    <CardDescription>
                                        Información completa de {brand.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_brands') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('brands.edit', brand.id)}>
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
                                    <CardDescription>Datos básicos de la marca</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                            <p className="text-sm">{brand.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                            <div className="mt-1">
                                                <Badge variant={brand.active ? 'default' : 'secondary'}>
                                                    {brand.active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Imagen */}
                            {brand.image_url && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            Logo
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="relative w-full max-w-md">
                                            <img
                                                src={brand.image_url}
                                                alt={brand.name}
                                                className="w-full h-auto rounded-lg border"
                                            />
                                        </div>
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
                                                <p>{brand.created_at ? new Date(brand.created_at).toLocaleString() : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="font-medium text-muted-foreground">Última actualización</label>
                                                <p>{brand.updated_at ? new Date(brand.updated_at).toLocaleString() : '—'}</p>
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
