<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Sectores de Permisos
    |--------------------------------------------------------------------------
    |
    | Define los sectores disponibles para agrupar los permisos del sistema.
    | Cada sector representa una funcionalidad específica de la aplicación.
    |
    | Formato: 'clave' => 'Etiqueta para mostrar'
    |
    */  
    'thumbs' => 'thumbs/',
    'hthumbs' => 'hthumbs/',
    // Variante WebP mediana (800px) de los banners: la usa el hero en móvil vía srcset
    'banner_md' => 'md/',
    'banner_md_width' => 800,
    'folder_banner' => 'data/banners/', 
    'folder_product' => 'data/products/',   
    'folder_category' => 'data/categories/',   
    'folder_image' => 'data/images/',
    // Fotos de la galería de "Nosotros" subidas desde el panel
    'folder_about' => 'data/about/',
    // Fotos del showroom de la página de inicio subidas desde el panel
    'folder_home' => 'data/home/',
    // Logos del footer (modo claro / oscuro) subidos desde el panel
    'folder_footer' => 'data/footer/',

    'permission_sectors' => [
        // Mismo nombre que en el menú del panel, para reconocer cada ventana
        'general' => 'Panel de Control',
        'home' => 'Página de inicio',
        'banners' => 'Banners',
        'about' => 'Nosotros',
        'contact' => 'Contacto',
        'footer' => 'Logo',
        'store_texts' => 'Textos de la tienda',
        'brands' => 'Marcas',
        'categories' => 'Categorías',
        'subcategories' => 'Subcategorías',
        'products' => 'Productos',
        'inventories' => 'Stock',
        'orders' => 'Pedidos',
        'users' => 'Usuarios',
        'roles' => 'Roles',
        'permissions' => 'Permisos',
        'texts' => 'Textos',
        'backups' => 'Copias de seguridad',
    ],
    
];
