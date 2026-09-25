import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Switch } from '@/components/ui/switch';
import { type Brand } from '@/types';

interface Props {
    records: Paginator<Brand>;
    filters: IndexFilters;
    success?: string;
    error?: string;
}

export default function Index({ records, filters, success, error }: Props) {
    const columns: EntityColumn<Brand>[] = [
        {
            key: 'name',
            label: 'Marca',
            sortable: true,
            className: 'font-medium',
            render: (brand) => brand.name,
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            render: (brand) => new Date(brand.created_at).toLocaleDateString(),
        },
        {
            key: 'active',
            label: 'Publicar',
            render: (brand, helpers) => (
                <Switch checked={brand.active} onCheckedChange={() => helpers.toggle?.()} />
            ),
        },
    ];

    return (
        <EntityIndex
            entity="brands"
            heading="Marcas"
            label="Marca"
            subtitle="Gestiona las marcas del sistema"
            listTitle="Lista de marcas"
            countLabel="marcas"
            createLabel="Crear Marca"
            reorderKey="brands"
            toggle
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            messages={{
                deleted: 'Marca eliminada exitosamente',
                deleteFailed: 'Error al eliminar la marca',
                published: 'Marca publicada',
                unpublished: 'Marca no publicada',
                toggleFailed: 'Error al actualizar la marca',
            }}
        />
    );
}
