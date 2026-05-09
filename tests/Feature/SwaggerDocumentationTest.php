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
        ->assertHeader('content-type', 'application/json')
        ->assertJsonPath('openapi', '3.0.3')
        ->assertJsonPath('info.title', 'BarangaEco Mobile API');
});
