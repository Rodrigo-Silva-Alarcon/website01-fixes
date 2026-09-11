<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveTextRequest extends FormRequest
{
    public function rules(): array
    {
        $textId = $this->route('text') ? $this->route('text')->id : null;
        
        return [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('texts', 'name')->ignore($textId),
            ],
            'date' => 'required|date',
            'gender' => 'required|in:male,female',
            'type' => 'required|array|min:1',
            'type.*' => 'in:report,article,news',
            'print_view' => 'required|in:letter,a4,legal,legal_size',
            'image' => 'nullable|file|max:2048',
            'delete_image' => 'nullable|boolean',
            'summary' => 'nullable|string|max:200',
            'content' => 'nullable|string',
            'publish' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'name.unique' => 'El nombre ya está en uso.',
            'date.required' => 'La fecha es obligatoria.',
            'date.date' => 'La fecha debe ser válida.',
            'gender.required' => 'El género es obligatorio.',
            'gender.in' => 'El género debe ser masculino o femenino.',
            'type.required' => 'Debe seleccionar al menos un tipo.',
            'type.array' => 'El tipo debe ser un array.',
            'type.min' => 'Debe seleccionar al menos un tipo.',
            'type.*.in' => 'El tipo seleccionado no es válido.',
            'print_view.required' => 'La vista de impresión es obligatoria.',
            'print_view.in' => 'La vista de impresión seleccionada no es válida.',
            'image.image' => 'El archivo debe ser una imagen.',
            'image.mimes' => 'La imagen debe ser jpeg, png, jpg o gif.',
            'image.max' => 'La imagen no debe superar los 2MB.',
            'delete_image.boolean' => 'El campo eliminar imagen debe ser verdadero o falso.',
            'summary.string' => 'El resumen debe ser una cadena de texto.',
            'summary.max' => 'El resumen no debe superar los 200 caracteres.',
            'content.string' => 'El contenido debe ser una cadena de texto.',
            'publish.boolean' => 'El campo publicar debe ser verdadero o falso.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'date' => 'fecha',
            'gender' => 'género',
            'type' => 'tipo',
            'print_view' => 'vista de impresión',
            'image' => 'imagen',
            'delete_image' => 'eliminar imagen',
            'summary' => 'resumen',
            'content' => 'contenido',
            'publish' => 'publicar',
        ];
    }
}
