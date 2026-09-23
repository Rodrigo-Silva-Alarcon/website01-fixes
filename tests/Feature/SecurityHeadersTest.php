<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('sets security headers on public HTML responses', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    $csp = $response->headers->get('Content-Security-Policy');
    expect($csp)->not->toBeNull();
    expect($csp)->toContain("default-src 'self'");
    expect($csp)->toContain("object-src 'none'");
});

it('does not apply CSP to error responses without HTML success', function () {
    $response = $this->get('/missing-asset.css');

    $response->assertNotFound();
    $response->assertHeaderMissing('Content-Security-Policy');
});
