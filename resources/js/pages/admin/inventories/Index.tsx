import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { type Inventory } from '@/types';

interface Props {
    records: Paginator<Inventory>;
    filters: IndexFilters;
    success?: string;
    error?: string;
}

export default function Index({ records, filters, success, error }: Props) {
    const columns: EntityColumn<Inventory>[] = [
        {
            key: 'product',
            sortKey: 'product.name',
            label: 'Producto',
            sortable: true,
            className: 'font-medium',
            render: (inventory) => inventory.product?.name ?? '—',
        },
        {
            key: 'amount',
            label: 'Monto',
            sortable: true,
            render: (inventory) => inventory.amount,
        },
        {
            key: 'stock',
            label: 'Stock',
            sortable: true,
            render: (inventory) => inventory.stock ?? 0,
        },
        {
            key: 'money',
            label: 'Moneda',
            sortable: true,
            render: (inventory) => inventory.money,
        },
        {
            key: 'created_at',
            label: 'Creado',
            sortable: true,
            render: (inventory) => new Date(inventory.created_at).toLocaleDateString(),
        },
    ];

    return (
        <EntityIndex
            entity="inventories"
            heading="Inventarios"
            label="Inventario"
            subtitle="Gestiona los inventarios del sistema"
            listTitle="Lista de inventarios"
            countLabel="inventarios"
            createLabel="Crear Inventario"
            searchPlaceholder="Buscar por producto..."
            defaultSortBy="created_at"
            defaultSortOrder="desc"
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            deleteName={(inventory) => inventory.product?.name ?? String(inventory.id)}
            messages={{
                deleted: 'Inventario eliminado exitosamente',
                deleteFailed: 'Error al eliminar el inventario',
            }}
        />
    );
}
