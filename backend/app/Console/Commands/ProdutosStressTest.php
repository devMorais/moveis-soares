<?php

namespace App\Console\Commands;

use App\Models\Categoria;
use App\Models\Produto;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Popula o catalogo com um volume grande de produtos ficticios (todos
 * reaproveitando a MESMA imagem ja existente, sem passar pelo
 * ImagemService) so pra demonstrar/medir a performance do site em
 * escala - reversivel de ponta a ponta com um comando so.
 *
 * php artisan produtos:stress-test 40000     -- popula
 * php artisan produtos:stress-test --reverter -- desfaz, volta ao estado de antes
 */
class ProdutosStressTest extends Command
{
    protected $signature = 'produtos:stress-test {quantidade=40000} {--reverter}';

    protected $description = 'Popula o catalogo com produtos ficticios em massa pra teste de performance (reversivel)';

    private const ARQUIVO_MARCADOR = 'stress_test_boundary.txt';

    private const TIPOS = [
        'Guarda-Roupa', 'Comoda', 'Criado-Mudo', 'Cama Box', 'Cabeceira',
        'Sofa', 'Rack para TV', 'Mesa de Centro', 'Estante', 'Poltrona',
        'Mesa de Escritorio', 'Cadeira Giratoria', 'Estante de Livros', 'Armario de Escritorio',
        'Mesa de Jantar', 'Cadeira de Cozinha', 'Balcao', 'Buffet', 'Aparador',
    ];

    private const ACABAMENTOS = [
        'Off-White', 'Amendoa', 'Nogal', 'Carvalho', 'Preto', 'Branco',
        'Rustico', 'Glossy', 'Rose', 'Verde Agua', 'Cinza', 'Madeira Clara',
    ];

    private const COMPLEMENTOS = [
        '2 Portas', '3 Portas', '4 Portas', '6 Portas', '2 Gavetas', '3 Gavetas',
        'Curvo', 'Minimalista', 'Classico', 'Moderno', null, null,
    ];

    public function handle(): int
    {
        if ($this->option('reverter')) {
            return $this->reverter();
        }

        return $this->popular((int) $this->argument('quantidade'));
    }

    private function caminhoMarcador(): string
    {
        return storage_path('app/' . self::ARQUIVO_MARCADOR);
    }

    private function popular(int $quantidade): int
    {
        if (file_exists($this->caminhoMarcador())) {
            $this->error('Ja existe um teste de carga ativo (arquivo ' . self::ARQUIVO_MARCADOR . ' encontrado).');
            $this->error('Rode com --reverter primeiro antes de popular de novo, pra nao perder o ponto de retorno original.');

            return self::FAILURE;
        }

        $categorias = Categoria::pluck('id');

        if ($categorias->isEmpty()) {
            $this->error('Nenhuma categoria encontrada - cadastre pelo menos uma categoria antes.');

            return self::FAILURE;
        }

        $produtoComImagem = Produto::whereNotNull('imagem_url')->first();

        if (! $produtoComImagem) {
            $this->error('Nenhum produto com imagem encontrado pra reaproveitar - precisa de pelo menos 1 produto real cadastrado.');

            return self::FAILURE;
        }

        $imagemCompartilhada = $produtoComImagem->imagem_url;

        $boundaryId = (int) (Produto::max('id') ?? 0);
        file_put_contents($this->caminhoMarcador(), (string) $boundaryId);

        $this->info("Ponto de retorno salvo: produtos com id > {$boundaryId} serao considerados 'do teste de carga'.");
        $this->info("Imagem reaproveitada em todos os {$quantidade} produtos: {$imagemCompartilhada}");

        $inicio = microtime(true);
        $tamanhoLote = 2000;
        $criados = 0;

        $barra = $this->output->createProgressBar($quantidade);
        $barra->start();

        while ($criados < $quantidade) {
            $nesteLote = min($tamanhoLote, $quantidade - $criados);
            $lote = [];

            for ($i = 0; $i < $nesteLote; $i++) {
                $numero = $boundaryId + $criados + $i + 1;
                $tipo = fake()->randomElement(self::TIPOS);
                $acabamento = fake()->randomElement(self::ACABAMENTOS);
                $complemento = fake()->randomElement(self::COMPLEMENTOS);

                $nome = trim("{$tipo} {$acabamento} " . ($complemento ?? ''));
                $preco = fake()->randomFloat(2, 199, 4999);
                $temOferta = fake()->boolean(25);

                $lote[] = [
                    'categoria_id' => $categorias->random(),
                    'nome' => $nome,
                    'slug' => Str::slug($nome) . '-carga-' . $numero,
                    'preco' => $preco,
                    'preco_de' => $temOferta ? round($preco * 1.2, 2) : null,
                    'imagem_url' => $imagemCompartilhada,
                    'imagens' => json_encode([]),
                    'especificacao' => $complemento,
                    'descricao' => null,
                    'altura_cm' => fake()->numberBetween(40, 220),
                    'largura_cm' => fake()->numberBetween(40, 300),
                    'profundidade_cm' => fake()->numberBetween(30, 100),
                    'selo' => null,
                    'estoque' => fake()->numberBetween(0, 50),
                    'ativo' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            DB::table('produtos')->insert($lote);
            $criados += $nesteLote;
            $barra->advance($nesteLote);
        }

        $barra->finish();
        $this->newLine(2);

        $duracao = round(microtime(true) - $inicio, 1);
        $this->info("Pronto: {$criados} produtos criados em {$duracao}s.");
        $this->info('Total de produtos ativos agora: ' . Produto::ativos()->count());
        $this->warn('Pra voltar ao estado original: php artisan produtos:stress-test --reverter');

        return self::SUCCESS;
    }

    private function reverter(): int
    {
        if (! file_exists($this->caminhoMarcador())) {
            $this->error('Nenhum teste de carga ativo encontrado (arquivo ' . self::ARQUIVO_MARCADOR . ' nao existe) - nada pra reverter.');

            return self::FAILURE;
        }

        $boundaryId = (int) file_get_contents($this->caminhoMarcador());

        $this->info("Removendo todos os produtos com id > {$boundaryId}...");

        $inicio = microtime(true);
        $removidos = DB::table('produtos')->where('id', '>', $boundaryId)->delete();
        $duracao = round(microtime(true) - $inicio, 1);

        unlink($this->caminhoMarcador());

        $this->info("Pronto: {$removidos} produtos removidos em {$duracao}s.");
        $this->info('Total de produtos ativos agora: ' . Produto::ativos()->count());

        return self::SUCCESS;
    }
}
