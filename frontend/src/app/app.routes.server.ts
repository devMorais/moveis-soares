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
  {
    path: 'admin/produtos/:id/editar',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
