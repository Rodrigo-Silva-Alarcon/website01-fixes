
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Banner } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, GripVertical, Move } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { route } from 'ziggy-js';
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
    useSortable,
} from '@dnd-kit/sortable';
import banners from '@/routes/banners';

interface Props {
    records: {
        data: Banner[];
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
    { title: 'Marcas', href: route('brands.index') },
];

export default function Index({ records, filters, success, error }: Props) {    
    
    const [BannerToDelete, setBannerToDelete] = useState<Banner | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');    
    const page = usePage();
    const { hasPermission } = usePermissions();

    const [banners, setBanners] = useState(records.data);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setBanners((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Enviar petición PUT
                router.put(route('brands.reorder'), { products: newItems.map(item => item.id) }, {
                    onSuccess: () => {
                        toast.success('Orden actualizado');
                    },
                    onError: () => {
                        toast.error('Error al actualizar el orden');
                        // Revertir si error
                        setBanners(items);
                    },
                });

                return newItems;
            });
        }
    };

    const SortableRow = ({ banner, onToggle }: { banner: Banner; onToggle: (banner: Banner) => void }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: banner.id });

        const style = {
            transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
            transition,
            opacity: isDragging ? 0.5 : 1,
        };


        return (
            <TableRow ref={setNodeRef} style={style} {...attributes}>
                <TableCell>
                    <button {...listeners} className="cursor-grab">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                    </button>
                </TableCell>
                <TableCell className="font-medium">{banner.name}</TableCell>
                <TableCell>
                    {new Date(banner.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                    <Switch
                        checked={banner.active}
                        onCheckedChange={() => onToggle(banner)}
                    />
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {/* Botón de editar */}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('brands.edit', banner.id)}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline"
                            onClick={() => setBannerToDelete(banner)}
                            className="text-red-600"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </TableCell>
            </TableRow>
        );
    };

    // Console.log para verificar permisos del usuario en sector textos
    useEffect(() => {
        
        const user = (page.props as any).auth?.user;
        if (user) {            
            const userPermissions = user.roles?.flatMap((role: any) => 
                role.permissions?.map((permission: any) => permission.name) || []
            ) || [];            
            const textsPermissions = userPermissions.filter((permission: string) => 
                permission.includes('texts') || permission.includes('text')
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
        router.get(route('banners.index'), {
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
        router.get(route('brands.index'), {
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
        
        router.get(route('brands.index'), {
            search: searchTerm,
            sort_by: column,
            sort_order: newOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('brands.index'), {
            page,
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (banner: Banner) => {
        router.delete( route('brands.destroy', banner.id), {
            onSuccess: () => {
                toast.success('Categoria eliminada exitosamente');
                setBannerToDelete(null);
            },
            onError: () => {
                toast.error('Error al eliminar el categoria');
            },
        });
    };

    const handleTogglePublish = (banner: Banner) => {
        router.patch(route('brands.toggle-publish', banner.id), {}, {
            onSuccess: () => {
                // Actualizar estado local
                setBanners(prevBanners =>
                    prevBanners.map(b =>
                        b.id === banner.id ? { ...b, active: !b.active } : b
                    )
                );                
                toast.success(banner.active ? 'Banner no publicada' : 'Banner publicada');
            },
            onError: () => {
                toast.error('Error al actualizar el estado del banner');
            },
        });
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Subcategorías" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                {/* Header con botón crear */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-3">Marcas</h1>
                        <p className="text-muted-foreground">Gestiona las marcas del  sistema</p>                        
                    </div>                    
                    <Link href={route('brands.create')}>
                        <Button>
                            <Plus className="h-4 w-4" />
                            Crear Marca
                        </Button>
                    </Link>                    
                </div>

                {/* Card con tabla */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className='mb-3'>Lista de Marcas</CardTitle>
                                <CardDescription>
                                    <small>Gestiona las marcas </small>                                    
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
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead style={{ width:"50px"}}>
                                            
                                        </TableHead>
                                        <TableHead>
                                            <button onClick={() => handleSort('name')} className="flex items-center gap-2 hover:text-foreground">
                                                Marcas
                                                {getSortIcon('name')}
                                            </button>
                                        </TableHead>
                                        <TableHead>
                                            <button onClick={() => handleSort('created_at')} className="flex items-center gap-2 hover:text-foreground">
                                                Creado
                                                {getSortIcon('created_at')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Publicar</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <SortableContext items={banners.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <TableBody>
                                        {banners.map((banner) => (
                                            <SortableRow key={banner.id} banner={banner} onToggle={handleTogglePublish} />
                                        ))}
                                    </TableBody>
                                </SortableContext>
                            </Table>
                        </DndContext>
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
            <AlertDialog open={!!BannerToDelete} onOpenChange={() => setBannerToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el texto "{BannerToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => BannerToDelete && handleDelete(BannerToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
