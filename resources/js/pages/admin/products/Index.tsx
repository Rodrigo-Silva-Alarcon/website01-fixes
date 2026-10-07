import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { type Category, type Product, type Subcategory } from '@/types';
import { isOnOffer } from '@/lib/product-enquiry';
import { Link, router, useForm } from '@inertiajs/react';
import { Check, DollarSign } from 'lucide-react';
import { type FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Props {
    records: Paginator<Product>;
    categories: Category[];
    filters: IndexFilters;
    success?: string;
    error?: string;
}

function ProductsToolbar({ categories }: { categories: Category[] }) {
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('category_id');

    const [category_id, setCategoryId] = useState<number | null>(categoryId ? Number(categoryId) : null);
    const [subcategory_id, setSubcategoryId] = useState<number | ''>('');
    const [availableSubcategories, setAvailableSubcategories] = useState<Subcategory[]>([]);

    useEffect(() => {
        if (category_id) {
            const selectedCategory = categories.find((cat) => cat.id === category_id);
            setAvailableSubcategories(selectedCategory?.subcategories || []);
        } else {
            setAvailableSubcategories([]);
        }
    }, [category_id, categories]);

    return (
        <div className="flex mb-3">
            {/* Categoría */}
            <div className="grid gap-2 min-w-[200px] me-3 ">
                <Label htmlFor="category">Categoría</Label>
                <Select
                    value={category_id ? String(category_id) : ''}
                    onValueChange={(value) => {
                        const selectedId = Number(value);
                        setCategoryId(selectedId);
                        const selectedCategory = categories.find((cat) => cat.id === selectedId);
                        setAvailableSubcategories(selectedCategory?.subcategories || []);
                        setSubcategoryId('');
                        if (!selectedCategory || !selectedCategory.subcategories.length) {
                            router.get(route('products.index'), { category_id: selectedId });
                        }
                    }}
                >
                    <SelectTrigger>
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
            </div>

            {/* Subcategoría */}
            {availableSubcategories.length > 0 && (
                <div className="grid gap-2 min-w-[200px]">
                    <Label htmlFor="subcategory">Subcategoría</Label>
                    <Select
                        value={subcategory_id ? String(subcategory_id) : ''}
                        onValueChange={(value) => {
                            const selectedId = Number(value);
                            setSubcategoryId(selectedId);
                            router.get(route('products.index'), {
                                category_id: category_id,
                                subcategory_id: selectedId,
                            });
                        }}
                        disabled={!availableSubcategories.length}
                    >
                        <SelectTrigger>
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
                </div>
            )}
        </div>
    );
}

function formatMoney(value: number | string, money?: string) {
    const currency = !money || money === 'BOB' || money === 'Bo' ? 'Bs.' : money;
    return `${currency} ${Number(value).toFixed(2)}`;
}

function PriceCell({ product }: { product: Product }) {
    const inventory = product.inventory;
    if (!inventory) return <span className="text-muted-foreground">Sin precio</span>;
    if (isOnOffer(inventory)) {
        return (
            <div className="flex flex-col leading-tight">
                <span className="font-medium text-green-700">{formatMoney(inventory.offer_amount!, inventory.money)}</span>
                <span className="text-xs text-muted-foreground line-through">{formatMoney(inventory.amount, inventory.money)}</span>
            </div>
        );
    }
    return <span>{formatMoney(inventory.amount, inventory.money)}</span>;
}

function PriceDialog({ product, onClose }: { product: Product; onClose: () => void }) {
    const inventory = product.inventory;
    const { data, setData, patch, processing, errors } = useForm({
        amount: inventory?.amount != null ? String(inventory.amount) : '',
        offer_amount: inventory?.offer_amount != null ? String(inventory.offer_amount) : '',
        ini: inventory?.ini ?? '',
        fin: inventory?.fin ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('products.update-price', product.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Precio actualizado exitosamente');
                onClose();
            },
            onError: () => toast.error('Por favor corrige los errores en el formulario'),
        });
    };

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <form onSubmit={submit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Editar precio</DialogTitle>
                        <DialogDescription>{product.name}. El stock no se modifica.</DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-2">
                        <Label htmlFor="price-amount">Precio</Label>
                        <Input id="price-amount" type="number" step="0.01" min="0" value={data.amount} onChange={(e) => setData('amount', e.target.value)} className={errors.amount ? 'border-red-500' : ''} autoFocus />
                        {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
                    </div>

                    <div className="space-y-3 rounded-[10px] border p-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price-offer">Precio de oferta</Label>
                            <Input id="price-offer" type="number" step="0.01" min="0" value={data.offer_amount} onChange={(e) => setData('offer_amount', e.target.value)} placeholder="Opcional" className={errors.offer_amount ? 'border-red-500' : ''} />
                            {errors.offer_amount && <p className="text-sm text-red-500">{errors.offer_amount}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price-ini">Inicio de oferta</Label>
                                <Input id="price-ini" type="date" value={data.ini} onChange={(e) => setData('ini', e.target.value)} className={errors.ini ? 'border-red-500' : ''} />
                                {errors.ini && <p className="text-sm text-red-500">{errors.ini}</p>}
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price-fin">Fin de oferta</Label>
                                <Input id="price-fin" type="date" value={data.fin} onChange={(e) => setData('fin', e.target.value)} className={errors.fin ? 'border-red-500' : ''} />
                                {errors.fin && <p className="text-sm text-red-500">{errors.fin}</p>}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={processing}>Guardar precio</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Index({ records, categories, filters, success, error }: Props) {
    const [priceProduct, setPriceProduct] = useState<Product | null>(null);

    const columns: EntityColumn<Product>[] = [
        {
            key: 'name',
            label: 'Producto',
            sortable: true,
            className: 'font-medium',
            render: (product) => <Link href={route('products.edit', product.id)}>{product.name}</Link>,
        },
        {
            key: 'category',
            label: 'Categoría',
            render: (product) => product.category_label,
        },
        {
            key: 'price',
            label: 'Precio',
            headerClassName: 'w-[130px]',
            render: (product) => <PriceCell product={product} />,
        },
        {
            key: 'pop',
            label: 'Popular',
            headerClassName: 'w-[70px]',
            render: (product) => product.pop && <Check className="text-green-800" />,
        },
        {
            key: 'featured',
            label: 'Destacado',
            headerClassName: 'w-[70px]',
            render: (product) => product.featured && <Check className="text-green-800" />,
        },
        {
            key: 'active',
            label: 'Publicar',
            headerClassName: 'w-[70px]',
            render: (product, helpers) => (
                <Switch checked={product.active} onCheckedChange={() => helpers.toggle?.()} />
            ),
        },
    ];

    return (
        <>
        <EntityIndex
            entity="products"
            heading="Productos"
            label="Producto"
            subtitle="Gestiona los productos del sistema"
            listTitle="Lista de productos"
            countLabel="productos"
            createLabel="Crear Producto"
            reorderKey="products"
            toggle
            columns={columns}
            records={records}
            filters={filters}
            success={success}
            error={error}
            toolbar={<ProductsToolbar categories={categories} />}
            rowActions={(product) => (
                <Button variant="outline" size="sm" onClick={() => setPriceProduct(product)} aria-label={`Editar precio de ${product.name}`} title="Editar precio">
                    <DollarSign className="h-4 w-4" />
                </Button>
            )}
            messages={{
                deleted: 'Producto eliminado exitosamente',
                deleteFailed: 'Error al eliminar el producto',
                published: 'Producto publicado',
                unpublished: 'Producto no publicado',
                toggleFailed: 'Error al actualizar el producto',
            }}
        />
        {priceProduct && <PriceDialog key={priceProduct.id} product={priceProduct} onClose={() => setPriceProduct(null)} />}
        </>
    );
}
