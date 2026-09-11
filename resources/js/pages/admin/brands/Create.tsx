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
    { title: 'Marcas', href: route('brands.index') },
    { title: 'Crear', href: '#' },
];

export default function Create() {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        
        if (!hasPermission('create_texts')) {
            toast.error('No tienes permisos para crear marca');
            router.visit(route('brands.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_texts')) {
        return null;
    }

    return (
        <TextForm
            brand={{} as any}
            isEdit={false}
            title="Crear Marca"
            description="Crea una nueva marca en el sistema"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
