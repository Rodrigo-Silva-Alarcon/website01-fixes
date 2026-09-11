import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Inventory } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { route } from 'ziggy-js';

interface Props {
    records: {
        data: Inventory[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
    success?: string;
    error?: string;
}


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Inventarios', href: route('inventories.index') },
];

export default function Index({ records, filters, success, error }: Props) {

    const [InventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const page = usePage();
    const { hasPermission } = usePermissions();

    const [inventories, setInventories] = useState(records.data);

    // Console.log para verificar permisos del usuario en sector inventories
    useEffect(() => {

        const user = (page.props as any).auth?.user;
        if (user) {
            const userPermissions = user.roles?.flatMap((role: any) =>
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];
            const inventoriesPermissions = userPermissions.filter((permission: string) =>
                permission.includes('inventories') || permission.includes('inventory')
            );
        } else {
            console.log('❌ No se encontró usuario autenticado');
        }
    }, [hasPermission, (page.props as any).auth?.user]);

    // Mostrar alertas de éxito y error
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('inventories.index'), {
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('inventories.index'), {
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);

        router.get(route('inventories.index'), {
            search: searchTerm,
            sort_by: column,
            sort_order: newOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('inventories.index'), {
            page,
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (inventory: Inventory) => {
        router.delete( route('inventories.destroy', inventory.id), {
            onSuccess: () => {
                toast.success('Inventario eliminado exitosamente');
                setInventoryToDelete(null);
            },
            onError: () => {
                toast.error('Error al eliminar el inventario');
            },
        });
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                {/* Header con botón crear */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-3">Inventarios</h1>
                        <p className="text-muted-foreground">Gestiona los inventarios del sistema</p>
                    </div>
                    <Link href={route('inventories.create')}>
                        <Button>
                            <Plus className="h-4 w-4" />
                            Crear Inventario
                        </Button>
                    </Link>
                </div>

                {/* Card con tabla */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className='mb-3'>Lista de inventarios</CardTitle>
                                <CardDescription>
                                    <small>Gestiona los inventarios del sistema ({records.total} inventarios)</small>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Barra de búsqueda */}
                        <div className="mb-6">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar por producto..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    Buscar
                                </Button>
                                {searchTerm && (
                                    <Button type="button" variant="outline" onClick={clearSearch}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </form>
                        </div>

                        {/* Tabla */}
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <button onClick={() => handleSort('product.name')} className="flex items-center gap-2 hover:text-foreground">
                                            Producto
                                            {getSortIcon('product.name')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button onClick={() => handleSort('amount')} className="flex items-center gap-2 hover:text-foreground">
                                            Monto
                                            {getSortIcon('amount')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button onClick={() => handleSort('stock')} className="flex items-center gap-2 hover:text-foreground">
                                            Stock
                                            {getSortIcon('stock')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button onClick={() => handleSort('money')} className="flex items-center gap-2 hover:text-foreground">
                                            Moneda
                                            {getSortIcon('money')}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 hover:text-foreground">
                                            Creado
                                            {getSortIcon('created_at')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inventories.map((inventory) => (
                                    <TableRow key={inventory.id}>
                                        <TableCell className="font-medium">{inventory.product?.name}</TableCell>
                                        <TableCell>{inventory.amount}</TableCell>
                                        <TableCell>{inventory.stock}</TableCell>
                                        <TableCell>{inventory.money}</TableCell>
                                        <TableCell>
                                            {new Date(inventory.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Botón de editar */}
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('inventories.edit', inventory.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="outline"
                                                    onClick={() => setInventoryToDelete(inventory)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Paginación */}
                        {records.last_page > 1 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
                                        {records.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(records.current_page - 1); }}
                                                    size="sm"
                                                />
                                            </PaginationItem>
                                        )}
                                        {Array.from({ length: records.last_page }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                                                    isActive={page === records.current_page}
                                                    size="sm"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        {records.current_page < records.last_page && (
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(records.current_page + 1); }}
                                                    size="sm"
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal de confirmación de eliminación */}
            <AlertDialog open={!!InventoryToDelete} onOpenChange={() => setInventoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el inventario "{InventoryToDelete?.product?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => InventoryToDelete && handleDelete(InventoryToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}