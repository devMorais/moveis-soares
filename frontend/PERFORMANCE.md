# Performance mobile — MS-QA-XX

Auditoria de performance mobile (Home, Categoria, Produto). Este documento junta as correções de código já aplicadas com os resultados medidos no Lighthouse (Chrome DevTools).

## Correções de código aplicadas

### 1. Lazy loading de imagens
Todas as imagens fora da primeira dobra ganharam `loading="lazy"`:
- Home: cards de categoria ("Compre por ambiente"), grid do catálogo (já tinha).
- Produto: miniaturas da galeria (a foto principal continua carregando na hora — `fetchpriority="high"`).
- Carrinho lateral, rodapé, acompanhamento de pedido.

A primeira foto do carrossel da home (`hero-carrossel`) continua carregando **eager** (com `fetchpriority="high"`) porque normalmente é o elemento de maior conteúdo visível (LCP) da página — atrasar ela pioraria a pontuação em vez de melhorar.

### 2. Layout shift (CLS)
Conferido `home.scss`, `categoria.scss` e `produto.scss`: todos os containers de imagem já reservavam o espaço antes de carregar (via `aspect-ratio` ou dimensões fixas) — nenhuma mudança necessária aqui, o código já seguia essa prática.

### 3. Área de toque mínima (44x44px)
Corrigidos elementos abaixo do mínimo recomendado:
- `.btn-menu` e `.btn-carrinho` (navbar): 42px → 44px.
- `.quantidade button` (página de produto): 24px → 44px.
- `.carrinho-fechar` (fechar carrinho): sem tamanho definido → 44px (com margem negativa pra não alterar o visual).
- `.carrinho-item__quantidade button` e `.carrinho-item__remover` (dentro do carrinho): 18px → 32px — não deu pra chegar em 44px sem quebrar o layout compacto da linha do item, mas já é uma melhora considerável. Se continuar sendo um problema no teste real do dedo, vale revisar o layout da linha do carrinho num card à parte.

### 4. `width`/`height` explícito nas imagens
O Lighthouse aponta isso separado do CSS `aspect-ratio` (que o projeto já usava) — adicionado `width="800" height="800"` nas fotos de produto/categoria (todas quadradas, processadas pelo `ImagemService`) e `width="1024" height="1024"` na logo, em Home, Categoria, Produto, navbar, rodapé, carrinho lateral e acompanhamento de pedido.

### 5. Pendente pra depois (não resolvido agora)
- **"Improve image delivery" (~212 KiB no Lighthouse)**: as fotos são servidas sempre em 800x800, mesmo em cards pequenos que mostram bem menos que isso. Resolver direito precisa gerar mais de um tamanho por imagem no upload (srcset) — mudança de backend, não só de template.
- **CSS não usado do Font Awesome (~89 KiB)**: o projeto importa o pacote de ícones inteiro (`all.min.css`) mas usa uns 50 ícones only. Testei: dividir em arquivos separados (solid/brands/regular) não ajuda muito, porque o mapeamento de nome pro glifo de cada ícone fica todo junto num arquivo base que carrega de qualquer jeito. Precisa de um subset de verdade (ferramenta `fontawesome-subset` ou trocar os ~50 ícones usados por SVG inline) — não fiz agora por ser mais arriscado de quebrar ícone em produção sem dar tempo de testar direito.

## Resultados do Lighthouse

**Importante sobre como medir isso direito:** não dá pra confiar na nota do Lighthouse rodada em `ng serve` (localhost:4200, modo desenvolvimento) — o código ali nunca é minificado/otimizado, então a nota fica sempre baixa (30-50) independente de qualquer correção de HTML/CSS, porque o que mais pesa nesse modo é o JavaScript não otimizado, não as imagens/layout. Testei também um build de produção rodando localmente, mas nesse dia a API de produção (moveissoares.dolen.com.br) estava respondendo devagar, o que também distorceu o número (media mais a lentidão do servidor do que o código do site).

**Medida real e confiável**: rodar o Lighthouse direto em produção (moveissoares.dolen.com.br) depois que este PR for aceito e o Fernando fizer o deploy, num horário em que o servidor esteja respondendo normal. Só assim o número reflete o que o visitante de verdade sente.

| Página | Performance ANTES (dev, referência) | Performance DEPOIS (dev, referência) | Performance em produção (preencher após deploy) |
|---|---|---|---|
| Home | 48 | 60 | — |
| Categoria | 39 / 19 | 47 / 20 | — |
| Produto | — | — | — |

## Teste manual de rolagem/interação (preencher após testar)

Testar em 2 tamanhos via DevTools (ícone de celular/tablet no topo do DevTools → escolher um dispositivo pequeno tipo "iPhone SE" e um médio tipo "Pixel 7"):
- [ ] Rolagem da página fluida, sem travar
- [ ] Menu mobile abre/fecha sem travar
- [ ] Carrossel da home troca de slide sem travar
- [ ] Carrinho lateral abre/fecha e os botões de quantidade respondem bem ao toque
