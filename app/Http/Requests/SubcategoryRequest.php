<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubcategoryRequest extends FormRequest
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
        $subcategoryId = $this->route('subcategory') ? $this->route('subcategory')->id : null;

        return [
            'category_id' => 'required|integer|exists:categories,id',
            'name' => 'required|string|max:250',
            'summary' => 'nullable|string',
            'icon' => 'nullable|string',
            'active' => 'nullable|string|max:2',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'category_id.required' => 'La categoría es obligatoria.',
            'category_id.exists' => 'La categoría seleccionada no existe.',
            'name.required' => 'El nombre de la subcategoría es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 250 caracteres.',
            'slug.required' => 'El slug es obligatorio.',
            'slug.unique' => 'Este slug ya está en uso.',
            'slug.max' => 'El slug no puede tener más de 250 caracteres.',
            'summary.required' => 'El resumen es obligatorio.',
            'summary.string' => 'El resumen debe ser un texto.',
            'active.max' => 'El estado no puede tener más de 2 caracteres.',
            'order.integer' => 'El orden debe ser un número entero.',
            'order.min' => 'El orden debe ser mayor o igual a 0.',
        ];
    }
}





