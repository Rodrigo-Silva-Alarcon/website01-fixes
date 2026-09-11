
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Product, Category, Subcategory } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, GripVertical, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { route } from 'ziggy-js';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Props {
    records: {
        data: Product[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    categories:Category[];
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
    { title: 'Productos', href: route('products.index') },
];

export default function Index({ records, categories, filters, success, error }: Props) {    
    
    const [CategoryToDelete, setSubcategoryToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const page = usePage();
    const { hasPermission } = usePermissions();
    const params = new URLSearchParams(window.location.search);

    const category_Id = params.get("category_id");
    const [category_id, setCategoryId] = useState<number | null>(category_Id ? Number(category_Id) : null);

    const [subcategory_id, setSubcategoryId] = useState<number | ''>('');
    const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);

    const [products, setProducts] = useState(records.data);

    // Actualizar subcategorías disponibles cuando cambia la categoría
    useEffect(() => {
        if (category_id) {
            const selectedCategory = categories.find(cat => cat.id === category_id);
            setAvailableSubcategories(selectedCategory?.subcategories || []);
        } else {
            setAvailableSubcategories([]);
        }
    }, [category_id, categories]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );
    
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setProducts((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Enviar petición PUT
                router.put(route('products.reorder'), { products: newItems.map(item => item.id) }, {
                    onSuccess: () => {
                        toast.success('Orden actualizado');
                    },
                    onError: () => {
                        toast.error('Error al actualizar el orden');
                        // Revertir si error
                        setProducts(items);
                    },
                });

                return newItems;
            });
        }
    };

    const SortableRow = ({ product, onToggle }: { product: Product; onToggle: (product:Product) => void }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: product.id });

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
                <TableCell className="font-medium">
                    <Link href={route('products.edit', product.id)}>
                        {product.name}
                    </Link>                    
                </TableCell>
                <TableCell>
                    {product.category_label}
                </TableCell>
                <TableCell>                    
                    {product.pop &&(
                        <Check className='text-green-800' />
                    )}
                </TableCell>
                <TableCell>
                    {product.featured &&(
                        <Check className='text-green-800'/>
                    )}
                </TableCell>
                <TableCell>
                    <Switch
                        checked={product.active}
                        onCheckedChange={() => onToggle(product)}
                    />
                </TableCell>
                <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {/* Botón de editar */}
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('products.edit', product.id)}>
                                <Edit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline"
                            onClick={() => setSubcategoryToDelete(product)}
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
            //console.log('❌ No se encontró usuario autenticado');
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
        router.get(route('products.index'), {
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
        router.get(route('products.index'), {
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
        
        router.get(route('products.index'), {
            search: searchTerm,
            sort_by: column,
            sort_order: newOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route('products.index'), {
            page,
            search: searchTerm,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (product: Product) => {
        router.delete( route('products.destroy', product.id), {
            onSuccess: () => {
                toast.success('Categoria eliminada exitosamente');
                setSubcategoryToDelete(null);
            },
            onError: () => {
                toast.error('Error al eliminar el categoria');
            },
        });
    };

    const handleTogglePublicar = (product: Product) => {        
        router.patch( route('products.toggle-publish', product.id), {}, {
            onSuccess: () => {
                toast.success(product.active ? 'Categoría no publicada' : 'Categoría publicada');
            },
            onError: () => {
                toast.error('Error al cambiar el estado de publicación');
            },
        });
    };
    const handleTogglePublish = (product:Product) => {
        router.patch(route('products.toggle-publish', product.id), {}, {
            onSuccess:() => {
                setProducts(prevProducts => prevProducts.map(b => 
                    b.id === product.id?{...b, active: !b.active} : b
                ));
                toast.success(product.active?'Producto no publicado':'Producto publicado');
            },
            onError: () => {
                toast.error('Error al actualizar el producto');
            }
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
                        <h1 className="text-2xl font-bold mb-3">Productos</h1>
                        <p className="text-muted-foreground">Gestiona los productos del  sistema</p>                        
                    </div>                    
                    <Link href={route('products.create')}>
                        <Button>
                            <Plus className="h-4 w-4" />
                            Crear Producto
                        </Button>
                    </Link>                    
                </div>

                {/* Card con tabla */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className='mb-3'>Lista de productos</CardTitle>
                                <CardDescription>
                                    <small>Gestiona los productos del sistema ({records.total} productos)</small>                                    
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Barra de búsqueda */}
                        <div className='flex mb-3'>
                            {/* Categoría */}
                            <div className="grid gap-2 min-w-[200px] me-3 ">
                                <Label htmlFor="category">Categoría</Label>
                                <Select
                                    value={category_id ? String(category_id) : ''}
                                    onValueChange={(value) => {
                                        const selectedId = Number(value);
                                        setCategoryId(selectedId);
                                        const selectedCategory = categories.find(cat => cat.id === selectedId);
                                        setAvailableSubcategories(selectedCategory?.subcategories || []);
                                        setSubcategoryId('');
                                        if(!selectedCategory || !selectedCategory.subcategories.length){                                            
                                            router.get(route('products.index'), { category_id: selectedId });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>                                        
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                        </SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Subcategoría */}
                            {availableSubcategories.length > 0 && (
                                <div className="grid gap-2 min-w-[200px]">
                                    <Label htmlFor="subcategory">Subcategoría</Label>
                                    <Select
                                        value={subcategory_id ? String(subcategory_id) : ''}
                                        onValueChange={(value) => {
                                            const selectedId = Number(value);
                                            setSubcategoryId(selectedId);
                                            // Redirigir automáticamente a la ruta filtrada por subcategoría
                                            router.get(route('products.index'), { category_id: category_id, subcategory_id: selectedId });
                                        }}
                                        disabled={!availableSubcategories.length}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una subcategoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubcategories.map((subcategory) => (
                                                <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                                                {subcategory.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                        </div>

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
                                                Producto
                                                {getSortIcon('name')}
                                            </button>
                                        </TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead className='w-[70px]'>Popular</TableHead>
                                        <TableHead className='w-[70px]'>Destacado</TableHead>
                                        <TableHead className='w-[70px]'>Publicar</TableHead>
                                        <TableHead className="text-right w-[80px]">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <SortableContext items={products.map(c => c.id)} strategy={verticalListSortingStrategy}>
                                    <TableBody>
                                        {products.map((product) => (                                            
                                            <SortableRow key={product.id} product={product} onToggle={handleTogglePublish} />
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
            <AlertDialog open={!!CategoryToDelete} onOpenChange={() => setSubcategoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el texto "{CategoryToDelete?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => CategoryToDelete && handleDelete(CategoryToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
