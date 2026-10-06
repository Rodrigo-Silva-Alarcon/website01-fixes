import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
/* import { dashboard } from '@/routes/admin'; */
import { type NavItem } from '@/types';
import { route } from 'ziggy-js';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Shield, Key, FileText, Package, FolderClosed, Folders, Wrench, Images, ShoppingBasket, Banknote, Star, Info, LayoutTemplate, Contact, PanelBottom, MessageSquareText } from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/use-permissions';
import AppLogoIcon from '@/components/app-logo-icon';

export function AppSidebar() {
    const { hasPermission } = usePermissions();
    const { state } = useSidebar();
    
    const allNavItems: Array<NavItem & { permission?: string }> = [
        {
            title: 'Panel de Control',
            href: route('admin.dashboard'),
            icon: LayoutGrid,
            permission: 'access_dashboard',
        },
        {
            title: 'Página de inicio',
            href: route('admin.home.index'),
            icon: LayoutTemplate,
            permission: 'view_home',
        },
        {
            title: 'Banners',
            href: route('banners.index'),
            icon: Images,
            permission: 'view_banners',
        },
        {
            title: 'Nosotros',
            href: route('admin.about.index'),
            icon: Info,
            permission: 'view_about',
        },
        {
            title: 'Contacto',
            href: route('admin.contact.index'),
            icon: Contact,
            permission: 'view_contact',
        },
        {
            title: 'Logo',
            href: route('admin.footer.index'),
            icon: PanelBottom,
            permission: 'view_footer',
        },
        {
            title: 'Textos de la tienda',
            href: route('admin.store-texts.index'),
            icon: MessageSquareText,
            permission: 'view_store_texts',
        },
        {
            title: 'Marcas',
            href: route('brands.index'),
            icon: Star,
            permission: 'view_brands',
        },
        {
            title: 'Categoría',
            href: route('categories.index'),
            icon: FolderClosed,
            permission: 'view_categories',
        },
        {
            title: 'Subategorias',
            href: route('subcategories.index'),
            icon: Folders,
            permission: 'view_subcategories',
        },
        {
            title: 'Productos',
            href: route('products.index'),
            icon: Wrench,
            permission: 'view_products',
        },
        {
            title: 'Stock',
            href: route('inventories.index'),
            icon: Banknote,
            permission: 'view_inventories',
        },
        {
            title: 'Carrito de Compras',
            href: route('admin.carts.index'),
            icon: ShoppingBasket,
            permission: 'view_carts',
        },
        {
            title: 'Usuarios',
            href: '/admin/users',
            icon: Users,
            permission: 'view_users',
        },
        {
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
                                {state === 'collapsed' ? (
                                    <AppLogoIcon variant="icon" className="size-6!" />
                                ) : (
                                    <AppLogoIcon className="h-8! w-auto! max-w-full shrink-0" />
                                )}
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
