import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, X, ChevronUp, ChevronDown, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { route } from 'ziggy-js';
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';

export interface Paginator<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export interface IndexFilters {
    search?: string;
    sort_by?: string;
    sort_order?: string;
}

export interface RowHelpers<T> {
    toggle: (() => void) | null;
}

export interface EntityColumn<T> {
    key: string;
    label: ReactNode;
    sortable?: boolean;
    sortKey?: string;
    className?: string;
    headerClassName?: string;
    render: (item: T, helpers: RowHelpers<T>) => ReactNode;
}

export interface EntityIndexMessages {
    deleted?: string;
    deleteFailed?: string;
    published?: string;
    unpublished?: string;
    toggleFailed?: string;
}

export interface EntityIndexProps<T extends { id: number }> {
    entity: string;
    heading: string;
    label: string;
    subtitle: string;
    listTitle: string;
    countLabel: string;
    createLabel: string;
    searchPlaceholder?: string;
    defaultSortBy?: string;
    defaultSortOrder?: 'asc' | 'desc';
    columns: EntityColumn<T>[];
    records: Paginator<T>;
    filters: IndexFilters;
    success?: string;
    error?: string;
    reorderKey?: string;
    toggle?: boolean;
    toolbar?: ReactNode;
    deleteName?: (item: T) => string;
    messages?: EntityIndexMessages;
    /** Botones extra en la columna de acciones, antes de editar/eliminar. */
    rowActions?: (item: T) => ReactNode;
}

