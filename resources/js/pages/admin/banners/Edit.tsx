import TextForm from './_form';
import { type BreadcrumbItem, Banner } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    banner: Banner;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: route('admin.dashboard') },
    { title: 'Banners', href: route('banners.index') },
    { title: 'Editar', href: '#' },
];

export default function Edit({ banner }: Props) {
    const { props } = usePage();
    const categories = (props as any).categories;
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {                
        if (!hasPermission('edit_texts')) {
            toast.error('No tienes permisos para editar textos');
            router.visit(route('banners.index'));
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_texts')) {
        return null;
    }

    return (
        <TextForm
            banner={banner}
            categories={categories}
            isEdit={true}
            title="Editar Banner"
            description="Modifica la información del banner"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
