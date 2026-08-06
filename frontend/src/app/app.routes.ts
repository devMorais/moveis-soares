import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Sobre } from './features/sobre/sobre';
import { Contato } from './features/contato/contato';
import { NovoProduto } from './features/admin/produtos/novo-produto/novo-produto';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'sobre', component: Sobre },
    { path: 'contato', component: Contato },
    { path: 'admin/produtos/novo', component: NovoProduto },
    { path: '**', redirectTo: '' },
];
