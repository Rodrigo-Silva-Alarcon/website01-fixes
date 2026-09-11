import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/users',
    },
    {
        title: 'Detalles del Usuario',
        href: '/users/show',
    },
];

export default function Show({ user }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Usuario - ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/users">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <div className="space-y-2">
                                    <CardTitle>Detalles del Usuario</CardTitle>
                                    <CardDescription>
                                        Información completa del usuario
                                    </CardDescription>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/users/${user.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-500">ID</h3>
                                    <p className="text-lg">{user.id}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                                    <p className="text-lg">{user.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p className="text-lg">{user.email}</p>
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-500">Fecha de Creación</h3>
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
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-500">Última Actualización</h3>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
