import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Key, Search, X, ChevronUp, ChevronDown, Eye, MoreHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

// Interfaz para definir la estructura de la paginación de usuarios
interface Props {
    records: {
        data: User[];
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
        title: 'Usuarios',
        href: '/admin/users',
    },
];

export default function Index({ records, filters, success, error }: Props) {
    console.log('🚀🚀🚀 COMPONENTE INDEX USUARIOS INICIADO 🚀🚀🚀');
    console.log('📊 Records recibidos:', records);
    console.log('🔍 Filters recibidos:', filters);
    
    // Estado para el usuario que se va a eliminar
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    // Estado para el término de búsqueda
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    // Estado para el ordenamiento actual
    const [sortBy, setSortBy] = useState(filters.sort_by || 'id');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const page = usePage();
    const { hasPermission } = usePermissions();

    // Console.log para verificar permisos del usuario en sector usuarios
    useEffect(() => {
        console.log('🔍 Index de usuarios cargado - verificando permisos...');
        
        const user = (page.props as any).auth?.user;
        console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
        
        if (user) {
            console.log('📧 Email del usuario:', user.email);
            console.log('👥 Roles del usuario:', user.roles);
            
            const userPermissions = user.roles?.flatMap((role: any) => 
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];
            
            const usersPermissions = userPermissions.filter((permission: string) => 
                permission.includes('users') || permission.includes('user')
            );

            console.log('=== PERMISOS EN SECTOR USUARIOS ===');
            console.log('Usuario:', user.email);
            console.log('Roles:', user.roles?.map((role: any) => role.name) || []);
            console.log('Todos los permisos:', userPermissions);
            console.log('Permisos de usuarios:', usersPermissions);
            console.log('Verificación específica:');
            console.log('- view_users:', hasPermission('view_users'));
            console.log('- create_users:', hasPermission('create_users'));
            console.log('- edit_users:', hasPermission('edit_users'));
            console.log('- delete_users:', hasPermission('delete_users'));
            console.log('- show_users:', hasPermission('show_users'));
            console.log('- change_password:', hasPermission('change_password'));
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

    // Función para manejar la eliminación de un usuario
    const handleDelete = (user: User) => {
        setUserToDelete(user);
    };

    // Función para confirmar la eliminación de un usuario
    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(`/admin/users/${userToDelete.id}`, {
                onSuccess: () => {
                    toast.success('Usuario eliminado exitosamente');
                    setUserToDelete(null);
                },
                onError: () => {
                    toast.error('Error al eliminar el usuario');
                }
            });
        }
    };

    // Función para manejar la búsqueda de usuarios
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { 
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para limpiar la búsqueda
    const clearSearch = () => {
        setSearchTerm('');
        router.get('/admin/users', {
            sort_by: sortBy,
            sort_order: sortOrder
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Función para manejar el cambio de página
    const handlePageChange = (page: number) => {
        router.get('/admin/users', { 
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
        router.get('/admin/users', {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
                        <p className="text-muted-foreground mt-2">
                            Gestiona los roles del sistema y sus permisos asociados
                        </p>
                    </div>
                    {hasPermission('create_users') && (
                        <Link href="/admin/users/create">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Crear Usuario
                            </Button>
                        </Link>
                    )}
                </div>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle>Lista de usuarios</CardTitle>
                                <CardDescription>
                                    Gestiona los usuarios del sistema ({records.total} usuarios)
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
                                        placeholder="Buscar por nombre o email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button type="submit" variant="outline">
                                    Buscar
                                </Button>
                                {filters.search && (
                                    <Button type="button" variant="outline" onClick={clearSearch}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </form>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* Columna ID con ordenamiento */}
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50 select-none"
                                        onClick={() => handleSort('id')}
                                    >
                                        <div className="flex items-center gap-2">
                                            ID
                                            {getSortIcon('id')}
                                        </div>
                                    </TableHead>
                                    
                                    {/* Columna Nombre con ordenamiento */}
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50 select-none"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Nombre Completo
                                            {getSortIcon('name')}
                                        </div>
                                    </TableHead>
                                    
                                    {/* Columna Email con ordenamiento */}
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50 select-none"
                                        onClick={() => handleSort('email')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Email
                                            {getSortIcon('email')}
                                        </div>
                                    </TableHead>
                                    
                                    {/* Columna Alias con ordenamiento */}
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50 select-none"
                                        onClick={() => handleSort('alias')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Alias
                                            {getSortIcon('alias')}
                                        </div>
                                    </TableHead>
                                    
                                    {/* Columna Roles */}
                                    <TableHead>
                                        Roles
                                    </TableHead>
                                    
                                    {/* Columna Fecha de Creación con ordenamiento */}
                                    <TableHead 
                                        className="cursor-pointer hover:bg-gray-50 select-none"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Fecha de Creación
                                            {getSortIcon('created_at')}
                                        </div>
                                    </TableHead>
                                    
                                    {/* Columna de Acciones (sin ordenamiento) */}
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Renderizar cada usuario en una fila */}
                                {records.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{[user.name, user.last_name, user.last2_name].filter(Boolean).join(' ')}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.alias}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <span
                                                            key={role.id}
                                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                        >
                                                            {role.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-500">Sin roles</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Botón de ver */}
                                                {hasPermission('show_users') && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                
                                                {/* Botón de editar */}
                                                {hasPermission('edit_users') && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                
                                                {/* Botón de cambiar contraseña */}
                                                {hasPermission('change_password') && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/users/${user.id}/password`}>
                                                            <Key className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                
                                                {/* Botón de eliminar con protección para administradores */}
                                                {hasPermission('delete_users') && user.email !== 'admin@example.com' ? (
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(user)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Esta acción no se puede deshacer. Esto eliminará permanentemente el usuario{' '}
                                                                    <strong>{user.name}</strong> y todos sus datos asociados.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={confirmDelete}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Eliminar
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled
                                                        className="text-gray-400"
                                                        title="No se puede eliminar el administrador"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Controles de paginación */}
                        {records.last_page > 1 && (
                            <div className="mt-6 flex justify-center">
                                <Pagination>
                                    <PaginationContent>
                                        {/* Botón página anterior */}
                                        {records.current_page > 1 && (
                                            <PaginationItem>
                                                <PaginationPrevious 
                                                    href="#"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(records.current_page - 1);
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}
                                        
                                        {/* Números de página */}
                                        {Array.from({ length: records.last_page }, (_, i) => i + 1).map((page) => (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    size="sm"
                                                    isActive={page === records.current_page}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(page);
                                                    }}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        ))}
                                        
                                        {/* Botón página siguiente */}
                                        {records.current_page < records.last_page && (
                                            <PaginationItem>
                                                <PaginationNext 
                                                    href="#"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handlePageChange(records.current_page + 1);
                                                    }}
                                                />
                                            </PaginationItem>
                                        )}
                                    </PaginationContent>
                                </Pagination>
                            </div>
                        )}

                        {/* Información de paginación */}
                        <div className="mt-4 text-sm text-gray-500 text-center">
                            Mostrando {records.from} a {records.to} de {records.total} usuarios
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
