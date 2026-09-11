import InventoryForm from './_form';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Inventarios', href: route('inventories.index') },
    { title: 'Crear', href: '#' },
];

export default function Create() {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const products = (props as any).products;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
   /*  useEffect(() => {

        if (!hasPermission('create_inventories')) {
            toast.error('No tienes permisos para crear inventarios');
            router.visit(route('inventories.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_inventories')) {
        return null;
    } */

    return (
        <InventoryForm
            inventory={{} as any}
            products={products}
            isEdit={false}
            title="Crear Inventario"
            description="Crea un nuevo inventario en el sistema"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}