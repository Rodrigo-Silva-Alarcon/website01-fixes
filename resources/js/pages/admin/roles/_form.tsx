import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { type Role, type Permission, type RoleFormData, type RoleFormProps } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

/**
 * Formulario reutilizable para crear y editar roles
 * Incluye todos los campos necesarios y validación automática
 */
export default function RoleForm({ role, permissions, sectors, isEdit = false, title, description, breadcrumbs, success, error }: RoleFormProps) {
    // Mostrar alertas de éxito y error
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Configurar el formulario con los datos del rol
    const { data, setData, post, put, processing, errors } = useForm<RoleFormData>({
        name: role.name || '',
        description: role.description || '',
        permissions: (role as any).permissions?.map((permission: any) => permission.id) || [],
    });

    /**
     * Manejar cambio de permisos
     */
    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    /**
     * Agrupar permisos por sector
     */
    const groupPermissionsBySector = () => {
        const grouped: Record<string, Permission[]> = {};
        
        permissions.forEach(permission => {
            const sector = permission.sector || 'general';
            if (!grouped[sector]) {
                grouped[sector] = [];
            }
            grouped[sector].push(permission);
        });
        
        return grouped;
    };

    /**
     * Manejar el envío del formulario
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            // Actualizar rol existente
            put(`/admin/roles/${role.id}`, {
                onSuccess: () => {
                    toast.success('Rol actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el rol');
                }
            });
        } else {
            // Crear nuevo rol
            post('/admin/roles', {
                onSuccess: () => {
                    toast.success('Rol creado exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear el rol');
                }
            });
        }
    };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        {/* Botón de regreso */}
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/roles">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="grid">
                            <CardTitle className='text-xl font-medium'>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        {/* Campos de información del rol */}
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium">Información del Rol</h3>
                            
                            {/* Campo Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre del rol"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Campo Descripción */}
                            <div className="grid gap-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Input
                                    id="description"
                                    type="text"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Ingresa una descripción del rol"
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Sección de Permisos Agrupados por Sector */}
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium">Permisos</h3>
                            <p className="text-sm text-muted-foreground">
                                Selecciona los permisos que tendrá este rol, organizados por sector
                            </p>
                            
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
                                                <div key={permission.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={data.permissions.includes(permission.id)}
                                                        onCheckedChange={(checked) => 
                                                            handlePermissionChange(permission.id, checked as boolean)
                                                        }
                                                    />
                                                    <div className="grid gap-1 flex-1">
                                                        <Label 
                                                            htmlFor={`permission-${permission.id}`}
                                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                        >
                                                            {permission.name}
                                                        </Label>
                                                        <p className="text-xs text-muted-foreground">
                                                            {permission.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.permissions && (
                                <p className="text-sm text-red-500">{errors.permissions}</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing 
                                    ? (isEdit ? 'Actualizando...' : 'Creando...') 
                                    : (isEdit ? 'Actualizar Rol' : 'Crear Rol')
                                }
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/roles">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
