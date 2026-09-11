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
        title: 'Editar Rol',
        href: '/admin/roles/edit',
    },
];

export default function Edit({ role, permissions, sectors }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Edit.tsx (roles)');
        console.log('Tiene edit_roles:', hasPermission('edit_roles'));
        
        if (!hasPermission('edit_roles')) {
            console.log('❌ Usuario sin permisos para editar roles - redirigiendo');
            toast.error('No tienes permisos para editar roles');
            router.visit('/admin/roles');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('edit_roles')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Editar Rol: ${role.name}`} />
            <RoleForm
                role={role}
                permissions={permissions}
                sectors={sectors}
                isEdit={true}
                title="Editar Rol"
                description={`Modifica la información del rol ${role.name}`}
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}
