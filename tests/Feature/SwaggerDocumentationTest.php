<?php

test('swagger ui page is available', function () {
    $this->get(route('api.documentation'))
        ->assertOk()
        ->assertSee('BarangaEco API Documentation')
        ->assertSee('swagger-ui');
});

test('openapi json endpoint is available', function () {
    $this->get(route('api.documentation.openapi'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/json');

    $data = json_decode(file_get_contents(base_path('openapi.json')), true);
    expect($data['openapi'])->toBe('3.0.3');
    expect($data['info']['title'])->toBe('BarangaEco Mobile API');
});
