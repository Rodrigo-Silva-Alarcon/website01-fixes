<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BannerRequest extends FormRequest
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
            'image' => 'nullable|file',
            'type' => 'nullable',
            'url' => 'nullable|string|max:250',
            'product_id' => 'nullable|integer|exists:products,id',
            'page_id' => 'nullable|integer',
            'summary' => 'nullable|string',
            'pages' => 'nullable',
            'active' => 'nullable|string|max:2',
            'sw_title' => 'nullable|string|max:2',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name' => 'nombre',
            'image' => 'imagen',
            'type' => 'tipo',
            'url' => 'url',
            'product_id' => 'producto',
            'page_id' => 'pagina',
            'summary' => 'resumen',
            'active' => 'publico',
            'pages' => 'paginas',
        ];
    }
}




