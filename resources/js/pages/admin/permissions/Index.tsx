import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, MoreHorizontal, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface Permission {
    id: number;
    name: string;
    description: string;
    sector: string;
    sector_label: string;
    roles_count: number;
    created_at: string;
    updated_at: string;
}

interface Props {
    records: {
        data: Permission[];
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
    sectors: Record<string, string>;
    success?: string;
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Permisos',
        href: '/admin/permissions',
    },
];

export default function Index({ records, filters, sectors, success, error }: Props) {
    console.log('🚀🚀🚀 COMPONENTE INDEX PERMISOS INICIADO 🚀🚀🚀');
    console.log('📊 Records recibidos:', records);
    console.log('🔍 Filters recibidos:', filters);
    console.log('🏢 Sectors recibidos:', sectors);
    
    const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const page = usePage();
    const { hasPermission } = usePermissions();

    // Console.log para verificar permisos del usuario en sector permisos
    useEffect(() => {
        console.log('🔍 Index de permisos cargado - verificando permisos...');
        
        const user = (page.props as any).auth?.user;
        console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
        
        if (user) {
            console.log('📧 Email del usuario:', user.email);
            console.log('👥 Roles del usuario:', user.roles);
            
            const userPermissions = user.roles?.flatMap((role: any) => 
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];
            
            const permissionsPermissions = userPermissions.filter((permission: string) => 
                permission.includes('permissions') || permission.includes('permission')
            );

            console.log('=== PERMISOS EN SECTOR PERMISOS ===');
            console.log('Usuario:', user.email);
            console.log('Roles:', user.roles?.map((role: any) => role.name) || []);
            console.log('Todos los permisos:', userPermissions);
            console.log('Permisos de permisos:', permissionsPermissions);
            console.log('Verificación específica:');
            console.log('- view_permissions:', hasPermission('view_permissions'));
            console.log('- create_permissions:', hasPermission('create_permissions'));
            console.log('- edit_permissions:', hasPermission('edit_permissions'));
            console.log('- delete_permissions:', hasPermission('delete_permissions'));
            console.log('- show_permissions:', hasPermission('show_permissions'));
            console.log('================================');
        } else {
            console.log('❌ No se encontró usuario autenticado');
        }
    }, [hasPermission, (page.props as any).auth?.user]);

    // Mostrar alertas de éxito y error cuando cambien
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Función para manejar búsqueda
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/permissions', {
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        router.get('/admin/permissions', {
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar el cambio de página
    const handlePageChange = (page: number) => {
        router.get('/admin/permissions', { 
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar ordenamiento
    const handleSort = (column: string) => {
        let newOrder = 'asc';
        if (sortBy === column && sortOrder === 'asc') {
            newOrder = 'desc';
        }
        setSortBy(column);
        setSortOrder(newOrder);
        router.get('/admin/permissions', {
            search: searchTerm,
            sort_by: column,
            sort_order: newOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para obtener el ícono de ordenamiento
    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />;
    };

    // Función para eliminar permiso
    const handleDelete = (permission: Permission) => {
        router.delete(`/admin/permissions/${permission.id}`, {
            onSuccess: () => {
                toast.success('Permiso eliminado exitosamente');
                setPermissionToDelete(null);
            },
            onError: () => {
                toast.error('Error al eliminar el permiso');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permisos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Permisos</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los permisos del sistema y su asignación a roles
                        </p>
                    </div>
                    {hasPermission('create_permissions') && (
                        <Link href="/admin/permissions/create">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Crear Permiso
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Tabla de Permisos */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle>Lista de permisos</CardTitle>
                                <CardDescription>
                                    Gestiona los permisos del sistema ({records.total} permisos)
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
                                        placeholder="Buscar por nombre o descripción..."
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-foreground">
                                            Nombre
                                            {getSortIcon('name')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>
                                        <button onClick={() => handleSort('sector')} className="flex items-center gap-2 hover:text-foreground">
                                            Sector
                                            {getSortIcon('sector')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Roles</TableHead>
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
                                {records.data.length > 0 ? (
                                    records.data.map((permission) => (
                                    <TableRow key={permission.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline">{permission.name}</Badge>
                                        </TableCell>
                                        <TableCell>{permission.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                                                {permission.sector_label || permission.sector}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {permission.roles_count || 0} {permission.roles_count === 1 ? 'rol' : 'roles'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(permission.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {hasPermission('show_permissions') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/permissions/${permission.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('edit_permissions') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/permissions/${permission.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('delete_permissions') && (
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Eliminar
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Esta acción no se puede deshacer. Se eliminará el permiso
                                                                        "{permission.name}" y se perderán todas las asignaciones a roles.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(permission)}
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Eliminar
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron permisos.
                                        </TableCell>
                                    </TableRow>
                                )}
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
        </AppLayout>
    );
}
