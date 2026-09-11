import TextForm from './_form';
import { type BreadcrumbItem, Brand } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    brand: Brand;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Marcas', href: route('brands.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ brand }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {                
        if (!hasPermission('edit_texts')) {
            toast.error('No tienes permisos para editar textos');
            router.visit(route('brands.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_texts')) {
        return null;
    }

    return (
        <TextForm
            brand={brand}
            isEdit={true}
            title="Editar Marcas"
            description="Modifica la información del marca"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
