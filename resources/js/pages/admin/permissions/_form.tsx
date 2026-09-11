import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { type Permission } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Interfaz para los datos del formulario
interface PermissionFormData extends Partial<Permission> {
    // No hay campos adicionales para permisos
}

// Interfaz para las props del formulario
interface FormProps {
    permission: Permission;
    sectors: Record<string, string>;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: Array<{ title: string; href: string }>;
    success?: string;
    error?: string;
}

/**
 * Formulario reutilizable para crear y editar permisos
 * Incluye todos los campos necesarios y validación automática
 */
export default function PermissionForm({ permission, sectors, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    // Mostrar alertas de éxito y error
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Configurar el formulario con los datos del permiso
    const { data, setData, post, put, processing, errors } = useForm({
        name: permission.name || '',
        description: permission.description || '',
        sector: permission.sector || 'general',
    });


    /**
     * Manejar el envío del formulario
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEdit) {
            // Actualizar permiso existente
            put(`/admin/permissions/${permission.id}`, {
                onSuccess: () => {
                    toast.success('Permiso actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el permiso');
                }
            });
        } else {
            // Crear nuevo permiso
            post('/admin/permissions', {
                onSuccess: () => {
                    toast.success('Permiso creado exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear el permiso');
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
                            <Link href="/admin/permissions">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="grid gap-2">
                            <CardTitle className='text-xl font-medium'>{title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        {/* Campos de información del permiso */}
                        <div className="grid gap-4">
                            <h3 className="text-lg font-medium">Información del Permiso</h3>
                            
                            {/* Campo Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nombre *</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre del permiso"
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
                                    placeholder="Ingresa una descripción del permiso"
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            {/* Campo Sector */}
                            <div className="grid gap-2">
                                <Label htmlFor="sector">Sector</Label>
                                <Select
                                    value={data.sector}
                                    onValueChange={(value) => setData('sector', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un sector" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(sectors).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.sector && (
                                    <p className="text-sm text-red-500">{errors.sector}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Selecciona el sector al que pertenece este permiso
                                </p>
                            </div>

                        </div>

                        {/* Botones de acción */}
                        <div className="flex gap-4 pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing 
                                    ? (isEdit ? 'Actualizando...' : 'Creando...') 
                                    : (isEdit ? 'Actualizar Permiso' : 'Crear Permiso')
                                }
                            </Button>
                            <Button type="button" variant="outline" asChild>
                                <Link href="/admin/permissions">Cancelar</Link>
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
