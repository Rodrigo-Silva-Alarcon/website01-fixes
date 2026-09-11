import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Banner, Category } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, GalleryHorizontal, X } from 'lucide-react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { TYPE_BANNERS, TYPE_PAGES } from "@/types/Data";

interface FormProps {
    banner: Banner;
    categories: Category[];
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function BannerForm({ banner, categories, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: banner.name || '',
        image: null as File | null,
        type: banner.type || '',
        url: banner.url || '',
        product_id: banner.product_id ,
        page_id: banner.page_id,
        summary: banner.summary || '',
        pages: banner.pages || [] as string[],
        delete_image: false,
        active: banner.active,
        sw_title: banner.sw_title,
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
        if (isEdit && banner.image_url && !previewImage) {
            setPreviewImage(banner.image_url);
        }
    }, [isEdit, banner.image_url, previewImage]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();    

        // Preparar datos para Inertia
        const submitData = {
            name: data.name,
            image: data.image, // Inertia maneja archivos automáticamente
            url: data.url,
            type: data.type,
            product_id: data.product_id,
            page_id: data.page_id,
            summary: data.summary,            
            active: data.active,
            sw_title: data.sw_title,
            delete_image: data.delete_image,
        };
        
        if (isEdit) {
            post( route('banners.update', banner.id), {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Banner actualizado exitosamente');
                },
                onError: (errors: any) => {
                    console.log('Errores de validación:', errors);
                    toast.error('Error al actualizar el banner');
                }
            });
        } else {
            post( route('banners.store'), {
                ...submitData,
                forceFormData: true, // Forzar FormData para archivos
                onSuccess: () => {
                    toast.success('Banner creado exitosamente');
                },
                onError: (errors: any) => {
                    console.log('Errores de validación:', errors);
                    toast.error('Error al crear el banner');
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
        if (isEdit && banner.image_url) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {/* Botón de regreso */}
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('banners.index')}>
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
                            {/* Campo Nombre */}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Banner / Título</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre / título del banner"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                            {/* Campo Imagen */}
                            <div className="grid gap-2">
                                <Label htmlFor="image">Imagen / Banner</Label>
                                <div className="grid w-full max-w-sm items-center gap-3">
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className={errors.image ? 'border-red-500' : ''}
                                    />
                                </div>
                                
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
                            <div className="grid gap-2">
                                <Label htmlFor="pages">Páginas</Label>
                                <div className="space-y-2">
                                    {TYPE_PAGES.map((page) => (
                                        <div key={page.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`page-${page.id}`}
                                                checked={data.pages.includes(page.id)}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setData('pages', [...data.pages, page.id]);
                                                    } else {
                                                        setData('pages', data.pages.filter((id: string) => id !== page.id));
                                                    }
                                                }}
                                            />
                                            <Label htmlFor={`page-${page.id}`}>{page.label}</Label>
                                        </div>
                                    ))}
                                </div>
                                {errors.pages && (
                                    <p className="text-sm text-red-500">{errors.pages}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">                            
                            {/* Campo Tipo de Banner */}
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipo de Banner</Label>
                                <Select
                                    value={String(data.type)}
                                    onValueChange={(value) => setData('type', value)}
                                >
                                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona un tipo de banner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TYPE_BANNERS.map((tipes) => (
                                            <SelectItem key={tipes.id} value={String(tipes.id)}>
                                                {tipes.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.type && (
                                    <p className="text-sm text-red-500">{errors.type}</p>
                                )}
                            </div>
                            {data.type == '1' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="page_id">Página</Label>
                                    <Select
                                        value={String(data.page_id)}
                                        onValueChange={(value) => setData('page_id', Number(value))}
                                    >
                                        <SelectTrigger className={errors.page_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona una página" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TYPE_PAGES.map((pages) => (
                                                <SelectItem key={pages.id} value={String(pages.id)}>
                                                    {pages.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.page_id && (
                                        <p className="text-sm text-red-500">{errors.page_id}</p>
                                    )}
                                </div>
                            )}
                            {data.type == '2' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="product_id">Producto</Label>
                                    <Select
                                        value={String(data.product_id)}
                                        onValueChange={(value) => setData('product_id', Number(value))}
                                    >
                                        <SelectTrigger className={errors.product_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona un producto" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectGroup key={category.id}>
                                                    {category.products.length > 0 && (
                                                        <>
                                                            <SelectLabel>
                                                                <small className="text-blue-500">{category.name}</small>
                                                            </SelectLabel>
                                                            {category.products.map((product) => (
                                                                <SelectItem
                                                                    key={product.id}
                                                                    value={String(product.id)}
                                                                    className="ps-2"
                                                                >
                                                                    {product.name}
                                                                </SelectItem>
                                                            ))}
                                                        </>
                                                    )}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.product_id && (
                                        <p className="text-sm text-red-500">{errors.product_id}</p>
                                    )}
                                </div>
                            )}
                            {data.type == '3' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="text"
                                        value={data.url}
                                        onChange={(e) => setData('url', e.target.value)}
                                        placeholder="http://...."
                                        className={errors.url ? 'border-red-500' : ''}
                                    />
                                    {errors.url && (
                                        <p className="text-sm text-red-500">{errors.url}</p>
                                    )}
                                </div>
                            )}

                        </div>
                        
                        {/* Campo Resumen */}
                        <div className="grid gap-2">
                            <Label htmlFor="summary">Texto</Label>
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

                            

                        {/* Campo Mostrar Título/Descripción */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="sw_title"
                                checked={data.sw_title ?? true}
                                onCheckedChange={(checked) => setData('sw_title', checked === true)}
                            />
                            <Label htmlFor="sw_title">Mostrar Título/Descripción</Label>
                        </div>
                        {errors.sw_title && (
                            <p className="text-sm text-red-500">{errors.sw_title}</p>
                        )}
                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={data.active ?? true}
                                onCheckedChange={(checked) => setData('active', checked === true)}
                            />
                            <Label htmlFor="active">Publicar</Label>
                        </div>
                        {errors.active && (
                            <p className="text-sm text-red-500">{errors.active}</p>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Actualizar' : 'Crear'} Banner
                            </Button>
                        </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

