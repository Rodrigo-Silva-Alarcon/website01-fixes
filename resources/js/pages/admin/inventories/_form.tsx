import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, FormEventHandler } from '@inertiajs/react';
import { type BreadcrumbItem, Inventory, Product } from '@/types';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';
import { Field, FormShell, useFormAlerts } from '@/components/admin/form-shell';

interface FormProps {
    inventory: Inventory;
    products: Record<number, string>;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

export default function InventoryForm({ inventory, products, isEdit = false, title, description, breadcrumbs, success, error }: FormProps) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: inventory.product_id || '',
        amount: inventory.amount || '',
        offer_amount: inventory.offer_amount || '',
        ini: inventory.ini || '',
        fin: inventory.fin || '',
        stock: String(inventory.stock ?? 0),
        money: inventory.money || 'BOB',
        _method: isEdit ? 'PUT' : 'POST',
    });
    const route = useRoute();

    useFormAlerts(success, error, errors);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

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
            post(route('inventories.update', inventory.id), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Inventario actualizado exitosamente');
                },
                onError: () => {
                    toast.error('Error al actualizar el inventario');
                },
            });
        } else {
            post(route('inventories.store'), {
                ...submitData,
                forceFormData: true,
                onSuccess: () => {
                    toast.success('Inventario creado exitosamente');
                },
                onError: () => {
                    toast.error('Error al crear el inventario');
                },
            });
        }
    };

    return (
        <FormShell
            breadcrumbs={breadcrumbs}
            title={title}
            description={description}
            backHref={route('inventories.index')}
            submitLabel={`${isEdit ? 'Actualizar' : 'Crear'} Inventario`}
            processing={processing}
            onSubmit={submit}
        >
            <Field label="Producto" htmlFor="product_id" error={errors.product_id}>
                <Select
                    value={String(data.product_id)}
                    onValueChange={(value) => setData('product_id', Number(value))}
                >
                    <SelectTrigger className={errors.product_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona un producto" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(products).map(([id, name]) => (
                            <SelectItem key={id} value={id}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>

            <Field label="Monto" htmlFor="amount" error={errors.amount}>
                <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={data.amount}
                    onChange={(e) => setData('amount', e.target.value)}
                    placeholder="Ingresa el monto"
                    className={errors.amount ? 'border-red-500' : ''}
                />
            </Field>

            <div className="border rounded-[10px] p-5">
                <Field label="Monto Oferta" htmlFor="offer_amount" error={errors.offer_amount} className="grid gap-2 mb-3">
                    <Input
                        id="offer_amount"
                        type="number"
                        step="0.01"
                        value={data.offer_amount}
                        onChange={(e) => setData('offer_amount', e.target.value)}
                        placeholder="Ingresa el monto"
                        className={errors.offer_amount ? 'border-red-500' : ''}
                    />
                </Field>
                <div className="flex gap-4">
                    <Field label="Inicio de oferta" htmlFor="ini" error={errors.ini} className="grid gap-2">
                        <Input
                            id="ini"
                            type="date"
                            value={data.ini}
                            onChange={(e) => setData('ini', e.target.value)}
                            className={errors.ini ? 'border-red-500' : ''}
                        />
                    </Field>
                    <Field label="Fin de oferta" htmlFor="fin" error={errors.fin} className="grid gap-2">
                        <Input
                            id="fin"
                            type="date"
                            value={data.fin}
                            onChange={(e) => setData('fin', e.target.value)}
                            className={errors.fin ? 'border-red-500' : ''}
                        />
                    </Field>
                </div>
            </div>

            <Field label="Stock" htmlFor="stock" error={errors.stock}>
                <Input
                    id="stock"
                    type="number"
                    value={data.stock}
                    onChange={(e) => setData('stock', e.target.value)}
                    placeholder="Ingresa el stock"
                    className={errors.stock ? 'border-red-500' : ''}
                />
            </Field>

            <Field label="Moneda" htmlFor="money" error={errors.money}>
                <Select value={data.money} onValueChange={(value) => setData('money', value)}>
                    <SelectTrigger className={errors.money ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Selecciona una moneda" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BOB">BOB - Bolivianos</SelectItem>
                        <SelectItem value="USD">USD - Dólares</SelectItem>
                        <SelectItem value="EUR">EUR - Euros</SelectItem>
                    </SelectContent>
                </Select>
            </Field>
        </FormShell>
    );
}
