<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExceptionHandlerTest extends TestCase
{
    public function test_metodo_nao_permitido_devolve_405_em_vez_de_500(): void
    {
        // GET /api/produtos/{slug} existe, POST nao - o Symfony lanca
        // MethodNotAllowedHttpException nesse caso (nao NotFoundHttpException).
        $resposta = $this->postJson('/api/produtos/qualquer-coisa');

        $resposta->assertStatus(405);
        $resposta->assertJson(['tipo' => 'erro']);
    }
}
