import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Switch } from '@/components/ui/switch';
import { type Subcategory } from '@/types';

interface Props {
    records: Paginator<Subcategory>;
    filters: IndexFilters;
    success?: string;
    error?: string;
}

export default function Index({ records, filters, success, error }: Props) {
    const columns: EntityColumn<Subcategory>[] = [
        {
            key: 'name',
            label: 'Subcategoría',
            sortable: true,
            className: 'font-medium',
            render: (subcategory) => subcategory.name,
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            render: (subcategory) => new Date(subcategory.created_at).toLocaleDateString(),
        },
        {
            key: 'active',
            label: 'Publicar',
            render: (subcategory, helpers) => (
                <Switch checked={subcategory.active} onCheckedChange={() => helpers.toggle?.()} />
            ),
        },
    ];

    return (
        <EntityIndex
            entity="subcategories"
            heading="Subcategorías"
            label="Subcategoría"
            subtitle="Gestiona las subcategorías del sistema"
            listTitle="Lista de subcategorías"
            countLabel="subcategorías"
            createLabel="Crear Subcategoría"
            reorderKey="subcategories"
            toggle
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            messages={{
                deleted: 'Subcategoría eliminada exitosamente',
                deleteFailed: 'Error al eliminar la subcategoría',
                published: 'Subcategoría publicada',
                unpublished: 'Subcategoría no publicada',
                toggleFailed: 'Error al actualizar la subcategoría',
            }}
        />
    );
}
