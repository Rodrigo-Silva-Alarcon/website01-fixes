import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Role {
    id: number;
    name: string;
    description: string;
}

interface User {
    id: number;
    name: string;
    last_name?: string;
    last2_name?: string;
    email: string;
    alias: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Role[];
}

interface Props {
    user: User;
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
        title: 'Detalles del Usuario',
        href: '/admin/users/show',
    },
];

export default function Show({ user }: Props) {
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Show.tsx (users)');
        console.log('Tiene show_users:', hasPermission('show_users'));
        
        if (!hasPermission('show_users')) {
            console.log('❌ Usuario sin permisos para ver usuarios - redirigiendo');
            toast.error('No tienes permisos para ver usuarios');
            router.visit('/admin/users');
        }
    }, [hasPermission]);

    if (!hasPermission('show_users')) {
        return null;
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario - ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/users">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Usuario</CardTitle>
                                    <CardDescription>
                                        Información completa del usuario {user.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_users') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/users/${user.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {/* Información Personal */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Información Personal</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">ID</h4>
                                        <p className="text-lg">{user.id}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                                        <p className="text-lg">{user.name}</p>
                                    </div>
                                    {user.last_name && (
                                        <div className="grid gap-2">
                                            <h4 className="text-sm font-medium text-gray-500">Apellido Paterno</h4>
                                            <p className="text-lg">{user.last_name}</p>
                                        </div>
                                    )}
                                    {user.last2_name && (
                                        <div className="grid gap-2">
                                            <h4 className="text-sm font-medium text-gray-500">Apellido Materno</h4>
                                            <p className="text-lg">{user.last2_name}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Información de Cuenta */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Información de Cuenta</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                        <p className="text-lg">{user.email}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Alias</h4>
                                        <p className="text-lg">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {user.alias}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Estado de Verificación</h4>
                                        <p className="text-lg">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                user.email_verified_at 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {user.email_verified_at ? 'Verificado' : 'No verificado'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Roles y Permisos */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Roles y Permisos</h3>
                                <div className="grid gap-2">
                                    <h4 className="text-sm font-medium text-gray-500">Roles Asignados</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {user.roles && user.roles.length > 0 ? (
                                            user.roles.map((role) => (
                                                <span
                                                    key={role.id}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                >
                                                    {role.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">Sin roles asignados</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Fechas</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Fecha de Creación</h4>
                                        <p className="text-lg">
                                            {new Date(user.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Última Actualización</h4>
                                        <p className="text-lg">
                                            {new Date(user.updated_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
