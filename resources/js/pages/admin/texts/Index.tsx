import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, MoreHorizontal, Eye, Calendar, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';

interface Text {
    id: number;
    name: string;
    date: string;
    gender: string;
    gender_label: string;
    type: string[];
    type_labels: string;
    print_view: string;
    print_view_label: string;
    image: string | null;
    image_url: string | null;
    summary: string | null;
    content: string | null;
    publish: boolean;
    created_at: string;
}

interface Props {
    records: {
        data: Text[];
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
    { title: 'Panel de Control', href: '/admin/dashboard' },
    { title: 'Textos', href: '/admin/texts' },
];

export default function Index({ records, filters, success, error }: Props) {
    console.log('🚀🚀🚀 COMPONENTE INDEX TEXTOS INICIADO 🚀🚀🚀');
    console.log('📊 Records recibidos:', records);
    console.log('🔍 Filters recibidos:', filters);
    
    const [textToDelete, setTextToDelete] = useState<Text | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const page = usePage();
    const { hasPermission } = usePermissions();

    // Console.log para verificar permisos del usuario en sector textos
    useEffect(() => {
        console.log('🔍 Index de textos cargado - verificando permisos...');
        
        const user = (page.props as any).auth?.user;
        console.log('👤 Usuario encontrado:', user ? 'SÍ' : 'NO');
        
        if (user) {
            console.log('📧 Email del usuario:', user.email);
            console.log('👥 Roles del usuario:', user.roles);
            
            const userPermissions = user.roles?.flatMap((role: any) => 
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];
            
            const textsPermissions = userPermissions.filter((permission: string) => 
                permission.includes('texts') || permission.includes('text')
            );

            console.log('=== PERMISOS EN SECTOR TEXTOS ===');
            console.log('Usuario:', user.email);
            console.log('Roles:', user.roles?.map((role: any) => role.name) || []);
            console.log('Todos los permisos:', userPermissions);
            console.log('Permisos de textos:', textsPermissions);
            console.log('Verificación específica:');
            console.log('- view_texts:', hasPermission('view_texts'));
            console.log('- create_texts:', hasPermission('create_texts'));
            console.log('- edit_texts:', hasPermission('edit_texts'));
            console.log('- delete_texts:', hasPermission('delete_texts'));
            console.log('- show_texts:', hasPermission('show_texts'));
            console.log('- publish_texts_texts:', hasPermission('publish_texts_texts'));
            console.log('================================');
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
        router.get('/admin/texts', {
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
        router.get('/admin/texts', {
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
        
        router.get('/admin/texts', {
            search: searchTerm,
            sort_by: column,
            sort_order: newOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get('/admin/texts', {
            page,
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (text: Text) => {
        router.delete(`/admin/texts/${text.id}`, {
            onSuccess: () => {
                toast.success('Texto eliminado exitosamente');
                setTextToDelete(null);
            },
            onError: () => {
                toast.error('Error al eliminar el texto');
            },
        });
    };

    const handleTogglePublicar = (text: Text) => {
        router.patch(`/admin/texts/${text.id}/toggle-publish`, {}, {
            onSuccess: () => {
                toast.success(text.publish ? 'Texto no publicado' : 'Texto publicado');
            },
            onError: () => {
                toast.error('Error al cambiar el estado de publicación');
            },
        });
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Textos" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header con botón crear */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Textos</h1>
                        <p className="text-muted-foreground">Gestiona los textos del sistema</p>
                    </div>
                    {hasPermission('create_texts') && (
                        <Link href="/admin/texts/create">
                            <Button>
                                <Plus className="h-4 w-4" />
                                Crear Texto
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Card con tabla */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Lista de textos</CardTitle>
                                <CardDescription>
                                    Gestiona los textos del sistema ({records.total} textos)
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
                                        placeholder="Buscar por nombre o resumen..."
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
                                        <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-foreground">
                                            Nombre
                                            {getSortIcon('name')}
                                        </button>
                                    </TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Género</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Vista Impresión</TableHead>
                                    <TableHead>Imagen</TableHead>
                                    <TableHead>Publicar</TableHead>
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
                                {records.data.map((text) => (
                                    <TableRow key={text.id}>
                                        <TableCell className="font-medium">{text.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(text.date).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {text.gender_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {text.type.map((type, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {type === 'report' ? 'Reporte' : 
                                                         type === 'article' ? 'Artículo' : 'Noticia'}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {text.print_view_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {text.image_url ? (
                                                <div className="flex items-center gap-2">
                                                    <Image className="h-4 w-4 text-green-600" />
                                                    <span className="text-xs text-green-600">Sí</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">No</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {hasPermission('publish_texts_texts') ? (
                                                <Switch
                                                    checked={text.publish}
                                                    onCheckedChange={() => handleTogglePublicar(text)}
                                                />
                                            ) : (
                                                <Badge variant={text.publish ? "default" : "secondary"}>
                                                    {text.publish ? 'Publicado' : 'No Publicado'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(text.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {hasPermission('show_texts') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/texts/${text.id}`}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Ver
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('edit_texts') && (
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/admin/texts/${text.id}/edit`}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Editar
                                                            </Link>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {hasPermission('delete_texts') && (
                                                        <DropdownMenuItem 
                                                            onClick={() => setTextToDelete(text)}
                                                            className="text-red-600"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
            <AlertDialog open={!!textToDelete} onOpenChange={() => setTextToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el texto "{textToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => textToDelete && handleDelete(textToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
