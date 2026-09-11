<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:250',
            'original_name' => 'required|string|max:250',
            'filetable_type' => 'required|string',
            'filetable_id' => 'required|integer',
            'order' => 'nullable|integer|min:0',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre del archivo es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 250 caracteres.',
            'original_name.required' => 'El nombre original es obligatorio.',
            'original_name.max' => 'El nombre original no puede tener más de 250 caracteres.',
            'filetable_type.required' => 'El tipo de modelo es obligatorio.',
            'filetable_id.required' => 'El ID del modelo es obligatorio.',
            'filetable_id.integer' => 'El ID del modelo debe ser un número entero.',
            'order.integer' => 'El orden debe ser un número entero.',
            'order.min' => 'El orden debe ser mayor o igual a 0.',
        ];
    }
}





