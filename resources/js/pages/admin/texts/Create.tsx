import TextForm from './_form';
import { type BreadcrumbItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Panel de Control', href: '/admin/dashboard' },
    { title: 'Textos', href: '/admin/texts' },
    { title: 'Crear', href: '/admin/texts/create' },
];

export default function Create() {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Create.tsx');
        console.log('Tiene create_texts:', hasPermission('create_texts'));
        
        if (!hasPermission('create_texts')) {
            console.log('❌ Usuario sin permisos para crear textos - redirigiendo');
            toast.error('No tienes permisos para crear textos');
            router.visit('/admin/texts');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_texts')) {
        return null;
    }

    return (
        <TextForm
            text={{} as any}
            isEdit={false}
            title="Crear Texto"
            description="Crea un nuevo texto en el sistema"
            breadcrumbs={breadcrumbs}
            success={success}
            error={error}
        />
    );
}
