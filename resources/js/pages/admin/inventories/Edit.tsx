import InventoryForm from './_form';
import { type BreadcrumbItem, Inventory } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';



interface Props {
    inventory: Inventory;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Inventarios', href: route('inventories.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ inventory }: Props) {
    const { props } = usePage();
    const products = (props as any).products;
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    return (
        <InventoryForm
            inventory={inventory}
            products={products}
            isEdit={true}
            title="Editar Inventario"
            description="Modifica la información del inventario"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}