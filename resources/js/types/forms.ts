/**
 * Interfaces para formularios
 * Estas interfaces definen la estructura de datos para formularios
 */

import { User, Role, Permission } from './models';

// Formulario de Usuario
export interface UserFormData extends Omit<Partial<User>, 'roles'> {
    roles?: number[];
    password?: string;
    password_confirmation?: string;
}

// Formulario de Rol
export type RoleFormData = {
    name: string;
    description: string;
    permissions: number[];
}

// Formulario de Permiso
export interface PermissionFormData {
    name: string;
    description: string;
    guard_name: string;
}

// Formulario de Cambio de Contraseña
export interface PasswordFormData {
    current_password: string;
    password: string;
    password_confirmation: string;
}
