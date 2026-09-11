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
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

interface Text {
    id?: number;
    name: string;
    date: string;
    gender: string;
    type: string[];
    print_view: string;
    image?: string;
    image_url?: string;
    summary: string;
    content: string;
    publish: boolean;
}

interface FormProps {
    text: Text;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function TextForm({ text, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: text.name || '',
        date: text.date || new Date().toISOString().split('T')[0],
        gender: text.gender || 'male',
        type: text.type || [],
        print_view: text.print_view || 'a4',
        image: null as File | null,
        delete_image: false,
        summary: text.summary || '',
        content: text.content || '',
        publish: text.publish || false,
        _method: isEdit ? 'PUT' : 'POST',
    });

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
        if (isEdit && text.image_url && !previewImage) {
            setPreviewImage(text.image_url);
        }
    }, [isEdit, text.image_url, previewImage]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        // Preparar datos para Inertia
        const submitData = {
            name: data.name,
            date: data.date.includes('T') ? data.date.split('T')[0] : data.date,
            gender: data.gender,
            type: data.type,
            print_view: data.print_view,
            summary: data.summary,
            content: data.content,
            publish: data.publish,
            image: data.image, // Inertia maneja archivos automáticamente
            delete_image: data.delete_image,
        };
        
        if (isEdit) {
            post(`/admin/texts/${text.id}`, {
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
            post('/admin/texts', {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Texto creado exitosamente');
                },
                onError: (errors: any) => {
                    console.log('Errores de validación:', errors);
                    toast.error('Error al crear el texto');
                }
            });
        }
    };


    const removeImage = () => {
        // Solo cancelar nueva imagen seleccionada
        setData('image', null);
        setPreviewImage(null);
        // Limpiar el input file
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const restoreImage = () => {
        if (isEdit && text.image_url) {
            setData('delete_image', false);
            setImageMarkedForDeletion(false);
        }
    };

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

    const handleTypeChange = (type: string, checked: boolean) => {
        if (checked) {
            setData('type', [...data.type, type]);
        } else {
            setData('type', data.type.filter(t => t !== type));
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
                                <Link href="/admin/texts">
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
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre del texto"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Nombre único del texto
                                </p>
                            </div>

                            {/* Campo Fecha */}
                            <div className="grid gap-2">
                                <Label htmlFor="date">Fecha</Label>
                                <DatePicker
                                    value={data.date ? (() => {
                                        const [year, month, day] = data.date.split('-');
                                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                    })() : new Date()}
                                    onChange={(date) => setData('date', date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
                                    placeholder="Seleccionar fecha"
                                    className={errors.date ? 'border-red-500' : ''}
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-500">{errors.date}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Fecha del texto
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Campo Género */}
                            <div className="grid gap-2">
                                <Label>Género</Label>
                                <RadioGroup
                                    value={data.gender}
                                    onValueChange={(value) => setData('gender', value)}
                                    className="flex flex-row gap-6"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="male" id="male" />
                                        <Label htmlFor="male">Masculino</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="female" id="female" />
                                        <Label htmlFor="female">Femenino</Label>
                                    </div>
                                </RadioGroup>
                                {errors.gender && (
                                    <p className="text-sm text-red-500">{errors.gender}</p>
                                )}
                            </div>

                            {/* Campo Vista de Impresión */}
                            <div className="grid gap-2">
                                <Label htmlFor="print_view">Vista de Impresión</Label>
                                <Select
                                    value={data.print_view}
                                    onValueChange={(value) => setData('print_view', value)}
                                >
                                    <SelectTrigger className={errors.print_view ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona la vista de impresión" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="letter">Carta</SelectItem>
                                        <SelectItem value="a4">A4</SelectItem>
                                        <SelectItem value="legal">Legal</SelectItem>
                                        <SelectItem value="legal_size">Oficio</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.print_view && (
                                    <p className="text-sm text-red-500">{errors.print_view}</p>
                                )}
                            </div>
                        </div>

                        {/* Campo Tipo */}
                        <div className="grid gap-2">
                            <Label>Tipo</Label>
                            <div className="flex flex-row gap-6">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="report"
                                        checked={data.type.includes('report')}
                                        onCheckedChange={(checked) => handleTypeChange('report', checked as boolean)}
                                    />
                                    <Label htmlFor="report">Reporte</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="article"
                                        checked={data.type.includes('article')}
                                        onCheckedChange={(checked) => handleTypeChange('article', checked as boolean)}
                                    />
                                    <Label htmlFor="article">Artículo</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="news"
                                        checked={data.type.includes('news')}
                                        onCheckedChange={(checked) => handleTypeChange('news', checked as boolean)}
                                    />
                                    <Label htmlFor="news">Noticia</Label>
                                </div>
                            </div>
                            {errors.type && (
                                <p className="text-sm text-red-500">{errors.type}</p>
                            )}
                        </div>

                        {/* Campo Imagen */}
                        <div className="grid gap-2">
                            <Label htmlFor="image">Imagen</Label>
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
                            {isEdit && text.image_url && !data.delete_image && (
                                <div className="space-y-2">
                                    <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                                        <img
                                            src={text.image_url}
                                            alt="Imagen actual"
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

                        {/* Campo Resumen */}
                        <div className="grid gap-2">
                            <Label htmlFor="summary">Resumen</Label>
                            <Textarea
                                id="summary"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                placeholder="Ingresa un resumen del texto (máximo 200 caracteres)"
                                className={errors.summary ? 'border-red-500' : ''}
                                maxLength={200}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Resumen del texto</span>
                                <span>{data.summary.length}/200</span>
                            </div>
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary}</p>
                            )}
                        </div>

                        {/* Campo Contenido */}
                        <div className="grid gap-2">
                            <Label htmlFor="content">Contenido</Label>
                            <RichTextEditor
                                value={data.content}
                                onChange={(content) => setData('content', content)}
                                placeholder="Escribe el contenido del texto aquí..."
                                height={400}
                            />
                            {errors.content && (
                                <p className="text-sm text-red-500">{errors.content}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Contenido principal del texto con editor de texto enriquecido
                            </p>
                        </div>

                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="publish"
                                checked={data.publish}
                                onCheckedChange={(checked) => setData('publish', checked as boolean)}
                            />
                            <Label htmlFor="publish">Publicar</Label>
                        </div>
                        {errors.publish && (
                            <p className="text-sm text-red-500">{errors.publish}</p>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Actualizar' : 'Crear'} Texto
                            </Button>
                        </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

