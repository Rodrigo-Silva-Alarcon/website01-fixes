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
     * FormData no envía arrays vacíos: si se desmarcan todas las páginas el campo
     * no llega y se quedarían las anteriores. Se normaliza para que el guardado sea real.
     */
    protected function prepareForValidation(): void
    {
        $pages = $this->input('pages', []);

        $this->merge([
            'pages' => array_values(array_unique(array_map('strval', array_filter((array) $pages, 'filled')))),
        ]);
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
            'pages' => 'required|array|min:1',
            'pages.*' => 'in:'.implode(',', \App\Services\WebContentService::BANNER_PAGES),
            'active' => 'nullable|string|max:2',
            'sw_title' => 'nullable|string|max:2',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
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
            'pages.required' => 'Selecciona al menos una página donde se mostrará el banner.',
            'pages.min' => 'Selecciona al menos una página donde se mostrará el banner.',
            'pages.*.in' => 'Página no válida.',
            'start_date.date' => 'La fecha de inicio debe ser válida.',
            'end_date.date' => 'La fecha de fin debe ser válida.',
            'end_date.after_or_equal' => 'La fecha de fin debe ser posterior o igual a la de inicio.',
        ];
    }
}




