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
    'folder_video' => 'data/videos/',
    // Fotos de la galería de "Nosotros" subidas desde el panel
    'folder_about' => 'data/about/',
    // Logos del footer (modo claro / oscuro) subidos desde el panel
    'folder_footer' => 'data/footer/',

    'permission_sectors' => [
        'general' => 'General',
        'users' => 'Usuarios',
        'roles' => 'Roles',
        'permissions' => 'Permisos',
        'texts' => 'Textos',
        'products' => 'Productos',
        'categories' => 'Categorías',
        'subcategories' => 'Subcategorías',
        'brands' => 'Marcas',
        'banners' => 'Banners',
        'about' => 'Nosotros',
        'footer' => 'Footer',
        'inventories' => 'Inventarios',
        'carts' => 'Carritos',
        'configuracion' => 'Configuración',
        'reportes' => 'Reportes',
        'inventario' => 'Inventario',
        'ventas' => 'Ventas',
        'compras' => 'Compras',
        'contabilidad' => 'Contabilidad',
        'recursos_humanos' => 'Recursos Humanos',
        'marketing' => 'Marketing',
        'soporte' => 'Soporte Técnico',
    ],
    
];
