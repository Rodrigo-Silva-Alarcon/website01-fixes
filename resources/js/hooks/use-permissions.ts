import { usePage } from '@inertiajs/react';
import { type Permission, type Role } from '@/types/models';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<Role & { permissions: Permission[] }>;
}

interface SharedData {
    [key: string]: unknown;
    auth: {
        user: User | null;
    };
}

export function usePermissions() {
    const { props } = usePage<SharedData>();
    const user = props.auth.user;

    const hasPermission = (permissionName: string): boolean => {
        if (!user || !user.roles) {
            return false;
        }

        // Verificar permisos reales en lugar de dar acceso automático a admin
        const hasRealPermission = user.roles.some(role =>
            role.permissions && role.permissions.some(permission => permission.name === permissionName)
        );

        // Log para debugging
        console.log(`🔍 Verificando permiso "${permissionName}":`, hasRealPermission);
        
        return hasRealPermission;
    };

    const hasRole = (roleName: string): boolean => {
        if (!user || !user.roles) {
            return false;
        }

        return user.roles.some(role => role.name === roleName);
    };

    return { hasPermission, hasRole, user };
}
