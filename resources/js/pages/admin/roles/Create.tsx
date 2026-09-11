import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role, type Permission } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import RoleForm from './_form';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    role: Role;
    permissions: Permission[];
    sectors: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Roles',
        href: '/admin/roles',
    },
    {
        title: 'Crear Rol',
        href: '/admin/roles/create',
    },
];

export default function Create({ role, permissions, sectors }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Create.tsx (roles)');
        console.log('Tiene create_roles:', hasPermission('create_roles'));
        
        if (!hasPermission('create_roles')) {
            console.log('❌ Usuario sin permisos para crear roles - redirigiendo');
            toast.error('No tienes permisos para crear roles');
            router.visit('/admin/roles');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('create_roles')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Rol" />
            <RoleForm
                role={role}
                permissions={permissions}
                sectors={sectors}
                isEdit={false}
                title="Crear Rol"
                description="Completa la información para crear un nuevo rol"
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}
