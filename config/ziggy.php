<?php

return [
    // @routes solo emite la configuración (const Ziggy = {...}). La función route() ya viene
    // en el bundle de JS (import { route } from 'ziggy-js'); repetirla en línea sumaba ~20 KB al HTML.
    'skip-route-function' => true,
];
