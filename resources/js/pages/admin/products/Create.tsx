import TextForm from './_form';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Productos', href: route('products.index') },
    { title: 'Crear', href: '#' },
];

export default function Create() {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const categories = (props as any).categories;
    const brands = (props as any).brands;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        
        if (!hasPermission('create_texts')) {
            toast.error('No tienes permisos para crear categorías');
            router.visit(route('products.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_texts')) {
        return null;
    }

    return (
        <TextForm
            product={{} as any}
            categories={categories}
            brands={brands}
            isEdit={false}
            title="Crear Producto"
            description="Crea una nuevo producto en el sistema"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