function SortableRow<T extends { id: number }>({
    entity,
    item,
    columns,
    helpers,
    onDelete,
    rowActions,
}: {
    entity: string;
    item: T;
    columns: EntityColumn<T>[];
    helpers: RowHelpers<T>;
    onDelete: () => void;
    rowActions?: (item: T) => ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

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
            {columns.map((column) => (
                <TableCell key={column.key} className={column.className}>
                    {column.render(item, helpers)}
                </TableCell>
            ))}
            <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    {rowActions?.(item)}
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route(`${entity}.edit`, item.id)}>
                            <Edit className="h-4 w-4" />
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={onDelete} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function EntityIndex<T extends { id: number }>({
    entity,
    heading,
    label,
    subtitle,
    listTitle,
    countLabel,
    createLabel,
    searchPlaceholder = 'Buscar por nombre o resumen...',
    defaultSortBy = 'name',
    defaultSortOrder = 'asc',
    columns,
    records,
    filters,
    success,
    error,
    reorderKey,
    toggle,
    toolbar,
    deleteName,
    messages = {},
    rowActions,
}: EntityIndexProps<T>) {
    const [itemToDelete, setItemToDelete] = useState<T | null>(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || defaultSortBy);
    const [sortOrder, setSortOrder] = useState(filters.sort_order || defaultSortOrder);
    const [items, setItems] = useState(records.data);

    useEffect(() => {
        setItems(records.data);
    }, [records.data]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    const indexParams = (extra: Record<string, unknown> = {}) => ({
        search: searchTerm,
        sort_by: sortBy,
        sort_order: sortOrder,
        ...extra,
    });

    const runSearch = (term: string) => {
        router.get(route(`${entity}.index`), indexParams({ search: term.trim() || undefined }), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Búsqueda en tiempo real (con debounce) mientras se escribe
    const lastSearched = useRef(filters.search || '');
    useEffect(() => {
        if (searchTerm.trim() === lastSearched.current.trim()) return;
        const timer = setTimeout(() => {
            lastSearched.current = searchTerm;
            runSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        lastSearched.current = searchTerm;
        runSearch(searchTerm);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleSort = (column: string) => {
        const newOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newOrder);

        router.get(route(`${entity}.index`), indexParams({ sort_by: column, sort_order: newOrder }), {
            preserveState: true,
            replace: true,
        });
    };

    const handlePageChange = (page: number) => {
        router.get(route(`${entity}.index`), indexParams({ page }), {
            preserveState: true,
            replace: true,
        });
    };

    const handleDelete = (item: T) => {
        router.delete(route(`${entity}.destroy`, item.id), {
            onSuccess: () => {
                toast.success(messages.deleted || `${label} eliminado/a exitosamente`);
                setItemToDelete(null);
            },
            onError: () => {
                toast.error(messages.deleteFailed || `Error al eliminar ${label.toLowerCase()}`);
            },
        });
    };

    const handleTogglePublish = (item: T) => {
        if (!toggle) return;
        router.patch(route(`${entity}.toggle-publish`, item.id), {}, {
            onSuccess: () => {
                setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, active: !i.active } : i)));
                toast.success(item.active ? messages.unpublished || `${label} no publicado/a` : messages.published || `${label} publicado/a`);
            },
            onError: () => {
                toast.error(messages.toggleFailed || 'Error al actualizar el estado');
            },
        });
    };

    const handleDragEnd = (event: any) => {
        if (!reorderKey) return;
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(prev, oldIndex, newIndex);

                router.put(
                    route(`${entity}.reorder`),
                    { [reorderKey]: newItems.map((item) => item.id) },
                    {
                        onSuccess: () => {
                            toast.success('Orden actualizado');
                        },
                        onError: () => {
                            toast.error('Error al actualizar el orden');
                            setItems(prev);
                        },
                    },
                );

                return newItems;
            });
        }
    };

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null;
        return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
    };

    const rowHelpers = (item: T): RowHelpers<T> => ({
        toggle: toggle ? () => handleTogglePublish(item) : null,
    });

    const deleteDialogName = (item: T) => (deleteName ? deleteName(item) : String((item as any).name ?? ''));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Panel de Control', href: route('admin.dashboard') },
        { title: heading, href: route(`${entity}.index`) },
    ];

    const renderHeaderRow = () => (
        <TableRow>
            {reorderKey && <TableHead style={{ width: '50px' }} />}
            {columns.map((column) => (
                <TableHead key={column.key} className={column.headerClassName}>
                    {column.sortable ? (
                        <button
                            onClick={() => handleSort(column.sortKey || column.key)}
                            className="flex items-center gap-2 hover:text-foreground"
                        >
                            {column.label}
                            {getSortIcon(column.sortKey || column.key)}
                        </button>
                    ) : (
                        column.label
                    )}
                </TableHead>
            ))}
            <TableHead className="text-right w-[80px]">Acciones</TableHead>
        </TableRow>
    );

    const renderBody = () =>
        reorderKey ? (
            <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                    {items.map((item) => (
                        <SortableRow
                            key={item.id}
                            entity={entity}
                            item={item}
                            columns={columns}
                            helpers={rowHelpers(item)}
                            onDelete={() => setItemToDelete(item)}
                            rowActions={rowActions}
                        />
                    ))}
                </TableBody>
            </SortableContext>
        ) : (
            <TableBody>
                {items.map((item) => (
                    <TableRow key={item.id}>
                        {columns.map((column) => (
                            <TableCell key={column.key} className={column.className}>
                                {column.render(item, rowHelpers(item))}
                            </TableCell>
                        ))}
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                                {rowActions?.(item)}
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route(`${entity}.edit`, item.id)}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button variant="outline" onClick={() => setItemToDelete(item)} className="text-red-600">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={heading} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-6">
                {/* Header con botón crear */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-3">{heading}</h1>
                        <p className="text-muted-foreground">{subtitle}</p>
                    </div>
                    <Link href={route(`${entity}.create`)}>
                        <Button>
                            <Plus className="h-4 w-4" />
                            {createLabel}
                        </Button>
                    </Link>
                </div>

                {/* Card con tabla */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="mb-3">{listTitle}</CardTitle>
                                <CardDescription>
                                    <small>
                                        {subtitle} ({records.total} {countLabel})
                                    </small>
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filtros extra (p. ej. categoría/subcategoría en productos) */}
                        {toolbar}

                        {/* Barra de búsqueda */}
                        <div className="mb-6">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        type="text"
                                        placeholder={searchPlaceholder}
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
                        {reorderKey ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <Table>
                                    <TableHeader>{renderHeaderRow()}</TableHeader>
                                    {renderBody()}
                                </Table>
                            </DndContext>
                        ) : (
                            <Table>
                                <TableHeader>{renderHeaderRow()}</TableHeader>
                                {renderBody()}
                            </Table>
                        )}

                        {/* Paginación */}
                        {records.last_page > 1 && (
                            <div className="mt-6">
                                <Pagination>
                                    <PaginationContent>
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
            </div>

            {/* Modal de confirmación de eliminación */}
            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente "{itemToDelete ? deleteDialogName(itemToDelete) : ''}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>Eliminar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
