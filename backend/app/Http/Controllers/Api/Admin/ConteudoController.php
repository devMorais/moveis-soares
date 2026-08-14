<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SecaoContato;
use App\Models\SecaoInstitucional;
use App\Models\SecaoSobre;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ConteudoController extends Controller
{
    /**
     * Cada secao institucional guarda uma unica linha de configuracao
     * (nao e uma lista). Mapear slug -> Model + campos aceitos evita um
     * Controller por secao. 'cta' fica de fora (tem uma linha por chave,
     * tratado em ConteudoCtaController).
     */
    private const SECOES = [
        'sobre' => [
            'model' => SecaoSobre::class,
            'campos' => ['titulo_historia', 'texto_historia', 'imagem_url', 'diferenciais'],
        ],
        'contato' => [
            'model' => SecaoContato::class,
            'campos' => ['telefone_display', 'telefone_whatsapp', 'email', 'endereco', 'horario'],
        ],
        'institucional' => [
            'model' => SecaoInstitucional::class,
            'campos' => ['itens', 'resumo_titulo', 'resumo_texto'],
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

        $regras = collect($config['campos'])->mapWithKeys(function (string $campo) {
            $tipo = in_array($campo, ['diferenciais', 'itens'], true) ? 'array' : 'string';

            return [$campo => ['sometimes', 'nullable', $tipo]];
        })->all();

        $dados = $request->validate($regras);

        $model = $config['model']::first() ?? new ($config['model'])();
        $model->fill($dados);
        $model->save();

        return response()->json($model);
    }
}
