import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Cart } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Trash2, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

interface Paginated {
    data: Array<Cart & {
        created_at?: string;
        user?: { id: number; name: string; email: string } | null;
        cart_items_count?: number;
    }>;
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

interface Props {
    records: Paginated;
    filters: { search?: string };
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Carritos', href: route('admin.carts.index') },
];

export default function Index({ records, filters, success, error }: Props) {
    const [cartToDelete, setCartToDelete] = useState<(Paginated['data'][number]) | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    useEffect(() => {
        if (success) toast.success(success);
        if (error) toast.error(error);
    }, [success, error]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.carts.index'), { search: searchTerm }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearSearch = () => {
        setSearchTerm('');
        router.get(route('admin.carts.index'), {}, { preserveState: true, replace: true });
    };

    const handlePageChange = (next: number) => {
        router.get(route('admin.carts.index'), {
            search: searchTerm || undefined,
            page: next,
        }, { preserveState: true, replace: true });
    };

    const handleDelete = (cart: Paginated['data'][number]) => {
        router.delete(route('admin.carts.destroy', cart.id), {
            onSuccess: () => {
                toast.success('Carrito eliminado');
                setCartToDelete(null);
            },
            onError: () => {
                toast.error('No se pudo eliminar el carrito');
                setCartToDelete(null);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Carritos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-3">Carritos de Compras</h1>
                        <p className="text-muted-foreground">Gestiona los carritos de los clientes</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="mb-3">Lista de carritos</CardTitle>
                        <CardDescription>
                            <small>Gestiona los carritos del sistema ({records.total} carritos)</small>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder="Buscar por usuario o sesión..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="outline">Buscar</Button>
                                {searchTerm && (
                                    <Button type="button" variant="outline" onClick={clearSearch}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </form>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Sesión</TableHead>
                                    <TableHead>Ítems</TableHead>
                                    <TableHead>Creado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                                            No hay carritos registrados
                                        </TableCell>
                                    </TableRow>
                                )}
                                {records.data.map((cart) => (
                                    <TableRow key={cart.id}>
                                        <TableCell className="font-medium">#{cart.id}</TableCell>
                                        <TableCell>
                                            {cart.user
                                                ? <div>
                                                    <div className="font-medium">{cart.user.name}</div>
                                                    <div className="text-sm text-muted-foreground">{cart.user.email}</div>
                                                  </div>
                                                : <span className="text-muted-foreground">Invitado ({cart.cart_session})</span>
                                            }
                                        </TableCell>
                                        <TableCell>{cart.cart_session}</TableCell>
                                        <TableCell>{cart.cart_items_count ?? cart.cartItems?.length ?? cart.cart_items?.length ?? 0}</TableCell>
                                        <TableCell>
                                            {cart.created_at ? new Date(cart.created_at).toLocaleDateString() : '—'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                onClick={() => setCartToDelete(cart)}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

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
                                        {Array.from({ length: records.last_page }, (_, i) => i + 1).map((p) => (
                                            <PaginationItem key={p}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handlePageChange(p); }}
                                                    isActive={p === records.current_page}
                                                    size="sm"
                                                >
                                                    {p}
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

            <AlertDialog open={!!cartToDelete} onOpenChange={() => setCartToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el carrito #{cartToDelete?.id}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => cartToDelete && handleDelete(cartToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
