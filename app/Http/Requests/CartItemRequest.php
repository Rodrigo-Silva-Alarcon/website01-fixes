<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CartItemRequest extends FormRequest
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
            'card_id' => 'required|integer|exists:carts,id',
            'product_id' => 'required|integer|exists:products,id',
            'amount' => 'nullable|integer|min:1',
            'money' => 'required|string|max:10',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'card_id.required' => 'El carrito es obligatorio.',
            'card_id.exists' => 'El carrito seleccionado no existe.',
            'product_id.required' => 'El producto es obligatorio.',
            'product_id.exists' => 'El producto seleccionado no existe.',
            'amount.integer' => 'La cantidad debe ser un número entero.',
            'amount.min' => 'La cantidad debe ser mayor o igual a 1.',
            'money.required' => 'La moneda es obligatoria.',
            'money.max' => 'La moneda no puede tener más de 10 caracteres.',
        ];
    }
}





