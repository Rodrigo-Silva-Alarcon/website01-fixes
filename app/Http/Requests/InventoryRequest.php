<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InventoryRequest extends FormRequest
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
        $inventoryId = $this->route('inventory') ? $this->route('inventory')->id : null;

        return [
            'product_id' => 'required|integer|exists:products,id',
            'amount' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'offer_amount'  => 'nullable|numeric|min:0',
            'ini'  => 'nullable|date',
            'fin'  => 'nullable|date',
            'money' => 'required|string|max:10',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'El producto es obligatorio.',
            'product_id.exists' => 'El producto seleccionado no existe.',
            'amount.required' => 'El monto es obligatorio.',
            'amount.numeric' => 'El monto debe ser un número.',
            'amount.min' => 'El monto debe ser mayor o igual a 0.',
            'stock.integer' => 'El stock debe ser un número entero.',
            'stock.min' => 'El stock debe ser mayor o igual a 0.',
            'money.required' => 'La moneda es obligatoria.',
            'money.max' => 'La moneda no puede tener más de 10 caracteres.',
        ];
    }
}





