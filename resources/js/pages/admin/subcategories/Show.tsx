import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Subcategory } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    subcategory: Subcategory;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Subcategorías', href: route('subcategories.index') },
    { title: 'Ver', href: '#' },
];

export default function Show({ subcategory }: Props) {
    const { hasPermission } = usePermissions();

    useEffect(() => {
        if (!hasPermission('show_subcategories')) {
            toast.error('No tienes permisos para ver subcategorías');
            router.visit(route('subcategories.index'));
        }
    }, [hasPermission]);

    if (!hasPermission('show_subcategories')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Subcategoría: ${subcategory.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('subcategories.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles de la Subcategoría</CardTitle>
                                    <CardDescription>
                                        Información completa de {subcategory.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_subcategories') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('subcategories.edit', subcategory.id)}>
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
                                    <CardDescription>Datos básicos de la subcategoría</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                            <p className="text-sm">{subcategory.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Slug</label>
                                            <p className="text-sm">{subcategory.slug}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                                            <p className="text-sm">{subcategory.category_label ?? '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Icono</label>
                                            <p className="text-sm">{subcategory.icon || '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                            <div className="mt-1">
                                                <Badge variant={subcategory.active ? 'default' : 'secondary'}>
                                                    {subcategory.active ? 'Activa' : 'Inactiva'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Imagen */}
                            {subcategory.image_url && (
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
                                                src={subcategory.image_url}
                                                alt={subcategory.name}
                                                className="w-full h-auto rounded-lg border"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resumen */}
                            {subcategory.summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumen</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{subcategory.summary}</p>
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
                                                <p>{subcategory.created_at ? new Date(subcategory.created_at).toLocaleString() : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="font-medium text-muted-foreground">Última actualización</label>
                                                <p>{subcategory.updated_at ? new Date(subcategory.updated_at).toLocaleString() : '—'}</p>
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
