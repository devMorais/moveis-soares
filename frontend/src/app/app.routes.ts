import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Sobre } from './features/sobre/sobre';
import { Contato } from './features/contato/contato';
import { Categoria } from './features/categoria/categoria';
import { Produto } from './features/produto/produto';
import { Checkout } from './features/checkout/checkout';
import { PedidoRetorno } from './features/pedido-retorno/pedido-retorno';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sobre', component: Sobre },
    { path: 'contato', component: Contato },
    { path: 'categoria/:slug', component: Categoria },
    { path: 'produto/:slug', component: Produto },
    { path: 'checkout', component: Checkout },
    { path: 'checkout/retorno', component: PedidoRetorno },
    {
        path: 'admin/login',
        loadComponent: () => import('./features/admin/login/login').then((m) => m.Login),
    },
    {
        path: 'admin',
        loadComponent: () => import('./layout/admin-layout/admin-layout').then((m) => m.AdminLayout),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
            },
            {
                path: 'conteudo',
                loadComponent: () => import('./features/admin/conteudo/conteudo').then((m) => m.Conteudo),
            },
            {
                path: 'instagram',
                loadComponent: () => import('./features/admin/instagram/instagram').then((m) => m.Instagram),
            },
            {
                path: 'categorias',
                loadComponent: () => import('./features/admin/categorias/categorias').then((m) => m.Categorias),
            },
            {
                path: 'produtos',
                loadComponent: () => import('./features/admin/produtos/produtos').then((m) => m.Produtos),
            },
            {
                path: 'produtos/novo',
                loadComponent: () => import('./features/admin/produtos/produto-form/produto-form').then((m) => m.ProdutoForm),
            },
            {
                path: 'produtos/:id/editar',
                loadComponent: () => import('./features/admin/produtos/produto-form/produto-form').then((m) => m.ProdutoForm),
            },
            {
                path: 'entrega',
                loadComponent: () => import('./features/admin/entrega/entrega').then((m) => m.Entrega),
            },
            {
                path: 'pedidos',
                loadComponent: () => import('./features/admin/pedidos/pedidos').then((m) => m.Pedidos),
            },
            {
                path: 'configuracoes',
                loadComponent: () => import('./features/admin/configuracoes/configuracoes').then((m) => m.Configuracoes),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
