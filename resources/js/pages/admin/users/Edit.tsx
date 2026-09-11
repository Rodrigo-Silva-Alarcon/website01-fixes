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
        title: 'Editar Usuario',
        href: '/admin/users/edit',
    },
];

/**
 * Vista para editar un usuario existente
 * Utiliza el formulario reutilizable _form.tsx
 */
export default function Edit({ user, roles }: Props) {
    const { props } = usePage();
    const success = (props as any).success;
    const error = (props as any).error;
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Edit.tsx (users)');
        console.log('Tiene edit_users:', hasPermission('edit_users'));
        
        if (!hasPermission('edit_users')) {
            console.log('❌ Usuario sin permisos para editar usuarios - redirigiendo');
            toast.error('No tienes permisos para editar usuarios');
            router.visit('/admin/users');
        }
    }, [hasPermission]);

    if (!hasPermission('edit_users')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Editar Usuario" />
            <UserForm
                user={user}
                roles={roles}
                isEdit={true}
                title="Editar Usuario"
                description={`Modifica la información del usuario ${user.name}`}
                breadcrumbs={breadcrumbs}
                success={success}
                error={error}
            />
        </AppLayout>
    );
}