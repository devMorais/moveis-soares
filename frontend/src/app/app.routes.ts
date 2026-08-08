import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Sobre } from './features/sobre/sobre';
import { Contato } from './features/contato/contato';
import { Categoria } from './features/categoria/categoria';
import { Produto } from './features/produto/produto';
import { Checkout } from './features/checkout/checkout';
import { PedidoRetorno } from './features/pedido-retorno/pedido-retorno';
import { Login } from './features/admin/login/login';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { Conteudo } from './features/admin/conteudo/conteudo';
import { Instagram } from './features/admin/instagram/instagram';
import { Categorias } from './features/admin/categorias/categorias';
import { Produtos } from './features/admin/produtos/produtos';
import { ProdutoForm } from './features/admin/produtos/produto-form/produto-form';
import { Entrega } from './features/admin/entrega/entrega';
import { Pedidos } from './features/admin/pedidos/pedidos';
import { Configuracoes } from './features/admin/configuracoes/configuracoes';
import { AdminLayout } from './layout/admin-layout/admin-layout';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sobre', component: Sobre },
    { path: 'contato', component: Contato },
    { path: 'categoria/:slug', component: Categoria },
    { path: 'produto/:slug', component: Produto },
    { path: 'checkout', component: Checkout },
    { path: 'checkout/retorno', component: PedidoRetorno },
    { path: 'admin/login', component: Login },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: Dashboard },
            { path: 'conteudo', component: Conteudo },
            { path: 'instagram', component: Instagram },
            { path: 'categorias', component: Categorias },
            { path: 'produtos', component: Produtos },
            { path: 'produtos/novo', component: ProdutoForm },
            { path: 'produtos/:id/editar', component: ProdutoForm },
            { path: 'entrega', component: Entrega },
            { path: 'pedidos', component: Pedidos },
            { path: 'configuracoes', component: Configuracoes },
        ],
    },
    { path: '**', redirectTo: '' },
];
