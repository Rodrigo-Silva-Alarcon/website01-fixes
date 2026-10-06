<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BrandRequest extends FormRequest
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
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif,webp|max:5120',
            'active' => 'nullable|string|max:2',
        ];
    }

    /**
     * Nombres de los campos en los mensajes de error.
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'image' => 'imagen',
            'active' => 'publico',
        ];
    }
}




