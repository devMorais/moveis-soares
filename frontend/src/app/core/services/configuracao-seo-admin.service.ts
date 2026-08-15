import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConfiguracaoSeo {
    logoUrl: string | null;
    produtosPorPagina: number;
    tituloSite: string | null;
    tituloPadrao: string | null;
    descricaoPadrao: string | null;
    palavrasChave: string | null;
    ogImageUrl: string | null;
    faviconUrl: string | null;
    googleAnalyticsId: string | null;
    googleSearchConsoleTag: string | null;
    indexarSite: boolean;
}

export interface DadosConfiguracaoSeo {
    logo_url?: string | null;
    produtos_por_pagina?: number;
    seo_titulo_site?: string | null;
    seo_titulo_padrao?: string | null;
    seo_descricao_padrao?: string | null;
    seo_palavras_chave?: string | null;
    seo_og_image_url?: string | null;
    seo_favicon_url?: string | null;
    seo_google_analytics_id?: string | null;
    seo_google_search_console_tag?: string | null;
    seo_indexar_site?: boolean;
}

export interface ConfiguracaoNotificacoes {
    notificacaoEmail: string | null;
    notificacaoWhatsapp: string | null;
}

export interface DadosConfiguracaoNotificacoes {
    notificacao_email?: string | null;
    notificacao_whatsapp?: string | null;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracaoSeoAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/configuracoes/seo`;
    private baseUrlNotificacoes = `${environment.apiUrl}/admin/configuracoes/notificacoes`;

    mostrar() {
        return this.http.get<ConfiguracaoSeo>(this.baseUrl);
    }

    atualizar(dados: DadosConfiguracaoSeo) {
        return this.http.put<ConfiguracaoSeo>(this.baseUrl, dados);
    }

    mostrarNotificacoes() {
        return this.http.get<ConfiguracaoNotificacoes>(this.baseUrlNotificacoes);
    }

    atualizarNotificacoes(dados: DadosConfiguracaoNotificacoes) {
        return this.http.put<ConfiguracaoNotificacoes>(this.baseUrlNotificacoes, dados);
    }
}
