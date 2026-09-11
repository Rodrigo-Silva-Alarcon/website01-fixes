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
        title: 'Editar Permiso',
        href: '/admin/permissions/edit',
    },
];

export default function Edit({ permission, sectors }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Edit.tsx (permissions)');
        console.log('Tiene edit_permissions:', hasPermission('edit_permissions'));
        
        if (!hasPermission('edit_permissions')) {
            console.log('❌ Usuario sin permisos para editar permisos - redirigiendo');
            toast.error('No tienes permisos para editar permisos');
            router.visit('/admin/permissions');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_permissions')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Permiso: ${permission.name}`} />
            <PermissionForm
                permission={permission}
                sectors={sectors}
                isEdit={true}
                title="Editar Permiso"
                description={`Modifica la información del permiso ${permission.name}`}
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}
