<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Contact form recipient
    |--------------------------------------------------------------------------
    |
    | Destination address for messages submitted through /Contactanos.
    | Falls back to the global mail "from" address when unset.
    |
    */

    'email' => env('CONTACT_EMAIL', env('MAIL_FROM_ADDRESS', 'hello@example.com')),

];
