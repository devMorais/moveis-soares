<h2>Nova mensagem recebida pelo site</h2>

<p><strong>Nome:</strong> {{ $mensagem->nome }}</p>
<p><strong>Telefone:</strong> {{ $mensagem->telefone }}</p>
@if($mensagem->email)
<p><strong>E-mail:</strong> {{ $mensagem->email }}</p>
@endif
<p><strong>Mensagem:</strong></p>
<p>{{ $mensagem->mensagem }}</p>
