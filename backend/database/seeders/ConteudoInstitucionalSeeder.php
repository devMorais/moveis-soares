<?php

namespace Database\Seeders;

use App\Models\SecaoContato;
use App\Models\SecaoCta;
use App\Models\SecaoInstitucional;
use App\Models\SecaoSobre;
use Illuminate\Database\Seeder;

/**
 * Popula o conteudo institucional com os mesmos textos que estavam
 * hardcoded no frontend antes desta secao virar administravel - assim a
 * migracao pra conteudo dinamico nao muda nada visualmente ate o cliente
 * editar pelo painel. Idempotente (updateOrCreate).
 */
class ConteudoInstitucionalSeeder extends Seeder
{
    public function run(): void
    {
        SecaoSobre::updateOrCreate([], [
            'titulo_historia' => 'Nossa história',
            'texto_historia' => "A Móveis Soares nasceu do compromisso de oferecer móveis de qualidade com preço que cabe no bolso das famílias. Do escritório ao quarto, da sala à cozinha, cada peça é escolhida pensando em durabilidade e acabamento.\n\nAcompanhamos as novidades do mercado pra trazer sempre opções atuais, sem abrir mão da qualidade que o cliente vê e sente assim que o móvel chega em casa.",
            'diferenciais' => [
                ['titulo' => 'Qualidade que você vê', 'texto' => 'Acabamento cuidadoso e materiais resistentes em cada peça do catálogo.'],
                ['titulo' => 'Preço justo', 'texto' => 'Móveis bonitos e duráveis sem pesar no orçamento da sua casa.'],
                ['titulo' => 'Entrega combinada com você', 'texto' => 'Alinhamos prazo e forma de entrega direto com o cliente, sem surpresas.'],
                ['titulo' => 'Atendimento próximo', 'texto' => 'Tiramos suas dúvidas pelo WhatsApp antes, durante e depois da compra.'],
            ],
        ]);

        SecaoContato::updateOrCreate([], [
            'telefone_display' => '(61) 99999-9999',
            'telefone_whatsapp' => '5561999999999',
            'email' => 'contato@moveissoares.com.br',
            'endereco' => 'Brasília, DF',
            'horario' => 'Seg. a Sáb., 9h às 18h',
        ]);

        SecaoInstitucional::updateOrCreate([], [
            'itens' => [
                ['titulo' => 'Entrega combinada com você', 'texto' => 'Alinhamos prazo e forma de entrega direto com o cliente, sem surpresas.'],
                ['titulo' => 'Qualidade que você vê', 'texto' => 'Acabamento cuidadoso e materiais resistentes em cada peça do catálogo.'],
                ['titulo' => 'Atendimento próximo', 'texto' => 'Tiramos suas dúvidas pelo WhatsApp antes, durante e depois da compra.'],
            ],
            'resumo_titulo' => 'Quem somos',
            'resumo_texto' => 'A Móveis Soares monta cada ambiente da sua casa com móveis de qualidade e acabamento pensado pra durar — do escritório à sala, do quarto à cozinha.',
        ]);

        SecaoCta::updateOrCreate(['chave' => 'home'], [
            'titulo' => 'Pronto pra renovar sua casa?',
            'texto' => 'Fale agora com a nossa equipe e tire suas dúvidas sobre entrega e formas de pagamento.',
        ]);

        SecaoCta::updateOrCreate(['chave' => 'sobre'], [
            'titulo' => 'Vamos renovar sua casa?',
            'texto' => 'Entre em contato e converse com a nossa equipe sobre o móvel ideal pra você.',
        ]);
    }
}
