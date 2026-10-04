import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useForm, FormEventHandler } from '@inertiajs/react';
import { type BreadcrumbItem, Category } from '@/types';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';
import { TYPE_SVG_ICONS } from '@/types/Data';
import { CheckboxField, Field, FormShell, ImageUploadField, useFormAlerts } from '@/components/admin/form-shell';

interface FormProps {
    category: Category;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function CategoryForm({ category, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name || '',
        summary: category.summary || '',
        icon: category.icon || '',
        image: null as File | null,
        active: category.active,
        delete_image: false,
        _method: isEdit ? 'PUT' : 'POST',
    });
    const route = useRoute();

    useFormAlerts(success, error, errors);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            name: data.name,
            summary: data.summary,
            image: data.image,
            icon: data.icon,
            active: data.active,
            delete_image: data.delete_image,
        };

        if (isEdit) {
            post(route('categories.update', category.id), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Categoría actualizada exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar la categoría');
                },
            });
        } else {
            post(route('categories.store'), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Categoría creada exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear la categoría');
                },
            });
        }
    };

    return (
        <FormShell
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            backHref={route('categories.index')}
            submitLabel={`${isEdit ? 'Actualizar' : 'Crear'} Categoría`}
            processing={processing}
            onSubmit={submit}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Categoría" htmlFor="name" error={errors.name}>
                    <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ingresa el nombre de la categoría"
                        className={errors.name ? 'border-red-500' : ''}
                    />
                </Field>
                <ImageUploadField
                    id="image"
                    label="Imágen"
                    error={errors.image}
                    hint="Imagen que se redimensionará automáticamente a 800x600 píxeles"
                    existingUrl={category.image_thumbs_url}
                    deleteImage={data.delete_image}
                    onFileChange={(file) => setData('image', file)}
                    onDeleteImageChange={(value) => setData('delete_image', value)}
                />
            </div>

            <Field label="Icono" error={errors.icon}>
                <RadioGroup
                    value={data.icon}
                    onValueChange={(value) => setData('icon', value)}
                    className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6"
                >
                    {TYPE_SVG_ICONS.map((types) => (
                        <Label
                            key={types.id}
                            htmlFor={`icon-${types.id}`}
                            title={types.label}
                            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border p-3 text-center text-xs font-normal transition-colors hover:bg-muted has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                        >
                            <RadioGroupItem value={types.id} id={`icon-${types.id}`} className="sr-only" />
                            <span
                                className="h-7 w-7 text-foreground"
                                dangerouslySetInnerHTML={{ __html: types.icon }}
                            />
                            <span className="leading-tight">{types.label}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </Field>

            <Field label="Descripción" htmlFor="summary" error={errors.summary}>
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
            </Field>

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
