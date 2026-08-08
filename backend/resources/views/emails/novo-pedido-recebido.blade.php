<h2>Novo pedido #{{ $pedido->id }} recebido</h2>

<p><strong>Cliente:</strong> {{ $pedido->nome_cliente }}</p>
<p><strong>Telefone:</strong> {{ $pedido->telefone_cliente }}</p>
<p><strong>Endereço:</strong> {{ $pedido->endereco }}</p>
<p><strong>Cidade:</strong> {{ $pedido->cidadeEntrega?->nome_cidade ?? $pedido->cidade_texto_livre }}</p>

@if($pedido->frete_a_combinar)
<p><strong>Frete:</strong> A combinar com o cliente</p>
@else
<p><strong>Frete:</strong> R$ {{ number_format($pedido->valor_frete, 2, ',', '.') }}</p>
@endif

<p><strong>Itens:</strong></p>
<ul>
@foreach($pedido->itens as $item)
<li>{{ $item->quantidade }}x {{ $item->nome_produto }} - R$ {{ number_format($item->preco_unitario, 2, ',', '.') }}</li>
@endforeach
</ul>

<p><strong>Total:</strong> R$ {{ number_format($pedido->valor_total, 2, ',', '.') }}</p>
<p><strong>Status do pagamento:</strong> {{ $pedido->status }}</p>
