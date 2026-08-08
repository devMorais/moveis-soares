<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecaoContato;
use App\Models\SecaoHero;
use App\Models\SecaoSobre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ConteudoController extends Controller
{
    /**
     * Cada secao institucional guarda uma unica linha de configuracao
     * (nao e uma lista). Mapear slug -> Model + campos aceitos evita um
     * Controller por secao.
     */
    private const SECOES = [
        'hero' => [
            'model' => SecaoHero::class,
            'campos' => ['titulo', 'subtitulo'],
        ],
        'sobre' => [
            'model' => SecaoSobre::class,
            'campos' => ['titulo_historia', 'texto_historia', 'imagem_url'],
        ],
        'contato' => [
            'model' => SecaoContato::class,
            'campos' => ['telefone_display', 'telefone_whatsapp', 'email', 'endereco', 'horario'],
        ],
    ];

    public function mostrar(string $slug): JsonResponse
    {
        $config = self::SECOES[$slug] ?? throw new NotFoundHttpException("Seção '{$slug}' não existe.");

        return response()->json($config['model']::first());
    }

    public function atualizar(string $slug, Request $request): JsonResponse
    {
        $config = self::SECOES[$slug] ?? throw new NotFoundHttpException("Seção '{$slug}' não existe.");

        $dados = $request->validate(
            collect($config['campos'])->mapWithKeys(fn (string $campo) => [$campo => ['sometimes', 'nullable', 'string']])->all()
        );

        $model = $config['model']::first() ?? new ($config['model'])();
        $model->fill($dados);
        $model->save();

        return response()->json($model);
    }
}
