import EntityIndex, { type EntityColumn, type IndexFilters, type Paginator } from '@/components/admin/entity-index';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { type Category, type Product, type Subcategory } from '@/types';
import { Link, router } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function Index({ records, categories, filters, success, error }: Props) {
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
            messages={{
                deleted: 'Producto eliminado exitosamente',
                deleteFailed: 'Error al eliminar el producto',
                published: 'Producto publicado',
                unpublished: 'Producto no publicado',
                toggleFailed: 'Error al actualizar el producto',
            }}
        />
    );
}
