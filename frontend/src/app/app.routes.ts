import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Sobre } from './features/sobre/sobre';
import { Contato } from './features/contato/contato';
import { Categoria } from './features/categoria/categoria';
import { NovoProduto } from './features/admin/produtos/novo-produto/novo-produto';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sobre', component: Sobre },
    { path: 'contato', component: Contato },
    { path: 'categoria/:slug', component: Categoria },
    { path: 'admin/produtos/novo', component: NovoProduto },
    { path: '**', redirectTo: '' },
];
