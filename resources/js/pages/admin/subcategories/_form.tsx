import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useForm, FormEventHandler } from '@inertiajs/react';
import { type BreadcrumbItem, Subcategory } from '@/types';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';
import { TYPE_SVG_ICONS } from '@/types/Data';
import { CheckboxField, Field, FormShell, useFormAlerts } from '@/components/admin/form-shell';

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

export default function SubcategoryForm({ subcategory, categories, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: subcategory.name || '',
        summary: subcategory.summary || '',
        icon: subcategory.icon || '',
        category_id: subcategory.category_id,
        active: subcategory.active,
        _method: isEdit ? 'PUT' : 'POST',
    });
    const route = useRoute();

    useFormAlerts(success, error, errors);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const submitData = {
            name: data.name,
            category_id: data.category_id,
            summary: data.summary,
            icon: data.icon,
            active: data.active,
        };

        if (isEdit) {
            post(route('subcategories.update', subcategory.id), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Subcategoría actualizada exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar la subcategoría');
                },
            });
        } else {
            post(route('subcategories.store'), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Subcategoría creada exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear la subcategoría');
                },
            });
        }
    };

    return (
        <FormShell
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            backHref={route('subcategories.index')}
            submitLabel={`${isEdit ? 'Actualizar' : 'Crear'} Subcategoría`}
            processing={processing}
            onSubmit={submit}
        >
            <Field label="Categoría" htmlFor="category_id" error={errors.category_id}>
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
            </Field>

            <Field label="Subcategoría" htmlFor="name" error={errors.name}>
                <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="Ingresa el nombre de la subcategoría"
                    className={errors.name ? 'border-red-500' : ''}
                />
            </Field>

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
