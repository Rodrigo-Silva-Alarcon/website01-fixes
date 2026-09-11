import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import PermissionForm from './_form';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    permission: Permission;
    sectors: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Permisos',
        href: '/admin/permissions',
    },
    {
        title: 'Crear Permiso',
        href: '/admin/permissions/create',
    },
];

export default function Create({ permission, sectors }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Create.tsx (permissions)');
        console.log('Tiene create_permissions:', hasPermission('create_permissions'));
        
        if (!hasPermission('create_permissions')) {
            console.log('❌ Usuario sin permisos para crear permisos - redirigiendo');
            toast.error('No tienes permisos para crear permisos');
            router.visit('/admin/permissions');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_permissions')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Permiso" />
            <PermissionForm
                permission={permission}
                sectors={sectors}
                isEdit={false}
                title="Crear Permiso"
                description="Completa la información para crear un nuevo permiso"
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}
