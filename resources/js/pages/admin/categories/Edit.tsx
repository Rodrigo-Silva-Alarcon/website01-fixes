import TextForm from './_form';
import { type BreadcrumbItem, Category } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';


interface Props {
    category: Category;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Categorias', href: route('categories.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ category }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {                
        if (!hasPermission('edit_texts')) {
            toast.error('No tienes permisos para editar textos');
            router.visit('/admin/texts');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_texts')) {
        return null;
    }

    return (
        <TextForm
            category={category}
            isEdit={true}
            title="Editar Categoría"
            description="Modifica la información de la categoría"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
