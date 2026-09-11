<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request de validación para usuarios con reglas dinámicas
 */
class SaveUserRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para hacer esta petición
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación dinámicas según la acción
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id ?? $this->user?->id;
        
        $rules = [
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'last2_name' => 'nullable|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'alias' => [
                'required',
                'string',
                'max:255',
                Rule::unique('users', 'alias')->ignore($userId),
            ],
            'roles' => 'array',
            'roles.*' => 'exists:roles,id',
        ];

        // Solo agregar password en creación
        if ($this->isMethod('post')) {
            $rules['password'] = 'required|confirmed|min:8';
            $rules['password_confirmation'] = 'required|min:8';
        }

        return $rules;
    }

    /**
     * Mensajes de validación personalizados en español
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.string' => 'El nombre debe ser una cadena de texto.',
            'name.max' => 'El nombre no puede exceder los 255 caracteres.',
            
            'last_name.string' => 'El apellido paterno debe ser una cadena de texto.',
            'last_name.max' => 'El apellido paterno no puede exceder los 255 caracteres.',
            
            'last2_name.string' => 'El apellido materno debe ser una cadena de texto.',
            'last2_name.max' => 'El apellido materno no puede exceder los 255 caracteres.',
            
            'email.required' => 'El email es obligatorio.',
            'email.email' => 'El email debe tener un formato válido.',
            'email.max' => 'El email no puede exceder los 255 caracteres.',
            'email.unique' => 'Este email ya está registrado.',
            
            'alias.required' => 'El alias es obligatorio.',
            'alias.string' => 'El alias debe ser una cadena de texto.',
            'alias.max' => 'El alias no puede exceder los 255 caracteres.',
            'alias.unique' => 'Este alias ya está registrado.',
            
            'password.required' => 'La contraseña es obligatoria.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            
            'password_confirmation.required' => 'La confirmación de contraseña es obligatoria.',
            'password_confirmation.min' => 'La confirmación de contraseña debe tener al menos 8 caracteres.',
        ];
    }

    /**
     * Atributos personalizados para los mensajes de error
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'last_name' => 'apellido paterno',
            'last2_name' => 'apellido materno',
            'email' => 'correo electrónico',
            'alias' => 'alias',
            'password' => 'contraseña',
            'password_confirmation' => 'confirmación de contraseña',
        ];
    }
}
