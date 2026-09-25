import { Input } from '@/components/ui/input';
import { useForm, FormEventHandler } from '@inertiajs/react';
import { type BreadcrumbItem, Brand } from '@/types';
import { toast } from 'sonner';
import { route } from 'ziggy-js';
import { CheckboxField, Field, FormShell, ImageUploadField, useFormAlerts } from '@/components/admin/form-shell';

interface FormProps {
    brand: Brand;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function BrandForm({ brand, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: brand.name || '',
        image: null as File | null,
        delete_image: false,
        active: brand.active,
        _method: isEdit ? 'PUT' : 'POST',
    });

    useFormAlerts(success, error, errors);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            name: data.name,
            image: data.image,
            active: data.active,
            delete_image: data.delete_image,
        };

        if (isEdit) {
            post(route('brands.update', brand.id), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Marca actualizada exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar la marca');
                },
            });
        } else {
            post(route('brands.store'), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Marca creada exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear la marca');
                },
            });
        }
    };

    return (
        <FormShell
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            backHref={route('brands.index')}
            submitLabel={`${isEdit ? 'Actualizar' : 'Crear'} Marca`}
            processing={processing}
            onSubmit={submit}
        >
            <Field label="Marca / Título" htmlFor="name" error={errors.name}>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ingresa el nombre / título la marca"
                    className={errors.name ? 'border-red-500' : ''}
                />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUploadField
                    id="image"
                    label="Imagen/Logo - Marca"
                    error={errors.image}
                    hint="Imagen que se redimensionará automáticamente a 800x600 píxeles"
                    existingUrl={brand.image_url}
                    deleteImage={data.delete_image}
                    onFileChange={(file) => setData('image', file)}
                    onDeleteImageChange={(value) => setData('delete_image', value)}
                />
            </div>

            <CheckboxField
                id="active"
                label="Publicar"
                checked={data.active}
                onCheckedChange={(checked) => setData('active', checked)}
                error={errors.active}
            />
        </FormShell>
    );
}
