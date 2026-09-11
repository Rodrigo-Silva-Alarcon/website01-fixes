import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type User } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

// Extender la interfaz User para incluir campos de formulario
interface UserFormData extends Omit<Partial<User>, 'roles'> {
    password?: string;
    password_confirmation?: string;
    roles?: number[];
}

// Interfaz para los roles
interface Role {
    id: number;
    name: string;
    description: string;
}

// Interfaz para las props del formulario
interface FormProps {
    user: User;
    roles: Role[];
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: Array<{ title: string; href: string }>;
    success?: string;
    error?: string;
}

/**
 * Formulario reutilizable para crear y editar usuarios
 * Incluye todos los campos necesarios y validación automática
 */
export default function UserForm({ user, roles, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    // Mostrar alertas de éxito y error
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Configurar el formulario con los datos del usuario
    const { data, setData, post, put, processing, errors } = useForm({
        name: user.name || '',
        last_name: user.last_name || '',
        last2_name: user.last2_name || '',
        email: user.email || '',
        alias: user.alias || '',
        password: '',
        password_confirmation: '',
        roles: user.roles?.map(role => role.id) || [],
    });

    /**
     * Manejar cambio de roles
     */
    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    /**
     * Manejar el envío del formulario
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            // Actualizar usuario existente
            put(`/admin/users/${user.id}`, {
                onSuccess: () => {
                    toast.success('Usuario actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el usuario');
                }
            });
        } else {
            // Crear nuevo usuario
            post('/admin/users', {
                onSuccess: () => {
                    toast.success('Usuario creado exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear el usuario');
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
                                        <Link href="/admin/users">
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Campos de información personal */}
                        <div  className="grid gap-4">
                            <h3 className="text-lg font-medium">Información Personal</h3>
                            
                            {/* Campo Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            {/* Campo Apellido Paterno */}
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Apellido Paterno</Label>
                                <Input
                                    id="last_name"
                                    type="text"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Ingresa el apellido paterno"
                                    className={errors.last_name ? 'border-red-500' : ''}
                                />
                                {errors.last_name && (
                                    <p className="text-sm text-red-500">{errors.last_name}</p>
                                )}
                            </div>

                            {/* Campo Apellido Materno */}
                            <div className="grid gap-2">
                                <Label htmlFor="last2_name">Apellido Materno</Label>
                                <Input
                                    id="last2_name"
                                    type="text"
                                    value={data.last2_name}
                                    onChange={(e) => setData('last2_name', e.target.value)}
                                    placeholder="Ingresa el apellido materno"
                                    className={errors.last2_name ? 'border-red-500' : ''}
                                />
                                {errors.last2_name && (
                                    <p className="text-sm text-red-500">{errors.last2_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Campos de información de cuenta */}
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium">Información de Cuenta</h3>
                            
                            {/* Campo Email */}
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Ingresa el email"
                                    className={errors.email ? 'border-red-500' : ''}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>

                            {/* Campo Alias */}
                            <div className="grid gap-2">
                                <Label htmlFor="alias">Alias *</Label>
                                <Input
                                    id="alias"
                                    type="text"
                                    value={data.alias}
                                    onChange={(e) => setData('alias', e.target.value)}
                                    placeholder="Ingresa un alias único"
                                    className={errors.alias ? 'border-red-500' : ''}
                                />
                                {errors.alias && (
                                    <p className="text-sm text-red-500">{errors.alias}</p>
                                )}
                            </div>
                        </div>

                        {/* Campos de contraseña (solo para creación o si se especifica) */}
                        {!isEdit && (
                            <div className="grid gap-4">
                                <h3 className="text-lg font-medium">Seguridad</h3>
                                
                                {/* Campo Contraseña */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Contraseña *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Ingresa la contraseña"
                                        className={errors.password ? 'border-red-500' : ''}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">{errors.password}</p>
                                    )}
                                </div>

                                {/* Campo Confirmar Contraseña */}
                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Confirmar Contraseña *</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirma la contraseña"
                                        className={errors.password_confirmation ? 'border-red-500' : ''}
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sección de Roles */}
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium">Roles y Permisos</h3>
                            <p className="text-sm text-muted-foreground">
                                Selecciona los roles que tendrá este usuario
                            </p>
                            
                            <div className="grid gap-3">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-start gap-3">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.id)}
                                            onCheckedChange={(checked) => 
                                                handleRoleChange(role.id, checked as boolean)
                                            }
                                        />
                                        <div className="grid gap-1">
                                            <Label 
                                                htmlFor={`role-${role.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                            >
                                                {role.name}
                                            </Label>
                                            <p className="text-sm text-muted-foreground">
                                                {role.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {errors.roles && (
                                <p className="text-sm text-red-500">{errors.roles}</p>
                            )}
                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing 
                                    ? (isEdit ? 'Actualizando...' : 'Creando...') 
                                    : (isEdit ? 'Actualizar Usuario' : 'Crear Usuario')
                                }
                            </Button>
                                        <Button type="button" variant="outline" asChild>
                                            <Link href="/admin/users">Cancelar</Link>
                                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
