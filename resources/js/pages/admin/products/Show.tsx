import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Product } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Calendar, ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    product: Product;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Productos', href: route('products.index') },
    { title: 'Ver', href: '#' },
];

export default function Show({ product }: Props) {
    const { hasPermission } = usePermissions();

    useEffect(() => {
        if (!hasPermission('show_products')) {
            toast.error('No tienes permisos para ver productos');
            router.visit(route('products.index'));
        }
    }, [hasPermission]);

    if (!hasPermission('show_products')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Producto: ${product.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('products.index')}>
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Producto</CardTitle>
                                    <CardDescription>
                                        Información completa de {product.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_products') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('products.edit', product.id)}>
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
                                    <CardDescription>Datos básicos del producto</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                                            <p className="text-sm">{product.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Slug</label>
                                            <p className="text-sm">{product.slug}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Categoría</label>
                                            <p className="text-sm">{product.category_label ?? '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Subcategoría</label>
                                            <p className="text-sm">{product.subcategory_label ?? '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Marca</label>
                                            <p className="text-sm">{product.brand_label ?? '—'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">Estado</label>
                                            <div className="mt-1 flex flex-wrap gap-1">
                                                <Badge variant={product.active ? 'default' : 'secondary'}>
                                                    {product.active ? 'Activo' : 'Inactivo'}
                                                </Badge>
                                                {product.featured && <Badge variant="outline">Destacado</Badge>}
                                                {product.pop && <Badge variant="outline">Popular</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Imagen */}
                            {product.image_url && (
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
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-full h-auto rounded-lg border"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Resumen */}
                            {product.summary && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Resumen</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{product.summary}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Descripción */}
                            {product.description && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Descripción</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{product.description}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Información general / técnica */}
                            {product.general_info && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información general</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{product.general_info}</p>
                                    </CardContent>
                                </Card>
                            )}
                            {product.technical_info && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información técnica</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{product.technical_info}</p>
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
                                                <p>{product.created_at ? new Date(product.created_at).toLocaleString() : '—'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <label className="font-medium text-muted-foreground">Última actualización</label>
                                                <p>{product.updated_at ? new Date(product.updated_at).toLocaleString() : '—'}</p>
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
