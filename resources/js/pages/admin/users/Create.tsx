import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import UserForm from './_form';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    description: string;
}

interface Props {
    user: User;
    roles: Role[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Usuarios',
        href: '/admin/users',
    },
    {
        title: 'Crear Usuario',
        href: '/admin/users/create',
    },
];

/**
 * Vista para crear un nuevo usuario
 * Utiliza el formulario reutilizable _form.tsx
 */
export default function Create({ user, roles }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Create.tsx (users)');
        console.log('Tiene create_users:', hasPermission('create_users'));
        
        if (!hasPermission('create_users')) {
            console.log('❌ Usuario sin permisos para crear usuarios - redirigiendo');
            toast.error('No tienes permisos para crear usuarios');
            router.visit('/admin/users');
        }
    }, [hasPermission]);

    if (!hasPermission('create_users')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Usuario" />
            <UserForm
                user={user}
                roles={roles}
                isEdit={false}
                title="Crear Usuario"
                description="Completa la información para crear un nuevo usuario"
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}