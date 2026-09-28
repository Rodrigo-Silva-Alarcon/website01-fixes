import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { Link } from "@inertiajs/react";
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { FolderClosed, Wrench, Folders, ShoppingCart, AlertTriangle, TrendingUp, Package } from  'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface LowStockItem { id: number; name: string; stock: number }
interface RecentOrder { id: number; user: string; total: number; items: number; created_at: string | null }

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { hasPermission } = usePermissions();

    const { props } = usePage(); // obtiene todas las props enviadas desde Laravel
    const products = props.products as number;
    const categories = props.categories as number;
    const subcategorieds = props.subcategorieds as number;
    const banners = props.banners as number;
    const lowStock = (props.lowStock ?? []) as LowStockItem[];
    const recentOrders = (props.recentOrders ?? []) as RecentOrder[];
    const revenueMonth = Number(props.revenueMonth ?? 0);
    const ordersMonth = Number(props.ordersMonth ?? 0);

    // Verificar permisos al cargar el componente
    useEffect(() => {
        if (!hasPermission('access_dashboard')) {
            toast.error('No tienes permisos para acceder al dashboard');
            router.visit('/login');
        }
    }, [hasPermission]);

    if (!hasPermission('access_dashboard')) {
        return null;
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex  h-full flex-1 flex-col gap-4  overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">                        
                        <Link href={route('products.index')} className='flex flex-col items-center justify-center h-full hover:text-orange-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(products)}</h1>
                            <h1 className='flex'><Wrench className='me-2' /> Productos</h1>

                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('categories.index')} className="flex flex-col items-center justify-center h-full hover:text-orange-600">
                            <h1 className='text-5xl font-bold text-green-600'>{String(categories)}</h1>
                            <h1 className='flex'><FolderClosed className='me-2 ' /> Categorías</h1>
                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('subcategories.index')} className='flex flex-col items-center justify-center h-full hover:text-orange-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(subcategorieds)}</h1>
                            <h1 className='flex'><Folders className='me-2' /> Subcategorías</h1>
                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('banners.index')} className='flex flex-col items-center justify-center h-full hover:text-orange-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(banners)}</h1>
                            <h1 className='flex'><Folders className='me-2' /> Banners</h1>
                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className='flex flex-col items-center justify-center h-full'>
                            <h1 className='text-5xl font-bold text-orange-600'>{ordersMonth}</h1>
                            <h1 className='flex'><ShoppingCart className='me-2' /> Pedidos (mes)</h1>
                        </div>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <div className='flex flex-col items-center justify-center h-full'>
                            <h1 className='text-5xl font-bold text-emerald-600'>{revenueMonth.toFixed(2)}</h1>
                            <h1 className='flex'><TrendingUp className='me-2' /> Ingresos (mes)</h1>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> Stock bajo</CardTitle>
                            <CardDescription>Productos con stock ≤ 5</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {lowStock.length === 0 && (
                                        <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">Sin alertas de stock</TableCell></TableRow>
                                    )}
                                    {lowStock.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className={`text-right font-bold ${item.stock <= 2 ? 'text-red-600' : 'text-amber-600'}`}>
                                                {item.stock}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-orange-500" /> Pedidos recientes</CardTitle>
                            <CardDescription>Últimos pedidos del sistema</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Cliente</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-right">Ítems</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.length === 0 && (
                                        <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Sin pedidos aún</TableCell></TableRow>
                                    )}
                                    {recentOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell>#{order.id}</TableCell>
                                            <TableCell>{order.user}</TableCell>
                                            <TableCell className="text-right">{order.total.toFixed(2)}</TableCell>
                                            <TableCell className="text-right">{order.items}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="relative min-h-[40vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex items-center justify-center h-full'>
                        <div className='text-center'>
                            <AppLogoIcon className="mx-auto h-24 w-auto max-w-full" />
                            <p>
                                Bienvenidos al gestor de contenidos
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
