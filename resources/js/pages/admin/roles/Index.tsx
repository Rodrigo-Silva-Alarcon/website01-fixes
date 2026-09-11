import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, MoreHorizontal, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface Role {
    id: number;
    name: string;
    description: string;
    permissions_count: number;
    users_count: number;
    created_at: string;
    updated_at: string;
}

// Interfaz para definir la estructura de la paginación de roles
interface Props {
    records: {
        data: Role[];
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

// Definir breadcrumbs para la navegación
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
];

export default function Index({ records, filters, success, error }: Props) {
    console.log('🚀🚀🚀 COMPONENTE INDEX ROLES INICIADO 🚀🚀🚀');
    console.log('📊 Records recibidos:', records);
    console.log('🔍 Filters recibidos:', filters);
    
    // Estado para el rol que se va a eliminar
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    // Estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    // Estado para el ordenamiento
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const page = usePage();
    const { hasPermission } = usePermissions();

    // Console.log para verificar permisos del usuario en sector roles
    useEffect(() => {
        console.log('🔍 Index de roles cargado - verificando permisos...');
        
        const user = (page.props as any).auth?.user;
        console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
        
        if (user) {
            console.log('📧 Email del usuario:', user.email);
            console.log('👥 Roles del usuario:', user.roles);
            
            const userPermissions = user.roles?.flatMap((role: any) => 
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];
            
            const rolesPermissions = userPermissions.filter((permission: string) => 
                permission.includes('roles') || permission.includes('role')
            );

            console.log('=== PERMISOS EN SECTOR ROLES ===');
            console.log('Usuario:', user.email);
            console.log('Roles:', user.roles?.map((role: any) => role.name) || []);
            console.log('Todos los permisos:', userPermissions);
            console.log('Permisos de roles:', rolesPermissions);
            console.log('Verificación específica:');
            console.log('- view_roles:', hasPermission('view_roles'));
            console.log('- create_roles:', hasPermission('create_roles'));
            console.log('- edit_roles:', hasPermission('edit_roles'));
            console.log('- delete_roles:', hasPermission('delete_roles'));
            console.log('- show_roles:', hasPermission('show_roles'));
            console.log('================================');
        } else {
            console.log('❌ No se encontró usuario autenticado');
        }
    }, [hasPermission, (page.props as any).auth?.user]);

    // Mostrar notificaciones de éxito/error
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
        router.get('/admin/roles', {
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
        router.get('/admin/roles', {
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar el cambio de página
    const handlePageChange = (page: number) => {
        router.get('/admin/roles', { 
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
            page: page 
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar el ordenamiento por columnas
    const handleSort = (column: string) => {
        let newSortOrder = 'asc';
        
        // Si ya está ordenando por esta columna, cambiar el orden
        if (sortBy === column) {
            newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        }
        
        // Actualizar estados
        setSortBy(column);
        setSortOrder(newSortOrder);
        
        // Hacer la petición con los nuevos parámetros de ordenamiento
        router.get('/admin/roles', {
            search: searchTerm,
            sort_by: column,
            sort_order: newSortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para obtener el icono de ordenamiento
    const getSortIcon = (column: string) => {
        if (sortBy !== column) {
            return null; // No mostrar icono si no es la columna activa
        }
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    // Función para eliminar rol
    const handleDelete = (role: Role) => {
        router.delete(`/admin/roles/${role.id}`, {
            onSuccess: () => {
                toast.success('Rol eliminado exitosamente');
            },
            onError: () => {
                toast.error('Error al eliminar el rol');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los roles del sistema y sus permisos asociados
                        </p>
                    </div>
                    {hasPermission('create_roles') && (
                        <Link href="/admin/roles/create">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Crear Rol
                            </Button>
                        </Link>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle>Lista de roles</CardTitle>
                                <CardDescription>
                                    Gestiona los roles del sistema ({records.total} roles)
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
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-2 hover:text-foreground"
                                        >
                                            Nombre
                                            {getSortIcon('name')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead>Permisos</TableHead>
                                    <TableHead>Usuarios</TableHead>
                                    <TableHead>
                                        <button
                                            onClick={() => handleSort('created_at')}
                                            className="flex items-center gap-2 hover:text-foreground"
                                        >
                                            Creado
                                            {getSortIcon('created_at')}
                                        </button>
                                    </TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.data.length > 0 ? (
                                    records.data.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell className="font-medium">
                                            <Badge variant="outline">{role.name}</Badge>
                                        </TableCell>
                                        <TableCell>{role.description}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {role.permissions_count} permisos
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {role.users_count} usuarios
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(role.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {hasPermission('show_roles') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/roles/${role.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('edit_roles') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/roles/${role.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('delete_roles') && (
                                                        <DropdownMenuItem 
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                setRoleToDelete(role);
                                                            }}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">
                                            No se encontraron roles.
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
                                        {/* Botón Anterior */}
                                        {records.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(records.current_page - 1);
                                                    }}
                                                    size="sm"
                                                />
                                            </PaginationItem>
                                        )}

                                        {/* Números de página */}
                                        {Array.from({ length: records.last_page }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                    isActive={page === records.current_page}
                                                    size="sm"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}

                                        {/* Botón Siguiente */}
                                        {records.current_page < records.last_page && (
                                            <PaginationItem>
                                                <PaginationNext 
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(records.current_page + 1);
                                                    }}
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

                {/* Modal de confirmación para eliminar rol */}
                <AlertDialog open={!!roleToDelete} onOpenChange={() => setRoleToDelete(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará el rol
                                "{roleToDelete?.name}" y se perderán todas las asignaciones de permisos.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setRoleToDelete(null)}>
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (roleToDelete) {
                                        handleDelete(roleToDelete);
                                        setRoleToDelete(null);
                                    }
                                }}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
