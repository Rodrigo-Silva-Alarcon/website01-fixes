import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    permission: Permission & {
        roles?: Array<{
            id: number;
            name: string;
            description: string;
        }>;
        guard_name?: string;
    };
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
        title: 'Detalles del Permiso',
        href: '/admin/permissions/show',
    },
];

export default function Show({ permission }: Props) {
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Show.tsx (permissions)');
        console.log('Tiene show_permissions:', hasPermission('show_permissions'));
        
        if (!hasPermission('show_permissions')) {
            console.log('❌ Usuario sin permisos para ver permisos - redirigiendo');
            toast.error('No tienes permisos para ver permisos');
            router.visit('/admin/permissions');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('show_permissions')) {
        return null;
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permiso: ${permission.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/permissions">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Permiso</CardTitle>
                                    <CardDescription>
                                        Información completa del permiso {permission.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_permissions') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/permissions/${permission.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {/* Información del Permiso */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Información del Permiso</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">ID</h4>
                                        <p className="text-lg">{permission.id}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                                        <p className="text-lg">{permission.name}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                        <p className="text-lg">{permission.description || 'Sin descripción'}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Guard Name</h4>
                                        <p className="text-lg">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {permission.guard_name || 'web'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Roles que usan este Permiso */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Roles que usan este Permiso</h3>
                                <div className="grid gap-2">
                                    <h4 className="text-sm font-medium text-gray-500">Roles</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {permission.roles && permission.roles.length > 0 ? (
                                            permission.roles.map((role) => (
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
                                            {new Date(permission.created_at).toLocaleDateString('es-ES', {
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
                                            {new Date(permission.updated_at).toLocaleDateString('es-ES', {
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