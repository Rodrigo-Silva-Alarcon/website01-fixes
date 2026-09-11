import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

interface Props {
    role: Role & {
        permissions?: Array<{
            id: number;
            name: string;
            description: string;
            sector: string;
            sector_label: string;
        }>;
        users?: Array<{
            id: number;
            name: string;
            email: string;
        }>;
    };
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
        title: 'Detalles del Rol',
        href: '/admin/roles/show',
    },
];

export default function Show({ role, sectors }: Props) {
    const { hasPermission } = usePermissions();

    // Verificar permisos al cargar el componente
    useEffect(() => {
        console.log('🔍 Verificando permisos en Show.tsx (roles)');
        console.log('Tiene show_roles:', hasPermission('show_roles'));
        
        if (!hasPermission('show_roles')) {
            console.log('❌ Usuario sin permisos para ver roles - redirigiendo');
            toast.error('No tienes permisos para ver roles');
            router.visit('/admin/roles');
        }
    }, [hasPermission]);

    // Si no tiene permisos, no renderizar nada
    if (!hasPermission('show_roles')) {
        return null;
    }

    /**
     * Agrupar permisos por sector
     */
    const groupPermissionsBySector = () => {
        if (!role.permissions || role.permissions.length === 0) {
            return {};
        }

        const grouped: Record<string, Array<{
            id: number;
            name: string;
            description: string;
            sector: string;
            sector_label: string;
        }>> = {};
        
        role.permissions.forEach(permission => {
            const sector = permission.sector || 'general';
            if (!grouped[sector]) {
                grouped[sector] = [];
            }
            grouped[sector].push(permission);
        });
        
        return grouped;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol: ${role.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/admin/roles">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="grid gap-2">
                                    <CardTitle>Detalles del Rol</CardTitle>
                                    <CardDescription>
                                        Información completa del rol {role.name}
                                    </CardDescription>
                                </div>
                            </div>
                            {hasPermission('edit_roles') && (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/admin/roles/${role.id}/edit`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Editar
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            {/* Información del Rol */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Información del Rol</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">ID</h4>
                                        <p className="text-lg">{role.id}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Nombre</h4>
                                        <p className="text-lg">{role.name}</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <h4 className="text-sm font-medium text-gray-500">Descripción</h4>
                                        <p className="text-lg">{role.description || 'Sin descripción'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Permisos Asignados Agrupados por Sector */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Permisos Asignados</h3>
                                {role.permissions && role.permissions.length > 0 ? (
                                    <div className="grid gap-6">
                                        {Object.entries(groupPermissionsBySector()).map(([sectorKey, sectorPermissions]) => (
                                            <div key={sectorKey} className="space-y-3">
                                                {/* Header del Sector */}
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {sectors[sectorKey] || sectorKey}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">
                                                        {sectorPermissions.length} permiso{sectorPermissions.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                
                                                {/* Permisos del Sector */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {sectorPermissions.map((permission) => (
                                                        <div key={permission.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                                                            <div className="space-y-1">
                                                                <h4 className="text-sm font-medium text-gray-900">
                                                                    {permission.name}
                                                                </h4>
                                                                <p className="text-xs text-gray-600">
                                                                    {permission.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-sm text-gray-500">Sin permisos asignados</p>
                                    </div>
                                )}
                            </div>

                            {/* Usuarios con este Rol */}
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Usuarios con este Rol</h3>
                                <div className="grid gap-2">
                                    <h4 className="text-sm font-medium text-gray-500">Usuarios</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {role.users && role.users.length > 0 ? (
                                            role.users.map((user) => (
                                                <span
                                                    key={user.id}
                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                                >
                                                    {user.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-500">Sin usuarios asignados</span>
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
                                            {new Date(role.created_at).toLocaleDateString('es-ES', {
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
                                            {new Date(role.updated_at).toLocaleDateString('es-ES', {
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