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

## Resultados do Lighthouse (preencher após medir)

Passo a passo pra medir: abrir o site (local ou produção) no Chrome, F12 → aba **Lighthouse** → categoria **Performance**, dispositivo **Mobile** → Analyze page load.

| Página | Performance ANTES | Performance DEPOIS | Observações |
|---|---|---|---|
| Home | — | — | |
| Categoria | — | — | |
| Produto | — | — | |

## Teste manual de rolagem/interação (preencher após testar)

Testar em 2 tamanhos via DevTools (ícone de celular/tablet no topo do DevTools → escolher um dispositivo pequeno tipo "iPhone SE" e um médio tipo "Pixel 7"):
- [ ] Rolagem da página fluida, sem travar
- [ ] Menu mobile abre/fecha sem travar
- [ ] Carrossel da home troca de slide sem travar
- [ ] Carrinho lateral abre/fecha e os botões de quantidade respondem bem ao toque
