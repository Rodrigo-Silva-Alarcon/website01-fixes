<?php

namespace App\Support;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * HTML del editor enriquecido (TinyMCE) listo para pintarse en la tienda.
 * Conserva lo que produce el editor (párrafos, listas, tablas, enlaces, imágenes y estilos
 * en línea) y quita lo que puede ejecutar código: <script>, atributos on*, javascript:, etc.
 */
class RichText
{
    private static ?HtmlSanitizer $sanitizer = null;

    public static function clean(?string $html): ?string
    {
        // Sin "<" no hay etiquetas: el texto plano se guarda intacto (el saneador codificaría "@" como &#64;)
        if ($html === null || ! str_contains($html, '<')) {
            return $html;
        }

        return self::sanitizer()->sanitize($html);
    }

    private static function sanitizer(): HtmlSanitizer
    {
        if (self::$sanitizer) {
            return self::$sanitizer;
        }

        $config = (new HtmlSanitizerConfig)
            ->allowSafeElements()
            ->allowElement('span', ['style'])
            ->allowElement('font', ['color', 'size', 'face'])
            ->allowAttribute('style', '*')
            ->allowAttribute('align', '*')
            ->allowAttribute('target', 'a')
            ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
            ->allowRelativeLinks()
            ->allowMediaSchemes(['http', 'https', 'data'])
            ->allowRelativeMedias()
            ->forceAttribute('a', 'rel', 'noopener noreferrer')
            ->withMaxInputLength(500_000);

        return self::$sanitizer = new HtmlSanitizer($config);
    }
}
