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
    expect($csp)->toContain("frame-src 'self' https://www.google.com");
    expect($csp)->toContain('https://fonts.bunny.net');
});

it('allows Vite HMR origin in CSP when hot file exists', function () {
    $hot = public_path('hot');
    $originalContent = is_file($hot) ? file_get_contents($hot) : null;
    file_put_contents($hot, 'http://127.0.0.1:5173');

    try {
        $response = $this->get('/');
        $csp = $response->headers->get('Content-Security-Policy');
        expect($csp)->toContain('http://127.0.0.1:5173');
    } finally {
        if ($originalContent !== null) {
            file_put_contents($hot, $originalContent);
        } elseif (is_file($hot)) {
            unlink($hot);
        }
    }
});

it('does not apply CSP to error responses without HTML success', function () {
    $response = $this->get('/missing-asset.css');

    $response->assertNotFound();
    $response->assertHeaderMissing('Content-Security-Policy');
});
