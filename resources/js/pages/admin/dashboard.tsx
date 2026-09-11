import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect } from 'react';
import { Link } from "@inertiajs/react";
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { toast } from 'sonner';
import { FolderClosed, Wrench, Folders } from  'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    const { hasPermission } = usePermissions();

    const { props } = usePage(); // obtiene todas las props enviadas desde Laravel
    const { products, categories, subcategorieds, banners } = props;

    // Verificar permisos al cargar el componente
    useEffect(() => {
        if (!hasPermission('access_dashboard')) {
            toast.error('No tienes permisos para acceder al dashboard');
            router.visit('/login');
        }
    }, [hasPermission]);

    if (!hasPermission('access_dashboard')) {
        return null;
    }
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex  h-full flex-1 flex-col gap-4  overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">                        
                        <Link href={route('products.index')} className='flex flex-col items-center justify-center h-full hover:text-blue-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(products)}</h1>
                            <h1 className='flex'><Wrench className='me-2' /> Productos</h1>

                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('categories.index')} className="flex flex-col items-center justify-center h-full hover:text-blue-600">
                            <h1 className='text-5xl font-bold text-green-600'>{String(categories)}</h1>
                            <h1 className='flex'><FolderClosed className='me-2 ' /> Categorías</h1>
                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('subcategories.index')} className='flex flex-col items-center justify-center h-full hover:text-blue-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(subcategorieds)}</h1>
                            <h1 className='flex'><Folders className='me-2' /> Subcategorías</h1>
                        </Link>
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <Link href={route('banners.index')} className='flex flex-col items-center justify-center h-full hover:text-blue-600'>
                            <h1 className='text-5xl font-bold text-green-600'>{String(banners)}</h1>
                            <h1 className='flex'><Folders className='me-2' /> Banners</h1>
                        </Link>
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <div className='flex items-center justify-center h-full'>
                        <div className='text-center'>
                            <AppLogoIcon className="mx-auto h-24 w-auto max-w-full" />
                            <p>
                                Bienvenidos al gestor de contenidos
                            </p>
                        </div>                        
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
