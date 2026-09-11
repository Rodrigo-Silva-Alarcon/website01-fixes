import TextForm from './_form';
import { type BreadcrumbItem, Subcategory } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';



interface Props {
    subcategory: Subcategory;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Subcategorias', href: route('subcategories.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ subcategory }: Props) {
    const { props } = usePage();
    const categories = (props as any).categories;
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
            subcategory={subcategory}
            categories={categories}
            isEdit={true}
            title="Editar Categoría"
            description="Modifica la información de la categoría"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
