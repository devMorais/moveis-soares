import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Sobre } from './features/sobre/sobre';
import { Contato } from './features/contato/contato';
import { Categoria } from './features/categoria/categoria';
import { Produto } from './features/produto/produto';
import { Checkout } from './features/checkout/checkout';
import { PedidoRetorno } from './features/pedido-retorno/pedido-retorno';
import { PedidoAcompanhar } from './features/pedido-acompanhar/pedido-acompanhar';
import { Ajuda } from './features/ajuda/ajuda';
import { authGuard } from './core/guards/auth.guard';
import { adminOnlyGuard } from './core/guards/admin-only.guard';
import { secaoVisivelGuard } from './core/guards/secao-visivel.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sobre', component: Sobre, canActivate: [secaoVisivelGuard('sobre')] },
    { path: 'contato', component: Contato, canActivate: [secaoVisivelGuard('contato')] },
    { path: 'categoria/:slug', component: Categoria },
    { path: 'produto/:slug', component: Produto },
    { path: 'checkout', component: Checkout },
    { path: 'checkout/retorno', component: PedidoRetorno },
    { path: 'pedido/acompanhar/:token', component: PedidoAcompanhar },
    { path: 'ajuda', component: Ajuda },
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
                path: 'conteudo/inicio',
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/conteudo/inicio/conteudo-inicio').then((m) => m.ConteudoInicio),
            },
            {
                path: 'conteudo/sobre',
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/conteudo/sobre/conteudo-sobre').then((m) => m.ConteudoSobre),
            },
            {
                path: 'conteudo/contato',
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/conteudo/contato/conteudo-contato').then((m) => m.ConteudoContato),
            },
            { path: 'conteudo', redirectTo: 'conteudo/inicio' },
            {
                path: 'secoes',
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/secoes/secoes').then((m) => m.Secoes),
            },
            {
                path: 'instagram',
                canActivate: [adminOnlyGuard],
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
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/entrega/entrega').then((m) => m.Entrega),
            },
            {
                path: 'pedidos',
                loadComponent: () => import('./features/admin/pedidos/pedidos').then((m) => m.Pedidos),
            },
            {
                path: 'configuracoes',
                canActivate: [adminOnlyGuard],
                loadComponent: () => import('./features/admin/configuracoes/configuracoes').then((m) => m.Configuracoes),
            },
        ],
    },
    { path: '**', redirectTo: '' },
];
