import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Switch } from '@/components/ui/switch';
import { type Category } from '@/types';

interface Props {
    records: Paginator<Category>;
    filters: IndexFilters;
    success?: string;
    error?: string;
}

export default function Index({ records, filters, success, error }: Props) {
    const columns: EntityColumn<Category>[] = [
        {
            key: 'name',
            label: 'Categoría',
            sortable: true,
            className: 'font-medium',
            render: (category) => category.name,
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            render: (category) => new Date(category.created_at).toLocaleDateString(),
        },
        {
            key: 'active',
            label: 'Publicar',
            render: (category, helpers) => (
                <Switch checked={category.active} onCheckedChange={() => helpers.toggle?.()} />
            ),
        },
    ];

    return (
        <EntityIndex
            entity="categories"
            heading="Categorías"
            label="Categoría"
            subtitle="Gestiona las categorías del sistema"
            listTitle="Lista de categorías"
            countLabel="categorías"
            createLabel="Crear Categoría"
            reorderKey="categories"
            toggle
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            messages={{
                deleted: 'Categoría eliminada exitosamente',
                deleteFailed: 'Error al eliminar la categoría',
                published: 'Categoría publicada',
                unpublished: 'Categoría no publicada',
                toggleFailed: 'Error al actualizar la categoría',
            }}
        />
    );
}
