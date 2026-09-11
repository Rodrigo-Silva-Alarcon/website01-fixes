import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Product, Category, Subcategory, Brand, Inventory } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft, GalleryHorizontal, X, Upload, Trash2, Edit } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TYPE_VIDEO } from "@/types/Data";
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import axios from 'axios';
import Modal  from "@/components/modal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FormProps {
    product: Product;
    categories: Category[];
    brands: Brand[];
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

interface FormProps1 {
    inventory: Inventory;
    product: Product;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

function ModalForm({ inventory, product, isEdit = false, title, description, breadcrumbs}: FormProps1){
    const { data, setData, post, processing, errors } = useForm({
            product_id: inventory.product_id || product.id,
            amount: inventory.amount || '',
            offer_amount: inventory.offer_amount||'',
            ini: inventory.ini||'',
            fin: inventory.fin||'',
            stock: inventory.stock || '',
            money: inventory.money || 'BOB',
            _method: isEdit ? 'PUT' : 'POST',
        });
        
        const [InventoryToDelete, setInventoryToDelete] = useState<Inventory | null>(null);


        const handleDelete = (inventory: Inventory) => {
            router.delete( route('inventories.destroy_product', inventory.id), {
                onSuccess: () => {
                    toast.success('Inventario eliminado exitosamente');
                    setInventoryToDelete(null);
                },
                onError: () => {
                    toast.error('Error al eliminar el inventario');
                },
            });
        };
        
        useEffect(() => {
            if (Object.keys(errors).length > 0) {
                toast.error('Por favor corrige los errores en el formulario');
            }
        }, [errors]);
    
    
        const submit: FormEventHandler = (e) => {
            e.preventDefault();
    
            // Preparar datos para Inertia
            const submitData = {
                product_id: data.product_id,
                amount: data.amount,
                offer_amount: data.offer_amount,
                ini: data.ini,
                fin: data.fin,
                stock: data.stock,
                money: data.money,
            };
    
            if (isEdit) {
                post( route('inventories.update_product', inventory.id), {
                    ...submitData,
                    forceFormData: true, // Forzar FormData para archivos
                    onSuccess: () => {
                        toast.success('Inventario actualizado exitosamente');
                    },
                    onError: (errors: any) => {
                        toast.error('Error al actualizar el inventario');
                    }
                });
            } else {
                post(route('inventories.store_product'), {
                    ...submitData,
                    forceFormData: true, // Forzar FormData para archivos
                    onSuccess: () => {
                        toast.success('Inventario creado exitosamente');
                    },
                    onError: (errors: any) => {
                        toast.error('Error al crear el inventario');
                    }
                });
            }
        };

    return (
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

            <form onSubmit={submit} className="space-y-6">

            <div className="grid gap-2">
                <input type="hidden" name='product_id' value={data.product_id} />


                {errors.product_id && (
                    <p className="text-sm text-red-500">{errors.product_id}</p>
                )}
            </div>

            {/* Campo Monto */}
            <div className="grid gap-2">
                <Label htmlFor="amount">Monto</Label>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="Ingresa el monto"
                    className={errors.amount ? 'border-red-500' : ''}
                />
                {errors.amount && (
                    <p className="text-sm text-red-500">{errors.amount}</p>
                )}
            </div>
            <div className='border rounded-[10px] p-5'>
                <div className="grid gap-2 mb-3">
                    <Label htmlFor="offer_amount">Monto Oferta</Label>
                    <Input 
                        id="offer_amount"
                        type="number"
                        step="0.01"
                        value={data.offer_amount}
                        onChange={(e) => setData('offer_amount', e.target.value)}
                        placeholder="Ingresa el monto"
                        className={errors.offer_amount ? 'border-red-500' : ''}
                    />
                    {errors.offer_amount && (
                        <p className="text-sm text-red-500">{errors.offer_amount}</p>
                    )}
                </div>
                <div className='flex gap-4'>
                    <div className="grid gap-2">
                        <Label htmlFor="ini">Inicio de oferta</Label>
                        <Input 
                            id="ini"
                            type="date"
                            value={data.ini}
                            onChange={(e) => setData('ini', e.target.value)}
                            placeholder="Ingresa el monto"
                            className={errors.ini ? 'border-red-500' : ''}
                        />
                        {errors.ini && (
                            <p className="text-sm text-red-500">{errors.ini}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="fin">Fin de oferta</Label>
                        <Input 
                            id="fin"
                            type="date"
                            value={data.fin}
                            onChange={(e) => setData('fin', e.target.value)}
                            placeholder="Ingresa el monto"
                            className={errors.fin ? 'border-red-500' : ''}
                        />
                        {errors.fin && (
                            <p className="text-sm text-red-500">{errors.fin}</p>
                        )}
                    </div>
                </div>
            </div>    
            {/* Campo Stock */}
            <div className="grid gap-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                    id="stock"
                    type="number"
                    value={data.stock}
                    onChange={(e) => setData('stock', e.target.value)}
                    placeholder="Ingresa el stock"
                    className={errors.stock ? 'border-red-500' : ''}
                />
                {errors.stock && (
                    <p className="text-sm text-red-500">{errors.stock}</p>
                )}
            </div>

            {/* Campo Moneda */}
            <div className="grid gap-2">
                <Label htmlFor="money">Moneda</Label>
                <Select
                    value={data.money}
                    onValueChange={(value) => setData('money', value)}
                >
                    <SelectTrigger className={errors.money ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BOB">BOB - Bolivianos</SelectItem>
                        <SelectItem value="USD">USD - Dólares</SelectItem>
                        <SelectItem value="EUR">EUR - Euros</SelectItem>
                    </SelectContent>
                </Select>
                {errors.money && (
                    <p className="text-sm text-red-500">{errors.money}</p>
                )}
            </div>

            <div className="flex items-center gap-4">
                <Button disabled={processing}>
                    {isEdit ? 'Actualizar' : 'Crear'} Inventario
                </Button>
            </div>
            </form>
            {/* Modal de confirmación de eliminación */}
            <AlertDialog open={!!InventoryToDelete} onOpenChange={() => setInventoryToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el inventario "{InventoryToDelete?.product?.name}".
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => InventoryToDelete && handleDelete(InventoryToDelete)}>
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
export default function TextForm({ product, categories, brands, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    
    const { data, setData, post, processing, errors } = useForm({
        name: product.name || '',
        category_id: product.category_id ,
        subcategory_id: product.subcategory_id,
        brand_id: product.brand_id,
        image: null as File | null,
        summary: product.summary || '',
        description: product.description || '',
        tecnical_info: product.tecnical_info || '',
        tecnical_image: null as File | null,
        video_file: null as File | null,
        video_url: product.video_url || '',
        video_iframe: product.video_iframe || '',
        delete_image: false,
        delete_technical_image: false,
        delete_video_file: false,
        video_type: product.video_type,
        active: product.active,
        featured: product.featured,
        pop: product.pop,
        images: product.images,
        _method: isEdit ? 'PUT' : 'POST',
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageMarkedForDeletion, setImageMarkedForDeletion] = useState(false);
    const [previewTechnicalImage, setPreviewTechnicalImage] = useState<string | null>(null);
    const [technicalImageMarkedForDeletion, setTechnicalImageMarkedForDeletion] = useState(false);
    const [previewVideoFile, setPreviewVideoFile] = useState<string | null>(null);
    const [videoFileMarkedForDeletion, setVideoFileMarkedForDeletion] = useState(false);
    const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const [uploadingImages, setUploadingImages] = useState(false);

    const [existingImages, setExistingImages] = useState<any[]>(data?.images ?? []);

    const [open, setOpen] = useState(false);

    useEffect(() => {
    setExistingImages(data?.images ?? []);
    }, [data?.images]);


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
        if (isEdit && product.image_url && !previewImage) {
            setPreviewImage(product.image_url);
        }
    }, [isEdit, product.image_url, previewImage]);

    // Inicializar preview de technical_image cuando se está editando
    useEffect(() => {
        if (isEdit && product.tecnical_image_url && !previewTechnicalImage) {
            setPreviewTechnicalImage(product.tecnical_image_url);
        }
    }, [isEdit, product.tecnical_image_url, previewTechnicalImage]);
    
    // Inicializar preview de video_file cuando se está editando
    useEffect(() => {
        if (isEdit && product.video_file_url && !previewVideoFile) {            
            setPreviewVideoFile(product.video_file_url);
        }
    }, [isEdit, product.video_file_url, previewVideoFile]);

    // Actualizar subcategorías disponibles cuando cambia la categoría
    useEffect(() => {
        if (data.category_id) {
            const selectedCategory = categories.find(cat => cat.id === data.category_id);
            setAvailableSubcategories(selectedCategory?.subcategories || []);
        } else {
            setAvailableSubcategories([]);
        }
    }, [data.category_id, categories]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();    

        // Preparar datos para Inertia
        const submitData = {
            category_id: data.category_id,
            subcategory_id: data.subcategory_id,
            brand_id: data.brand_id,
            name: data.name,
            image: data.image, // Inertia maneja archivos automáticamente
            summary: data.summary,
            description: data.description,
            tecnical_info: data.tecnical_info,
            tecnical_image: data.tecnical_image,
            video_file: data.video_file,
            video_url: data.video_url,
            video_iframe: data.video_iframe,
            video_type:data.video_type,
            active: data.active,
            featured: data.featured,
            pop: data.pop,
            delete_image: data.delete_image,
            delete_technical_image: data.delete_technical_image,
            delete_video_file: data.delete_video_file,
        };
        
        if (isEdit) {
            post( route('products.update', product.id), {
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
            post( route('products.store'), {
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

    const handleTechnicalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

            setData('tecnical_image', file);

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewTechnicalImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Si estamos editando y había una imagen marcada para eliminación,
            // al subir una nueva imagen, cancelamos la eliminación automáticamente
            if (isEdit && technicalImageMarkedForDeletion) {
                setData('delete_technical_image', false);
                setTechnicalImageMarkedForDeletion(false);
            }
        }
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('video/')) {
                toast.error('Por favor selecciona un archivo de video válido');
                return;
            }

            // Validar tamaño (50MB máximo)
            if (file.size > 50 * 1024 * 1024) {
                toast.error('El video no debe superar los 50MB');
                return;
            }

            setData('video_file', file);

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewVideoFile(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Si estamos editando y había un video marcado para eliminación,
            // al subir uno nuevo, cancelamos la eliminación automáticamente
            if (isEdit && videoFileMarkedForDeletion) {
                setData('delete_video_file', false);
                setVideoFileMarkedForDeletion(false);
            }
        }
    };


    const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // Validar archivos
        const validFiles: File[] = [];
        const validPreviews: string[] = [];

        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`El archivo ${file.name} no es una imagen válida`);
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                toast.error(`La imagen ${file.name} supera los 2MB`);
                return;
            }
            validFiles.push(file);

            // Crear preview
            const reader = new FileReader();
            reader.onload = (e) => {
                validPreviews.push(e.target?.result as string);
                setGalleryPreviews([...validPreviews]);
            };
            reader.readAsDataURL(file);
        });

        setGalleryImages(validFiles);
    };

    const removeGalleryImage = (index: number) => {
        const newImages = galleryImages.filter((_, i) => i !== index);
        const newPreviews = galleryPreviews.filter((_, i) => i !== index);
        setGalleryImages(newImages);
        setGalleryPreviews(newPreviews);
    };

    const uploadGalleryImages = async () => {
    if (!isEdit || galleryImages.length === 0) return;

    setUploadingImages(true);
    try {
        const uploadPromises = galleryImages.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('order', (index + 1).toString());

        const response = await axios.post(route('images.store', product.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log(response.data);
        return response.data; // <- debe ser la imagen creada
        });

        const uploadedImages = await Promise.all(uploadPromises);

        // Actualiza SOLO la galería existente
        setExistingImages(prev => [...uploadedImages, ...prev]); // o [...prev, ...uploadedImages]        

        toast.success('Imágenes subidas exitosamente');
        setGalleryImages([]);
        setGalleryPreviews([]);
    } catch (error: any) {
        console.error('Error uploading images:', error);
        toast.error('Error al subir las imágenes');
    } finally {
        setUploadingImages(false);
    }
    };

    const deleteImage = async (imageId: number) => {
        try {
            await axios.delete(route('images.destroy', imageId));
            toast.success('Imagen eliminada exitosamente');
            // Recargar la página para actualizar la lista
            window.location.reload();
        } catch (error: any) {
            console.error('Error deleting image:', error);
            toast.error('Error al eliminar la imagen');
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
                                <Link href="{ route('products.index')}">
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
                                <Label htmlFor="name">Product</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Ingresa el nombre del producto"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                                <p className="text-sm text-muted-foreground">
                                    Nombre único del producto
                                </p>
                            </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">                            
                            {/* Campo Fecha */}
                            <div className="grid gap-2">
                                <Label htmlFor="date">Categoría</Label>
                                <Select
                                    value={String(data.category_id)}
                                    onValueChange={(value) => setData('category_id', Number(value))}                                    
                                >
                                    <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category.id} value={String(category.id)}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.category_id && (
                                    <p className="text-sm text-red-500">{errors.category_id}</p>
                                )}
                            </div>
                            <div className="grid gap-2">
                                {/* Campo Género */}
                                <div className="grid gap-2">
                                    <Label>Subcategoría</Label>
                                    
                                    <Select
                                        value={String(data.subcategory_id)}
                                        onValueChange={(value) => setData('subcategory_id', Number(value))}
                                    >
                                        <SelectTrigger className={errors.subcategory_id ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Selecciona una subcategoría" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSubcategories.map((subcategory) => (
                                                <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                                                    {subcategory.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.subcategory_id && (
                                        <p className="text-sm text-red-500">{errors.subcategory_id}</p>
                                    )}
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date">Marca</Label>
                                <Select
                                    value={String(data.brand_id)}
                                    onValueChange={(value) => setData('brand_id', Number(value))}                                    
                                >
                                    <SelectTrigger className={errors.brand_id ? 'border-red-500' : ''}>
                                        <SelectValue placeholder="Selecciona una categoría" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brands.map((brand) => (
                                            <SelectItem key={brand.id} value={String(brand.id)}>
                                                {brand.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {errors.brand_id && (
                                    <p className="text-sm text-red-500">{errors.brand_id}</p>
                                )}
                            </div>
                        </div>

                                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">  
                            {/* Campo Imagen */}
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
                            <div className="grid gap-2">
                                <Card>
                                    <CardHeader>
                                        <h3>Galería de Imágenes</h3>
                                    </CardHeader>
                                    <CardContent>
                                        {isEdit && (
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="gallery_images">Seleccionar imágenes</Label>
                                                    <Input
                                                        id="gallery_images"
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleGalleryImagesChange}
                                                        className="mt-1"
                                                    />
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Selecciona múltiples imágenes (máximo 2MB cada una)
                                                    </p>
                                                </div>

                                                {galleryPreviews.length > 0 && (
                                                    <div>
                                                        <Label>Previsualización</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                            {galleryPreviews.map((preview, index) => (
                                                                <div key={index} className="relative">
                                                                    <img
                                                                        src={preview}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="w-full h-24 object-cover rounded border"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                                                                        onClick={() => removeGalleryImage(index)}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            onClick={uploadGalleryImages}
                                                            disabled={uploadingImages}
                                                            className="mt-4"
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {uploadingImages ? 'Subiendo...' : 'Subir Imágenes'}
                                                        </Button>
                                                    </div>
                                                )}
                                                
                                                {existingImages.length > 0 && (
                                                    <div>
                                                        <Label>Imágenes existentes</Label>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                                            {existingImages.map((image) => (
                                                                <div key={image.id} className="relative group">
                                                                    <img
                                                                        src={image.image_url}
                                                                        alt={image.original_name || 'Imagen'}
                                                                        className="w-full h-24 object-cover rounded border"
                                                                    />
                                                                    <div className="absolute inset-0 bg-opacity-80 group-hover:bg-opacity-50 transition-all duration-200 rounded flex items-center justify-center">
                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger asChild>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="destructive"
                                                                                    size="sm"
                                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                                >
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Esta acción no se puede deshacer. La imagen será eliminada permanentemente.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() => deleteImage(image.id)}
                                                                                        className="bg-red-600 hover:bg-red-700"
                                                                                    >
                                                                                        Eliminar
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="border-t pt-4">
                                                    <p className="text-sm text-muted-foreground">
                                                        Las imágenes se subirán y asociarán automáticamente al producto.
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {!isEdit && (
                                            <div className="border p-4 text-center text-muted-foreground">
                                                <GalleryHorizontal className="h-8 w-8 mx-auto mb-2" />
                                                <p>La galería de imágenes estará disponible después de crear el producto.</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>                                                

                        {/* Campo Resumen */}
                        <div className="grid gap-2">
                            <Label htmlFor="summary">Descripción general / Corta</Label>
                            <Textarea
                                id="summary"
                                value={data.summary}
                                onChange={(e) => setData('summary', e.target.value)}
                                placeholder="Ingresa un resumen del texto (máximo 400 caracteres)"
                                className={errors.summary ? 'border-red-500' : ''}
                                maxLength={400}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">                                
                                <span>{data.summary.length}/400</span>
                            </div>
                            {errors.summary && (
                                <p className="text-sm text-red-500">{errors.summary}</p>
                            )}
                        </div>

                        {/* Campo Contenido */}
                        <div className="grid gap-2">
                            <Label htmlFor="description">Descripción del Producto</Label>
                            <RichTextEditor
                                value={data.description}
                                onChange={(description) => setData('description', description)}
                                placeholder="Escribe el contenido del texto aquí..."
                                height={400}
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500">{errors.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground">
                                Contenido principal del texto con editor de texto enriquecido
                            </p>
                        </div>
                                         
                            {/* Campo Fecha */}
                            <div className="grid gap-2">
                                <Card>
                                    <CardHeader>                                        
                                        <h3>Características generales</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-3">
                                            <Label htmlFor="tecnical_image">Imagen</Label>
                                            <div className="grid w-full max-w-sm items-center gap-3">
                                                <Input
                                                    id="tecnical_image"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleTechnicalImageChange}
                                                    className={errors.tecnical_image ? 'border-red-500' : ''}
                                                />
                                            </div>

                                            {/* Preview de imagen subida */}
                                            {(previewTechnicalImage && !data.delete_technical_image) && (
                                                <div className="space-y-2">
                                                    <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                                                        <img
                                                            src={previewTechnicalImage}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => {
                                                            setData('delete_technical_image', true);
                                                            setTechnicalImageMarkedForDeletion(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <X className="h-4 w-4 mr-2" />
                                                        Eliminar imagen
                                                    </Button>
                                                </div>
                                            )}


                                            {errors.tecnical_image && (
                                                <p className="text-sm text-red-500">{errors.tecnical_image}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground">
                                                <small>Imagen que se redimensionará automáticamente a 800x600 píxeles</small>
                                            </p>
                                        </div>
                                        <div className='mb-3'>
                                            <Label htmlFor="tecnical_info">Caracteristicas Generales</Label>
                                            <RichTextEditor
                                                value={data.tecnical_info}
                                                onChange={(tecnical_info) => setData('tecnical_info', tecnical_info)}
                                                placeholder="Escribe el contenido del texto aquí..."
                                                height={400}
                                            />
                                            {errors.tecnical_info && (
                                                <p className="text-sm text-red-500">{errors.tecnical_info}</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Campo Fecha */}
                            <div className="grid gap-2">
                                <Card>
                                    <CardHeader>  
                                        <h3>Video</h3>
                                    </CardHeader>
                                    <CardContent>
                                        <div className='mb-3'>
                                            <Label htmlFor="date">Tipo de Video</Label>
                                            <Select
                                                value={String(data.video_type)}
                                                onValueChange={(value) => setData('video_type', Number(value))}                                    
                                            >
                                                <SelectTrigger className={errors.video_type ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Selecciona una categoría" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TYPE_VIDEO.map((types) => (
                                                        <SelectItem key={types.id} value={String(types.id)}>
                                                            {types.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>

                                            {errors.video_type && (
                                                <p className="text-sm text-red-500">{errors.video_type}</p>
                                            )}
                                        </div>
                                        {data.video_type === 1 && (

                                            <div className='mb-3'>
                                                <Label htmlFor="video_url">Url</Label>
                                                <Input
                                                    id="video_url"
                                                    type="text"
                                                    value={data.video_url}
                                                    onChange={(e) => setData('video_url', e.target.value)}
                                                    placeholder="Ingresa el nombre del producto"
                                                    className={errors.video_url ? 'border-red-500' : ''}
                                                />
                                                {errors.video_url && (
                                                    <p className="text-sm text-red-500">{errors.video_url}</p>
                                                )}
                                            </div>
                                        )}
                                        {data.video_type === 2 && (
                                            <div className='mb-3'>
                                                <Label htmlFor="video_file">Archivo</Label>
                                                <div className="grid w-full max-w-sm items-center gap-3">
                                                    <Input
                                                        id="video_file"
                                                        type="file"
                                                        accept="video/*"
                                                        onChange={handleVideoFileChange}
                                                        className={errors.video_file ? 'border-red-500' : ''}
                                                    />
                                                </div>                                            
                                                {/* Preview de video subido */}
                                                {(previewVideoFile && !data.delete_video_file) && (
                                                    <div className="space-y-2">
                                                        <div className="relative w-48 h-32 border rounded-lg overflow-hidden">
                                                            <video
                                                                src={previewVideoFile}
                                                                controls
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setData('delete_video_file', true);
                                                                setVideoFileMarkedForDeletion(true);
                                                            }}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4 mr-2" />
                                                            Eliminar video
                                                        </Button>
                                                    </div>
                                                )}

                                                {errors.video_file && (
                                                    <p className="text-sm text-red-500">{errors.video_file}</p>
                                                )}

                                            </div>
                                        )}
                                        {data.video_type === 3 && (
                                            <div className="grid gap-2">
                                                <Label htmlFor="video_iframe">Insertar Video</Label>
                                                <Textarea
                                                    id="video_iframe"
                                                    value={data.video_iframe}
                                                    onChange={(e) => setData('video_iframe', e.target.value)}
                                                    placeholder="Ingresa un resumen del texto (máximo 800 caracteres)"
                                                    className={errors.video_iframe ? 'border-red-500' : ''}
                                                    maxLength={800}
                                                />
                                                <div className="flex justify-between text-sm text-muted-foreground">                                
                                                    <span>{data.video_iframe.length}/800</span>
                                                </div>
                                                {errors.video_iframe && (
                                                    <p className="text-sm text-red-500">{errors.video_iframe}</p>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>                                
                            </div>
                        
                        <div>
                            <Card>
                                <CardHeader>
                                    <h3>Precio y Stock</h3>
                                </CardHeader>
                                <CardContent>
                                    {isEdit && (
                                    <div className="text-end w-full">
                                        <a 
                                            onClick={() => setOpen(true)}
                                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-green-600 text-primary-foreground shadow-xs hover:bg-green-700 h-9 px-4 py-2 has-[>svg]:px-3">
                                            Agregar +
                                        </a>                                        
                                    </div>  
                                    )}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {/* <TableHead>
                                                    Producto
                                                </TableHead> */}
                                                <TableHead>
                                                    Monto
                                                </TableHead>
                                                <TableHead>
                                                    Stock
                                                </TableHead>
                                                <TableHead>
                                                    Moneda
                                                </TableHead>
                                                <TableHead>
                                                    Monto Oferta
                                                </TableHead>
                                                <TableHead>
                                                    Inicio Oferta
                                                </TableHead>
                                                <TableHead>
                                                    fin Oferta
                                                </TableHead>
                                                <TableHead>
                                                    Creado
                                                </TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {product?.inventories?.map((inventory) => (
                                                <TableRow key={inventory.id}>
                                                    {/* <TableCell>{product.name}</TableCell> */}
                                                    <TableCell>{inventory.amount}</TableCell>
                                                    <TableCell>{inventory.stock}</TableCell>
                                                    <TableCell>{inventory.money}</TableCell>
                                                    <TableCell>{inventory.offer_amount}</TableCell>
                                                    <TableCell>{inventory.ini}</TableCell>
                                                    <TableCell>{inventory.fin}</TableCell>
                                                    <TableCell>
                                                        {new Date(inventory.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={route('inventories.edit', inventory.id)}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button variant="outline"                                                    
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>                                  
                                </CardContent>
                            </Card>
                        </div>

                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="featured"
                                checked={data.featured}
                                onCheckedChange={(checked) => setData('featured', checked === true)}
                            />
                            <Label htmlFor="featured">Producto Destacado</Label>
                        </div>
                        {errors.featured && (
                            <p className="text-sm text-red-500">{errors.featured}</p>
                        )}
                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="pop"
                                checked={data.pop}
                                onCheckedChange={(checked) => setData('pop', checked === true)}
                            />
                            <Label htmlFor="pop">Producto Popular</Label>
                        </div>
                        {errors.pop && (
                            <p className="text-sm text-red-500">{errors.pop}</p>
                        )}
                        {/* Campo Publicar */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="active"
                                checked={data.active}
                                onCheckedChange={(checked) => setData('active', checked === true)}
                            />
                            <Label htmlFor="active">Publicar</Label>
                        </div>
                        {errors.active && (
                            <p className="text-sm text-red-500">{errors.active}</p>
                        )}
                        

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                {isEdit ? 'Actualizar' : 'Crear'} Producto
                            </Button>
                        </div>
                        </form>
                        <Modal
                            open={open}
                            onClose={() => setOpen(false)}
                            title="Precio"
                        >    

                            {isEdit && (
                                <>
                                <ModalForm 
                                    inventory={{} as any}
                                    product={product}
                                    isEdit={false}
                                    title="Invetario"
                                    description=""
                                    breadcrumbs={[]}
                                    />
                                </>
                            )}
                        </Modal>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

