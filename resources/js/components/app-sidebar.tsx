import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
/* import { dashboard } from '@/routes/admin'; */
import { type NavItem } from '@/types';
import { route } from 'ziggy-js';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Shield, Key, FileText, Package, FolderClosed, Folders, Wrench, Images, ShoppingBasket, Banknote, Star } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';
import AppLogoIcon from '@/components/app-logo-icon';

export function AppSidebar() {
    const { hasPermission } = usePermissions();
    
    const allNavItems: Array<NavItem & { permission?: string }> = [
        {
            title: 'Panel de Control',
            href: route('admin.dashboard'),
            icon: LayoutGrid,
            permission: 'access_dashboard',
        },
        {
            title: 'Banners',
            href: route('banners.index'),
            icon: Images,
            permission: 'access_dashboard',
        },
        {
            title: 'Marcas',
            href: route('brands.index'),
            icon: Star,
            permission: 'access_dashboard',
        },
        {
            title: 'Categoría',
            href: route('categories.index'),
            icon: FolderClosed,
            permission: 'access_dashboard',
        },
        {
            title: 'Subategorias',
            href: route('subcategories.index'),
            icon: Folders,
            permission: 'access_dashboard',
        },
        {
            title: 'Productos',
            href: route('products.index'),
            icon: Wrench,
            permission: 'access_dashboard',
        },
        {
            title: 'Stock',
            href: route('inventories.index'),
            icon: Banknote,
            permission: 'access_dashboard',
        },
        {
            title: 'Carrito de Compras',
            href: route('products.index'),
            icon: ShoppingBasket,
            permission: 'access_dashboard',
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
            icon: Users,
            permission: 'view_users',
        },
        /* {
            title: 'Roles',
            href: '/admin/roles',
            icon: Shield,
            permission: 'view_roles',
        },
        {
            title: 'Permisos',
            href: '/admin/permissions',
            icon: Key,
            permission: 'view_permissions',
        },
        {
            title: 'Textos',
            href: '/admin/texts',
            icon: FileText,
            permission: 'view_texts',
        },
        {
            title: 'Productos',
            href: '/admin/productos',
            icon: Package,
            permission: 'view_productos',
        }, */
    ];

    const mainNavItems: NavItem[] = allNavItems
        .filter(item => !item.permission || hasPermission(item.permission))
        .map(({ permission, ...item }) => item);

    const footerNavItems: NavItem[] = [
        /*{
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },*/
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')} prefetch>
                                <AppLogoIcon className="h-8 w-auto max-w-full shrink-0 group-data-[collapsible=icon]:h-5" />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
