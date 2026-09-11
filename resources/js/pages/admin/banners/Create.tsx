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
    { title: 'Banners', href: route('banners.index') },
    { title: 'Crear', href: '#' },
];

export default function Create() {
    const { props } = usePage();
    const success = (props as any).success;
    const categories = (props as any).categories;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        
        if (!hasPermission('create_texts')) {
            toast.error('No tienes permisos para crear categorías');
            router.visit(route('banners.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_texts')) {
        return null;
    }

    return (
        <TextForm
            banner={{} as any}
            categories={categories}
            isEdit={false}
            title="Crear Banner"
            description="Crea un nuevo banner en el sistema"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
