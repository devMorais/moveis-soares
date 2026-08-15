<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CidadeEntrega extends Model
{
    use HasFactory;

    protected $table = 'cidades_entrega';

    protected $fillable = [
        'nome_cidade',
        'uf',
        'valor_frete',
        'prazo_dias_estimado',
        'eh_retirada_local',
        'ativo',
    ];

    protected $casts = [
        'valor_frete' => 'decimal:2',
        'eh_retirada_local' => 'boolean',
        'ativo' => 'boolean',
    ];

    public function paraApi(): array
    {
        return [
            'id' => $this->id,
            'nomeCidade' => $this->nome_cidade,
            'uf' => $this->uf,
            'valorFrete' => (float) $this->valor_frete,
            'prazoDiasEstimado' => $this->prazo_dias_estimado,
            'ehRetiradaLocal' => $this->eh_retirada_local,
        ];
    }
}
