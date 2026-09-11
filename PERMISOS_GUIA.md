# 🚀 Sistema Escalable de Permisos

## 📋 Cómo Agregar Nuevos Sectores

### Método 1: Usando el Comando de Artisan (Recomendado)

```bash
# Para un sector básico
php artisan permissions:create productos productos

# Para un sector con permisos adicionales
php artisan permissions:create ventas ventas --additional='{"approve_ventas":"Aprobar ventas","cancel_ventas":"Cancelar ventas"}'
```

### Método 2: Manualmente en PermissionSeeder

```php
// En database/seeders/PermissionSeeder.php
$this->createSectorPermissions('productos', 'productos');
$this->createSectorPermissions('ventas', 'ventas', [
    'approve_ventas' => 'Aprobar ventas',
    'cancel_ventas' => 'Cancelar ventas'
]);
```

## 🔧 Pasos Completos para Agregar un Nuevo Sector

### 1. Crear Permisos
```bash
php artisan permissions:create productos productos
```

### 2. Agregar al Sidebar
```typescript
// En resources/js/components/app-sidebar.tsx
const allNavItems: Array<NavItem & { permission?: string }> = [
    // ... elementos existentes
    {
        title: 'Productos',
        href: '/admin/productos',
        icon: Package, // Importar el icono
        permission: 'view_productos',
    },
];
```

### 3. Crear Rutas
```php
// En routes/web.php
Route::resource('/productos', ProductoController::class)->names('admin.productos');
```

### 4. Crear Controlador
```bash
php artisan make:controller Admin/ProductoController --resource
```

### 5. Crear Vistas
```bash
# Crear las vistas en resources/js/pages/admin/productos/
mkdir resources/js/pages/admin/productos
```

### 6. Asignar Permisos a Roles
```php
// En database/seeders/RolePermissionSeeder.php
$editorPermissions = $allPermissions->whereIn('name', [
    'view_productos', 'create_productos', 'edit_productos', 'delete_productos', 'view_productos_item',
    // ... otros permisos
]);
```

## 📝 Ejemplos Prácticos

### Ejemplo 1: Sector "Productos"
```bash
php artisan permissions:create productos productos
```

**Permisos generados:**
- `view_productos` - Ver lista de productos
- `create_productos` - Crear nuevos productos
- `edit_productos` - Editar productos existentes
- `delete_productos` - Eliminar productos
- `view_productos_item` - Ver detalles de un producto

### Ejemplo 2: Sector "Ventas" con Permisos Adicionales
```bash
php artisan permissions:create ventas ventas --additional='{"approve_ventas":"Aprobar ventas","cancel_ventas":"Cancelar ventas","export_ventas":"Exportar ventas"}'
```

**Permisos generados:**
- `view_ventas` - Ver lista de ventas
- `create_ventas` - Crear nuevas ventas
- `edit_ventas` - Editar ventas existentes
- `delete_ventas` - Eliminar ventas
- `view_ventas_item` - Ver detalles de una venta
- `approve_ventas` - Aprobar ventas
- `cancel_ventas` - Cancelar ventas
- `export_ventas` - Exportar ventas

### Ejemplo 3: Sector "Inventario" con Permisos Específicos
```bash
php artisan permissions:create inventario inventario --additional='{"adjust_inventario":"Ajustar inventario","transfer_inventario":"Transferir inventario","audit_inventario":"Auditar inventario"}'
```

## 🎯 Patrones de Permisos Comunes

### Permisos Básicos (CRUD)
- `view_{sector}` - Ver lista
- `create_{sector}` - Crear
- `edit_{sector}` - Editar
- `delete_{sector}` - Eliminar
- `view_{sector}_item` - Ver detalles

### Permisos Adicionales Comunes
- `approve_{sector}` - Aprobar
- `cancel_{sector}` - Cancelar
- `export_{sector}` - Exportar
- `import_{sector}` - Importar
- `archive_{sector}` - Archivar
- `restore_{sector}` - Restaurar
- `audit_{sector}` - Auditar

## 🔄 Flujo de Trabajo Recomendado

1. **Planificar** el sector y sus permisos
2. **Crear permisos** usando el comando
3. **Agregar al sidebar** con el permiso correspondiente
4. **Crear rutas** en web.php
5. **Crear controlador** y vistas
6. **Asignar permisos** a roles según corresponda
7. **Probar** con diferentes usuarios

## 📊 Mantenimiento

### Verificar Permisos Existentes
```bash
php artisan tinker --execute="App\Models\Permission::orderBy('sector')->get(['name', 'description', 'sector'])->groupBy('sector')"
```

### Limpiar Permisos No Utilizados
```bash
php artisan tinker --execute="App\Models\Permission::whereNotIn('name', ['permisos_utilizados'])->delete()"
```

## 🚨 Notas Importantes

- Los permisos se crean automáticamente si no existen
- El sistema es case-sensitive para los nombres de permisos
- Siempre usar nombres en plural para sectores (`productos`, `ventas`)
- Los permisos adicionales deben ser específicos del sector
- Probar siempre con diferentes roles después de agregar nuevos permisos
