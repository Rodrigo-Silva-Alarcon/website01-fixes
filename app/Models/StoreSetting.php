<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Admin › Textos de la tienda (una sola fila): textos de negocio del carrito, la ficha de
 * producto y los mensajes de WhatsApp que antes estaban escritos en el código.
 * Teléfono, dirección y horario siguen saliendo de Admin › Contacto.
 */
class StoreSetting extends Model
{
    /**
     * Campos agrupados como en el panel: clave => [etiqueta, máximo de caracteres, valor por defecto].
     * Los valores por defecto son los textos que la web mostraba antes de hacerlos editables.
     */
    public const FIELDS = [
        'cart' => [
            'title' => 'Carrito',
            'fields' => [
                'delivery_label' => ['Envío en el resumen del pedido', 30, 'Delivery'],
                'delivery_value' => ['Costo del envío', 30, 'Gratis'],
                'order_button' => ['Botón para enviar el pedido', 60, 'Solicitar pedido por WhatsApp'],
                'cart_perk_delivery' => ['Ventaja: envío', 120, 'Delivery gratuito, entrega en 24 h'],
                'cart_perk_payment' => ['Ventaja: forma de pago', 120, 'Pago seguro: transferencia, QR o efectivo'],
                'pickup_label' => ['Retiro en tienda (la dirección sale de Contacto)', 60, 'Retira en tienda'],
            ],
        ],
        'product' => [
            'title' => 'Ficha de producto',
            'fields' => [
                'pdp_delivery_title' => ['Ventaja de envío: título', 60, 'Delivery gratuito'],
                'pdp_delivery_text' => ['Ventaja de envío: detalle', 120, 'Entrega en 24 h'],
                'pdp_payment_title' => ['Ventaja de pago: título', 60, 'Pago seguro'],
                'pdp_payment_text' => ['Ventaja de pago: detalle', 120, 'Transferencia, QR o efectivo contra entrega'],
                'pdp_condition_default' => ['Condición (producto sin descripción)', 120, 'Producto original con garantía oficial'],
                'pdp_warranty' => ['Garantía (producto sin características)', 120, 'Oficial del fabricante'],
                'pdp_condition' => ['Condición (producto sin características)', 120, 'Nuevo, sellado'],
            ],
        ],
        'whatsapp' => [
            'title' => 'Mensajes de WhatsApp',
            'fields' => [
                'wa_order_intro' => ['Inicio del mensaje de pedido', 200, 'Hola, quiero hacer el siguiente pedido:'],
                'wa_product_intro' => ['Inicio de la consulta por un producto', 200, 'Hola, quisiera más información sobre este producto:'],
                'wa_product_no_price' => ['Consulta de un producto sin precio', 200, 'Quisiera consultar el precio y la disponibilidad.'],
                'wa_restock' => ['Consulta cuando una categoría no tiene stock', 200, 'Hola, quisiera consultar sobre la disponibilidad y reingreso de productos'],
            ],
        ],
    ];

    protected $fillable = ['texts', 'updated_by'];

    protected $casts = [
        'texts' => 'array',
    ];

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /** @return array<string, array{0: string, 1: int, 2: string}> clave => [etiqueta, máximo, por defecto] */
    public static function fieldList(): array
    {
        return array_merge(...array_values(array_column(self::FIELDS, 'fields')));
    }

    /** @return array<string, string> */
    public static function defaults(): array
    {
        return array_map(fn (array $field) => $field[2], self::fieldList());
    }

    /** Textos guardados completados con los valores por defecto (solo claves conocidas). @return array<string, string> */
    public function values(): array
    {
        $saved = array_intersect_key(array_filter($this->texts ?? [], 'filled'), self::fieldList());

        return [...self::defaults(), ...$saved];
    }
}
