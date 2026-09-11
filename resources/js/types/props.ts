/**
 * Interfaces para props de componentes
 * Estas interfaces definen las props que reciben los componentes React
 */

import { User, Role, Permission } from './models';
import { BreadcrumbItem } from './ui';

// Props para páginas de índice
export interface IndexPageProps<T> {
    records: {
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
    };
    breadcrumbs: BreadcrumbItem[];
}

// Props para formularios
export interface FormPageProps<T> {
    record: T;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
}

// Props específicas para roles
export interface RoleFormProps {
    role: Role;
    permissions: Permission[];
    sectors: Record<string, string>;
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
    success?: string;
    error?: string;
}

// Props específicas para usuarios
export interface UserFormProps {
    user: User;
    roles: Role[];
    isEdit?: boolean;
    title: string;
    description: string;
    breadcrumbs: BreadcrumbItem[];
}
