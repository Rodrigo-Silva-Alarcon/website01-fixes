import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Inventory, Product } from '@/types';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRoute } from 'ziggy-js';


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
        offer_amount: inventory.offer_amount||'',
        ini: inventory.ini||'',
        fin: inventory.fin||'',
        stock: inventory.stock || '',
        money: inventory.money || 'BOB',
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
            product_id: data.product_id,
            amount: data.amount,
            offer_amount: data.offer_amount,
            ini: data.ini,
            fin: data.fin,
            stock: data.stock,
            money: data.money,
        };

        if (isEdit) {
            post( route('inventories.update', inventory.id), {
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
            post(route('inventories.store'), {
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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            {/* Botón de regreso */}
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('inventories.index')}>
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
                            <Label htmlFor="product_id">Producto</Label>
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
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}