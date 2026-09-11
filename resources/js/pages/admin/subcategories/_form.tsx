import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Subcategory } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';
import { TYPE_SVG_ICONS } from '@/types/Data';


interface FormProps {
    subcategory: Subcategory;
    categories: Record<number, string>;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function TextForm({ subcategory, categories, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: subcategory.name||'',
        summary: subcategory.summary||'',
        icon: subcategory.icon||'',
        category_id: subcategory.category_id,
        active: subcategory.active,
        _method: isEdit ? 'PUT' : 'POST',
    });
    const route = useRoute();
    // Mostrar alertas de éxito y error
    useEffect(() => {
        if (success) {
            toast.success(success);
        }
        if (error) {
            toast.error(error);
        }
    }, [success, error]);

    // Mostrar toast de error cuando hay errores de validación
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            toast.error('Por favor corrige los errores en el formulario');
        }
    }, [errors]);


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Preparar datos para Inertia
        const submitData = {
            name: data.name,
            category_id: data.category_id,
            summary: data.summary,
            icon: data.icon,
            active: data.active,
        };
        
        if (isEdit) {
            post( route('subcategories.update', subcategory.id), {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Texto actualizado exitosamente');
                },
                onError: (errors: any) => {
                    toast.error('Error al actualizar el texto');
                }
            });
        } else {
            post(route('subcategories.store'), {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Texto creado exitosamente');
                },
                onError: (errors: any) => {
                    toast.error('Error al crear el texto');
                }
            });
        }
    };
    
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {/* Botón de regreso */}
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('subcategories.index')}>
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <div className="grid">
                                <CardTitle className='text-xl font-medium mb-2'>{title}</CardTitle>
                                <CardDescription>{description}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                        

                        <div className="grid gap-2">
                            <Label htmlFor="category_id">Categoría</Label>
                            <Select
                                value={String(data.category_id)}
                                onValueChange={(value) => setData('category_id', Number(value))}
                            >
                                <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Selecciona una categoría" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(categories).map(([id, name]) => (
                                        <SelectItem key={id} value={id}>
                                            {name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {errors.category_id && (
                                <p className="text-sm text-red-500">{errors.category_id}</p>
                            )}
                        </div>
                        {/* Campo Nombre */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Subcategoría</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Ingresa el nombre de la subcategoría"
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">{errors.name}</p>
                            )}
                        </div>                            
                        
                        <div className="grid gap-2">
                            <Label>Icono</Label>
                            <RadioGroup
                                value={data.icon}
                                onValueChange={(value) => setData('icon', value)}
                                className="flex flex-wrap gap-6"
                            >
                                {TYPE_SVG_ICONS.map((types) => (
                                    <div key={types.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={types.id} id={types.id} />
                                        <Label
                                        htmlFor={types.id}
                                        className="cursor-pointer flex items-center gap-2"
                                        >
                                        <div
                                            className="h-5 w-5 [&>svg]:h-full [&>svg]:w-full [&>svg]:fill-current"
                                            dangerouslySetInnerHTML={{ __html: types.icon }}
                                        />
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                            {errors.icon && (
                                <p className="text-sm text-red-500">{errors.icon}</p>
                            )}
                        </div>

                        {/* Campo Resumen */}
                        <div className="grid gap-2">
                            <Label htmlFor="summary">Descripción</Label>
                            <Textarea
                                id="summary"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                placeholder="Ingresa un resumen del texto (máximo 200 caracteres)"
                                className={errors.summary ? 'border-red-500' : ''}
                                maxLength={200}
                            />
                            {data.summary?.length > 0 && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <small>{data.summary?.length}/200</small>
                                </div>
                            )}
                            
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary}</p>
                            )}
                        </div>

                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={data.active}
                                onCheckedChange={(checked) => setData('active', checked as boolean)}
                            />
                            <Label htmlFor="active">Publicar</Label>
                        </div>
                        {errors.active && (
                            <p className="text-sm text-red-500">{errors.active}</p>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Actualizar' : 'Crear'} Subcategoría
                            </Button>
                        </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

