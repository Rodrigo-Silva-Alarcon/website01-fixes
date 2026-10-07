<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Configuración de Sectores del Sistema
    |--------------------------------------------------------------------------
    |
    | Aquí puedes definir todos los sectores del sistema y sus permisos
    | adicionales. Esto facilita la gestión y escalabilidad del sistema.
    |
    */

    'sectores' => [
        'usuarios' => [
            'nombre' => 'usuarios',
            'permisos_adicionales' => [],
            'icono' => 'Users',
            'ruta' => '/admin/users',
            'permiso_vista' => 'view_users',
        ],
        
        'roles' => [
            'nombre' => 'roles',
            'permisos_adicionales' => [],
            'icono' => 'Shield',
            'ruta' => '/admin/roles',
            'permiso_vista' => 'view_roles',
        ],
        
        'permisos' => [
            'nombre' => 'permisos',
            'permisos_adicionales' => [],
            'icono' => 'Key',
            'ruta' => '/admin/permissions',
            'permiso_vista' => 'view_permissions',
        ],
        
        'textos' => [
            'nombre' => 'textos',
            'permisos_adicionales' => [
                'publish_texts' => 'Publicar/despublicar textos',
            ],
            'icono' => 'FileText',
            'ruta' => '/admin/texts',
            'permiso_vista' => 'view_texts',
        ],
        
        'products' => [
            'nombre' => 'products',
            'permisos_adicionales' => [],
            'icono' => 'Package',
            'ruta' => '/admin/products',
            'permiso_vista' => 'view_products',
        ],

        'categories' => [
            'nombre' => 'categories',
            'permisos_adicionales' => [],
            'icono' => 'FolderClosed',
            'ruta' => '/admin/categories',
            'permiso_vista' => 'view_categories',
        ],

        'subcategories' => [
            'nombre' => 'subcategories',
            'permisos_adicionales' => [],
            'icono' => 'Folders',
            'ruta' => '/admin/subcategories',
            'permiso_vista' => 'view_subcategories',
        ],

        'brands' => [
            'nombre' => 'brands',
            'permisos_adicionales' => [],
            'icono' => 'Star',
            'ruta' => '/admin/brands',
            'permiso_vista' => 'view_brands',
        ],

        'banners' => [
            'nombre' => 'banners',
            'permisos_adicionales' => [],
            'icono' => 'Images',
            'ruta' => '/admin/banners',
            'permiso_vista' => 'view_banners',
        ],

        'inventories' => [
            'nombre' => 'inventories',
            'permisos_adicionales' => [],
            'icono' => 'Banknote',
            'ruta' => '/admin/inventories',
            'permiso_vista' => 'view_inventories',
        ],

        'orders' => [
            'nombre' => 'orders',
            'permisos_adicionales' => [],
            'icono' => 'ClipboardList',
            'ruta' => '/admin/orders',
            'permiso_vista' => 'view_orders',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Permisos Generales del Sistema
    |--------------------------------------------------------------------------
    |
    | Permisos que no pertenecen a un sector específico
    |
    */
    
    'permisos_generales' => [
        'access_dashboard' => 'Acceder al dashboard',
        'view_profile' => 'Ver perfil propio',
        'edit_profile' => 'Editar perfil propio',
    ],

    /*
    |--------------------------------------------------------------------------
    | Configuración de Roles por Defecto
    |--------------------------------------------------------------------------
    |
    | Define qué permisos tiene cada rol por defecto
    |
    */
    
    'roles_default' => [
        'admin' => [
            'tiene_todos_los_permisos' => true,
        ],
        
        'editor_textos' => [
            'sectores' => ['textos'],
            'permisos_generales' => ['access_dashboard', 'view_profile', 'edit_profile'],
        ],
        
        'viewer_textos' => [
            'sectores' => ['textos'],
            'permisos_especificos' => ['view_texts', 'view_text'],
            'permisos_generales' => ['access_dashboard', 'view_profile', 'edit_profile'],
        ],
    ],
];
