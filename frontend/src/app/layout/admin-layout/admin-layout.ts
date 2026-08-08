import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ItemMenu {
    rota: string;
    label: string;
    icone: string;
    exato?: boolean;
}

@Component({
    selector: 'app-admin-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.scss',
})
export class AdminLayout {
    auth = inject(AuthService);

    itens: ItemMenu[] = [
        { rota: '/admin', label: 'Início', icone: 'fa-gauge', exato: true },
        { rota: '/admin/conteudo', label: 'Conteúdo', icone: 'fa-file-lines' },
        { rota: '/admin/secoes', label: 'Seções', icone: 'fa-toggle-on' },
        { rota: '/admin/instagram', label: 'Instagram', icone: 'fa-camera' },
        { rota: '/admin/categorias', label: 'Categorias', icone: 'fa-tags' },
        { rota: '/admin/produtos', label: 'Produtos', icone: 'fa-couch' },
        { rota: '/admin/entrega', label: 'Entrega', icone: 'fa-truck' },
        { rota: '/admin/pedidos', label: 'Pedidos', icone: 'fa-box' },
        { rota: '/admin/configuracoes', label: 'Configurações', icone: 'fa-gear' },
    ];

    sair(): void {
        this.auth.logout();
    }
}
