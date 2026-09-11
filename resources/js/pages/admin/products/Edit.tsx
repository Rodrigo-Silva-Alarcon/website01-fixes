import TextForm from './_form';
import { type BreadcrumbItem, Product } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    product: Product;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Productos', href: route('products.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ product }: Props) {
    const { props } = usePage();
    const categories = (props as any).categories;
    const brands = (props as any).brands;
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {                
        if (!hasPermission('edit_texts')) {
            toast.error('No tienes permisos para editar textos');
            router.visit(route('subcategories.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_texts')) {
        return null;
    }

    return (
        <TextForm
            product={product}
            categories={categories}
            brands={brands}
            isEdit={true}
            title="Editar Producto"
            description="Modifica la información del producto"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
