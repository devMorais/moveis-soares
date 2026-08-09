import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rotas com parametro dinamico (slug vindo do backend) nao podem ser
  // pre-renderizadas em build-time - o Angular nao tem como saber quais
  // categorias/produtos existem nesse momento. Renderizam sob demanda (SSR).
  {
    path: 'categoria/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'produto/:slug',
    renderMode: RenderMode.Server
  },
  // Pagina de acompanhamento de pedido - dado sensivel ao token, sempre
  // busca dado fresco no cliente, nunca deve ser pre-renderizada.
  {
    path: 'pedido/acompanhar/:token',
    renderMode: RenderMode.Client
  },
  // O painel /admin inteiro depende de estado de browser (token no
  // localStorage, guard de autenticacao) - nunca deve ser prerenderizado
  // nem passar por SSR, senao a primeira renderizacao nao sabe se o
  // usuario esta logado e a sessao "cai" ate a hidratacao terminar.
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
