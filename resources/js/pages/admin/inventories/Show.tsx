import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Calendar, Edit, ArrowLeft } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Inventory {
    id: number;
    product_id: number;
    amount: number;
    stock: number;
    money: string;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
    };
}

interface Props {
    inventory: Inventory;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: '/admin/dashboard' },
    { title: 'Inventarios', href: '/admin/inventories' },
    { title: 'Ver', href: '/admin/inventories/show' },
];

export default function Show({ inventory }: Props) {
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Show.tsx');
        console.log('Tiene show_inventories:', hasPermission('show_inventories'));

        if (!hasPermission('show_inventories')) {
            console.log('❌ Usuario sin permisos para ver inventarios - redirigiendo');
            toast.error('No tienes permisos para ver inventarios');
            router.visit('/admin/inventories');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('show_inventories')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inventario: ${inventory.product?.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/inventories">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Inventario</CardTitle>
                                    <CardDescription>
                                        Información completa del inventario {inventory.product?.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_inventories') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/inventories/${inventory.id}/edit`}>
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
                            <CardDescription>Detalles básicos del inventario</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Producto</label>
                                    <p className="text-sm">{inventory.product?.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Monto</label>
                                    <p className="text-sm">{inventory.amount} {inventory.money}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Stock</label>
                                    <p className="text-sm">{inventory.stock}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Moneda</label>
                                    <div className="mt-1">
                                        <Badge variant="outline">{inventory.money}</Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Metadatos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Metadatos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <label className="font-medium text-muted-foreground">Creado</label>
                                    <p>{new Date(inventory.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="font-medium text-muted-foreground">Última actualización</label>
                                    <p>{new Date(inventory.updated_at).toLocaleString()}</p>
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