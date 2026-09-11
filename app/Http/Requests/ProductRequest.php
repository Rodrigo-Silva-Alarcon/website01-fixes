<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProductRequest extends FormRequest
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
            'category_id' => 'required|integer|exists:categories,id',
            'subcategory_id' => 'nullable|integer|exists:subcategories,id',
            'brand_id' => 'nullable|integer|exists:brands,id',
            'image' => 'nullable|file',
            'name' => 'required|string|max:250',
            'summary' => 'nullable|string',
            'general_info' => 'nullable|string',
            'description' => 'nullable|string',
            'tecnical_info' => 'nullable|string',
            'tecnical_image' => 'nullable|file',
            'video_type' => 'nullable|string',
            'video_file' =>  'nullable|file',
            'video_url' => 'nullable|string',
            'video_iframe' => 'nullable|string',
            'active' => 'nullable|string|max:2',
            'featured' => 'nullable|string|max:2',
            'pop' => 'nullable|string|max:2',
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
            'name.required' => 'El nombre del producto es obligatorio.',
            'name.max' => 'El nombre no puede tener más de 250 caracteres.',
            'summary.string' => 'El resumen debe ser un texto.',
            'description.string' => 'La descripción debe ser un texto.',
            'active.max' => 'El estado no puede tener más de 2 caracteres.',
        ];
    }
}





