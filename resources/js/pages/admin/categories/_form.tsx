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
import { type BreadcrumbItem, Category } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';
import { TYPE_SVG_ICONS } from '@/types/Data';

interface FormProps {
    category: Category;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function TextForm({ category, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name||'',
        summary: category.summary||'',
        icon: category.icon||'',
        image: null as File | null,
        active: category.active,
        delete_image: false,
        _method: isEdit ? 'PUT' : 'POST',
    });
    const route = useRoute();

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageMarkedForDeletion, setImageMarkedForDeletion] = useState(false);

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

    // Inicializar preview de imagen cuando se está editando
    useEffect(() => {
        if (isEdit && category.image_thumbs_url && !previewImage) {
            setPreviewImage(category.image_thumbs_url);
        }
    }, [isEdit, category.image_url, previewImage]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona un archivo de imagen válido');
                return;
            }
            
            // Validar tamaño (2MB máximo)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 2MB');
                return;
            }

            setData('image', file);
            
            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
            
            // Si estamos editando y había una imagen marcada para eliminación,
            // al subir una nueva imagen, cancelamos la eliminación automáticamente
            if (isEdit && imageMarkedForDeletion) {
                setData('delete_image', false);
                setImageMarkedForDeletion(false);
            }
        }
    };


    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Preparar datos para Inertia
        const submitData = {
            name: data.name,
            summary: data.summary,
            image: data.image,
            icon: data.icon,
            active: data.active,
            delete_image: data.delete_image,
        };
        
        if (isEdit) {

            /* console.log(submitData);
            return false; */
            post( route('categories.update', category.id), {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Texto actualizado exitosamente');
                },
                onError: (errors: any) => {
                    console.log('Errores de validación:', errors);
                    toast.error('Error al actualizar el texto');
                }
            });
        } else {
            post(route('categories.store'), {
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
                                <Link href={route('categories.index')}>
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
                        <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Campo Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Categoría</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre de la categoría"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="image">Imágen</Label>
                                <div className="grid w-full max-w-sm items-center gap-3">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={errors.image ? 'border-red-500' : ''}
                                    />
                                </div>
                                
                                {/* Imagen actual (solo en modo edición cuando hay imagen) */}
                                {(previewImage && !data.delete_image)  && (
                                    <div className="space-y-2">
                                        <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />                                            
                                        </div>
                                        <Button 
                                        type="button" 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => {
                                            setData('delete_image', true);
                                            setImageMarkedForDeletion(true);
                                        }} 
                                        className="text-red-600 hover:text-red-700"
                                        >
                                        <X className="h-4 w-4 mr-2" />
                                        Eliminar imagen
                                        </Button>                                            
                                    </div>
                                    )}
                                
                                {errors.image && (
                                    <p className="text-sm text-red-500">{errors.image}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Imagen que se redimensionará automáticamente a 800x600 píxeles
                                </p>
                            </div>
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
                                {isEdit ? 'Actualizar' : 'Crear'} Categoría
                            </Button>
                        </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

