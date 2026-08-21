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
            // Imagem fica de fora de proposito - o texto ja e suficiente pra
            // publicar a secao, a foto e um complemento (MS-CONT-04).
            'obrigatorios' => ['titulo_historia', 'texto_historia', 'diferenciais'],
        ],
        'contato' => [
            'model' => SecaoContato::class,
            'campos' => ['telefone_display', 'telefone_whatsapp', 'email', 'endereco', 'horario'],
            'obrigatorios' => ['telefone_display', 'telefone_whatsapp', 'email', 'endereco', 'horario'],
        ],
        'institucional' => [
            'model' => SecaoInstitucional::class,
            'campos' => ['itens', 'resumo_titulo', 'resumo_texto'],
            // Bloco "Quem somos" e os 3 destaques da home aparecem direto pro
            // visitante - nao faz sentido salvar em branco (MS-CONT-04).
            'obrigatorios' => ['resumo_titulo', 'resumo_texto', 'itens'],
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

        // 'institucional' e 'sobre' sao editados em abas (Quem somos / Destaques /
        // Banner na mesma tela) e cada aba salva so os seus proprios campos - por
        // isso "obrigatorio" aqui e condicional ("sometimes"): so exige valor
        // quando o campo realmente vem no payload, pra nao bloquear o salvamento
        // de uma aba so porque outra aba (que nem foi tocada agora) esta vazia.
        // 'contato' fica de fora dessa regra porque e uma tela unica, sem abas.
        $condicional = $slug !== 'contato';

        $regras = collect($config['campos'])->mapWithKeys(function (string $campo) use ($config, $condicional) {
            $tipo = in_array($campo, ['diferenciais', 'itens'], true) ? 'array' : 'string';
            $obrigatorio = in_array($campo, $config['obrigatorios'], true);

            if (! $obrigatorio) {
                return [$campo => ['sometimes', 'nullable', $tipo]];
            }

            return [$campo => $condicional ? ['sometimes', 'required', $tipo] : ['required', $tipo]];
        })->all();

        if ($slug === 'institucional' && $request->has('itens')) {
            $regras['itens'][] = 'size:3';
            $regras['itens.*.titulo'] = ['required', 'string'];
            $regras['itens.*.texto'] = ['required', 'string'];
        }

        if ($slug === 'sobre' && $request->has('diferenciais')) {
            $regras['diferenciais'][] = 'size:4';
            $regras['diferenciais.*.titulo'] = ['required', 'string'];
            $regras['diferenciais.*.texto'] = ['required', 'string'];
        }

        if ($slug === 'contato') {
            $regras['email'] = ['required', 'email'];
        }

        $dados = $request->validate($regras);

        $model = $config['model']::first() ?? new ($config['model'])();
        $model->fill($dados);
        $model->save();

        return response()->json($model);
    }
}
