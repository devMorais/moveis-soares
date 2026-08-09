import { Component, computed, inject, signal } from '@angular/core';
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

    isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

    itemInicio: ItemMenu = { rota: '/admin', label: 'Início', icone: 'fa-gauge', exato: true };

    dropdownConteudo: ItemDropdown = {
        label: 'Conteúdo',
        icone: 'fa-file-lines',
        itens: [
            { rota: '/admin/conteudo/inicio', label: 'Início', icone: 'fa-house' },
            { rota: '/admin/conteudo/sobre', label: 'Sobre', icone: 'fa-circle-info' },
            { rota: '/admin/conteudo/contato', label: 'Contato', icone: 'fa-envelope' },
        ],
    };

    itensPrincipais: ItemMenu[] = [
        { rota: '/admin/categorias', label: 'Categorias', icone: 'fa-tags' },
        { rota: '/admin/produtos', label: 'Produtos', icone: 'fa-couch' },
        { rota: '/admin/pedidos', label: 'Pedidos', icone: 'fa-box' },
    ];

    itemEntrega: ItemMenu = { rota: '/admin/entrega', label: 'Entrega', icone: 'fa-truck' };

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
