<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Request de validación para posts con manejo de imágenes y archivos
 */
class SavePostRequest extends FormRequest
{
    /**
     * Determinar si el usuario está autorizado para hacer esta petición
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Reglas de validación dinámicas
     */
    public function rules(): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,archived',
            'category' => 'required|in:news,blog,tutorial,review',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'allow_comments' => 'boolean',
        ];

        // Reglas para imágenes
        $rules['featured_image'] = 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120'; // 5MB
        $rules['gallery'] = 'nullable|array|max:10';
        $rules['gallery.*'] = 'image|mimes:jpeg,png,jpg,gif|max:5120';

        // Reglas para archivos
        $rules['attachment'] = 'nullable|file|mimes:pdf,doc,docx,txt|max:5120'; // 5MB

        return $rules;
    }

    /**
     * Mensajes de validación personalizados en español
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.string' => 'El título debe ser una cadena de texto.',
            'title.max' => 'El título no puede exceder los 255 caracteres.',
            
            'content.required' => 'El contenido es obligatorio.',
            'content.string' => 'El contenido debe ser una cadena de texto.',
            
            'excerpt.string' => 'El resumen debe ser una cadena de texto.',
            'excerpt.max' => 'El resumen no puede exceder los 500 caracteres.',
            
            'status.required' => 'El estado es obligatorio.',
            'status.in' => 'El estado debe ser: borrador, publicado o archivado.',
            
            'category.required' => 'La categoría es obligatoria.',
            'category.in' => 'La categoría debe ser: noticias, blog, tutorial o reseña.',
            
            'featured_image.image' => 'La imagen destacada debe ser un archivo de imagen.',
            'featured_image.mimes' => 'La imagen destacada debe ser: jpeg, png, jpg o gif.',
            'featured_image.max' => 'La imagen destacada no puede exceder los 5MB.',
            
            'gallery.array' => 'La galería debe ser un array de imágenes.',
            'gallery.max' => 'La galería no puede tener más de 10 imágenes.',
            'gallery.*.image' => 'Cada elemento de la galería debe ser una imagen.',
            'gallery.*.mimes' => 'Cada imagen debe ser: jpeg, png, jpg o gif.',
            'gallery.*.max' => 'Cada imagen no puede exceder los 5MB.',
            
            'attachment.file' => 'El archivo adjunto debe ser un archivo válido.',
            'attachment.mimes' => 'El archivo adjunto debe ser: pdf, doc, docx o txt.',
            'attachment.max' => 'El archivo adjunto no puede exceder los 5MB.',
        ];
    }

    /**
     * Atributos personalizados para los mensajes de error
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'content' => 'contenido',
            'excerpt' => 'resumen',
            'status' => 'estado',
            'category' => 'categoría',
            'featured_image' => 'imagen destacada',
            'gallery' => 'galería',
            'attachment' => 'archivo adjunto',
        ];
    }
}
