import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ModulosService } from '../../core/services/modulos.service';
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
export class AdminLayout implements OnInit {
    auth = inject(AuthService);
    private modulos = inject(ModulosService);

    isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

    /** Modulos desligados somem do menu em vez de levar a uma tela sem uso. */
    vendasOnlineHabilitado = computed(() => this.modulos.estaHabilitado('vendas_online', true));
    instagramHabilitado = computed(() => this.modulos.estaHabilitado('instagram'));

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

    itensPrincipaisVisiveis = computed(() =>
        this.itensPrincipais.filter(
            (item) => item.rota !== '/admin/pedidos' || this.vendasOnlineHabilitado(),
        ),
    );

    itemEntrega: ItemMenu = { rota: '/admin/entrega', label: 'Entrega', icone: 'fa-truck' };
    itemSecoes: ItemMenu = { rota: '/admin/secoes', label: 'Seções', icone: 'fa-eye' };

    itemInstagram: ItemMenu = { rota: '/admin/instagram', label: 'Instagram', icone: 'fa-camera' };
    itemConfiguracoes: ItemMenu = { rota: '/admin/configuracoes', label: 'Configurações', icone: 'fa-gear' };

    dropdownAberto = signal(false);

    ngOnInit(): void {
        this.modulos.carregar();
    }

    alternarDropdown(): void {
        this.dropdownAberto.update((atual) => !atual);
    }

    sair(): void {
        this.auth.logout();
    }
}
