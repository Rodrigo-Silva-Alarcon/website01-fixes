import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Switch } from '@/components/ui/switch';
import { type Banner } from '@/types';

interface Props {
    records: Paginator<Banner>;
    filters: IndexFilters;
    success?: string;
    error?: string;
}

export default function Index({ records, filters, success, error }: Props) {
    const columns: EntityColumn<Banner>[] = [
        {
            key: 'name',
            label: 'Banner',
            sortable: true,
            className: 'font-medium',
            render: (banner) => banner.name,
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            render: (banner) => new Date(banner.created_at).toLocaleDateString(),
        },
        {
            key: 'active',
            label: 'Publicar',
            render: (banner, helpers) => (
                <Switch checked={banner.active} onCheckedChange={() => helpers.toggle?.()} />
            ),
        },
    ];

    return (
        <EntityIndex
            entity="banners"
            heading="Banners"
            label="Banner"
            subtitle="Gestiona los banners del sistema"
            listTitle="Lista de banners"
            countLabel="banners"
            createLabel="Crear Banner"
            reorderKey="banners"
            toggle
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            messages={{
                deleted: 'Banner eliminado exitosamente',
                deleteFailed: 'Error al eliminar el banner',
                published: 'Banner publicado',
                unpublished: 'Banner no publicado',
                toggleFailed: 'Error al actualizar el banner',
            }}
        />
    );
}
