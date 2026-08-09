import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Lightbox } from '../../shared/components/lightbox/lightbox';

interface ItemMenu {
    rota: string;
    label: string;
    icone: string;
    exato?: boolean;
    queryParams?: Record<string, string>;
}

interface ItemDropdown {
    label: string;
    icone: string;
    itens: ItemMenu[];
}

@Component({
    selector: 'app-admin-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet, Lightbox],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.scss',
})
export class AdminLayout {
    auth = inject(AuthService);

    itemInicio: ItemMenu = { rota: '/admin', label: 'Início', icone: 'fa-gauge', exato: true };

    dropdownConteudo: ItemDropdown = {
        label: 'Conteúdo',
        icone: 'fa-file-lines',
        itens: [
            { rota: '/admin/conteudo', label: 'Início', icone: 'fa-house', queryParams: { aba: 'inicio' } },
            { rota: '/admin/conteudo', label: 'Sobre', icone: 'fa-circle-info', queryParams: { aba: 'sobre' } },
            { rota: '/admin/conteudo', label: 'Contato', icone: 'fa-envelope', queryParams: { aba: 'contato' } },
        ],
    };

    itensPrincipais: ItemMenu[] = [
        { rota: '/admin/categorias', label: 'Categorias', icone: 'fa-tags' },
        { rota: '/admin/produtos', label: 'Produtos', icone: 'fa-couch' },
        { rota: '/admin/entrega', label: 'Entrega', icone: 'fa-truck' },
        { rota: '/admin/pedidos', label: 'Pedidos', icone: 'fa-box' },
    ];

    itemInstagram: ItemMenu = { rota: '/admin/instagram', label: 'Instagram', icone: 'fa-camera' };
    itemConfiguracoes: ItemMenu = { rota: '/admin/configuracoes', label: 'Configurações', icone: 'fa-gear' };

    dropdownAberto = signal(false);

    alternarDropdown(): void {
        this.dropdownAberto.update((atual) => !atual);
    }

    sair(): void {
        this.auth.logout();
    }
}
