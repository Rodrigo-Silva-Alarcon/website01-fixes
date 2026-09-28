import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useForm, FormEventHandler } from '@inertiajs/react';
import { type BreadcrumbItem, Banner, Category } from '@/types';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { TYPE_BANNERS, TYPE_PAGES } from '@/types/Data';
import { CheckboxField, Field, FormShell, ImageUploadField, useFormAlerts } from '@/components/admin/form-shell';

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
        product_id: banner.product_id,
        page_id: banner.page_id,
        summary: banner.summary || '',
        pages: banner.pages || [] as string[],
        delete_image: false,
        active: banner.active,
        sw_title: banner.sw_title,
        start_date: banner.start_date || '',
        end_date: banner.end_date || '',
        _method: isEdit ? 'PUT' : 'POST',
    });

    useFormAlerts(success, error, errors);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            name: data.name,
            image: data.image,
            url: data.url,
            type: data.type,
            product_id: data.product_id,
            page_id: data.page_id,
            summary: data.summary,
            active: data.active,
            sw_title: data.sw_title,
            start_date: data.start_date || null,
            end_date: data.end_date || null,
            delete_image: data.delete_image,
        };

        if (isEdit) {
            post(route('banners.update', banner.id), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Banner actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el banner');
                },
            });
        } else {
            post(route('banners.store'), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Banner creado exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear el banner');
                },
            });
        }
    };

    return (
        <FormShell
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            backHref={route('banners.index')}
            submitLabel={`${isEdit ? 'Actualizar' : 'Crear'} Banner`}
            processing={processing}
            onSubmit={submit}
        >
            <Field label="Banner / Título" htmlFor="name" error={errors.name}>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ingresa el nombre / título del banner"
                    className={errors.name ? 'border-red-500' : ''}
                />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadField
                    id="image"
                    label="Imagen / Banner"
                    error={errors.image}
                    hint="Imagen que se redimensionará automáticamente a 800x600 píxeles"
                    existingUrl={banner.image_url}
                    deleteImage={data.delete_image}
                    onFileChange={(file) => setData('image', file)}
                    onDeleteImageChange={(value) => setData('delete_image', value)}
                />
                <Field label="Páginas" htmlFor="pages" error={errors.pages}>
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
                </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Tipo de Banner" htmlFor="type" error={errors.type}>
                    <Select value={String(data.type)} onValueChange={(value) => setData('type', value)}>
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
                </Field>
                {data.type == '1' && (
                    <Field label="Página" htmlFor="page_id" error={errors.page_id}>
                        <Select value={String(data.page_id)} onValueChange={(value) => setData('page_id', Number(value))}>
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
                    </Field>
                )}
                {data.type == '2' && (
                    <Field label="Producto" htmlFor="product_id" error={errors.product_id}>
                        <Select value={String(data.product_id)} onValueChange={(value) => setData('product_id', Number(value))}>
                            <SelectTrigger className={errors.product_id ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Selecciona un producto" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectGroup key={category.id}>
                                        {category.products.length > 0 && (
                                            <>
                                                <SelectLabel>
                                                    <small className="text-orange-500">{category.name}</small>
                                                </SelectLabel>
                                                {category.products.map((product) => (
                                                    <SelectItem key={product.id} value={String(product.id)} className="ps-2">
                                                        {product.name}
                                                    </SelectItem>
                                                ))}
                                            </>
                                        )}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                )}
                {data.type == '3' && (
                    <Field label="URL" htmlFor="url" error={errors.url}>
                        <Input
                            id="url"
                            type="text"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            placeholder="http://...."
                            className={errors.url ? 'border-red-500' : ''}
                        />
                    </Field>
                )}
            </div>

            <Field label="Texto" htmlFor="summary" error={errors.summary}>
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
            </Field>

            <CheckboxField
                id="sw_title"
                label="Mostrar Título/Descripción"
                checked={data.sw_title ?? true}
                onCheckedChange={(checked) => setData('sw_title', checked)}
                error={errors.sw_title}
            />
            <CheckboxField
                id="active"
                label="Publicar"
                checked={data.active ?? true}
                onCheckedChange={(checked) => setData('active', checked)}
                error={errors.active}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Fecha de inicio (opcional)" htmlFor="start_date" error={errors.start_date} className="space-y-2">
                    <Input
                        id="start_date"
                        type="date"
                        value={data.start_date}
                        onChange={(e) => setData('start_date', e.target.value)}
                        className={errors.start_date ? 'border-red-500' : ''}
                    />
                </Field>
                <Field label="Fecha de fin (opcional)" htmlFor="end_date" error={errors.end_date} className="space-y-2">
                    <Input
                        id="end_date"
                        type="date"
                        value={data.end_date}
                        onChange={(e) => setData('end_date', e.target.value)}
                        className={errors.end_date ? 'border-red-500' : ''}
                    />
                </Field>
            </div>
        </FormShell>
    );
}
