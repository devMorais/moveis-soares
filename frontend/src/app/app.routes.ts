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
import { Secoes } from './features/admin/secoes/secoes';
import { Instagram } from './features/admin/instagram/instagram';
import { Entrega } from './features/admin/entrega/entrega';
import { Pedidos } from './features/admin/pedidos/pedidos';
import { NovoProduto } from './features/admin/produtos/novo-produto/novo-produto';
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
            { path: 'secoes', component: Secoes },
            { path: 'instagram', component: Instagram },
            { path: 'entrega', component: Entrega },
            { path: 'pedidos', component: Pedidos },
            { path: 'produtos/novo', component: NovoProduto },
        ],
    },
    { path: '**', redirectTo: '' },
];
