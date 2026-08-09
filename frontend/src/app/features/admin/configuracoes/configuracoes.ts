import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ConfiguracaoSeoAdminService } from '../../../core/services/configuracao-seo-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../environments/environment';

type Aba = 'notificacoes' | 'identidade' | 'compartilhamento' | 'rastreamento';

const NOMES_ABA: Record<Aba, string> = {
    notificacoes: 'Notificações',
    identidade: 'Identidade e SEO',
    compartilhamento: 'Compartilhamento',
    rastreamento: 'Rastreamento',
};

@Component({
    selector: 'app-admin-configuracoes',
    imports: [ReactiveFormsModule, UploadImagem],
    templateUrl: './configuracoes.html',
    styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
    private fb = inject(FormBuilder);
    private seoService = inject(ConfiguracaoSeoAdminService);
    private toast = inject(ToastService);

    uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;
    nomesAba = NOMES_ABA;
    abasDisponiveis: Aba[] = ['notificacoes', 'identidade', 'compartilhamento', 'rastreamento'];
    abaAtiva = signal<Aba>('notificacoes');

    carregando = signal(true);
    salvando = signal(false);
    salvandoNotificacoes = signal(false);

    form = this.fb.nonNullable.group({
        seo_titulo_site: [''],
        seo_titulo_padrao: [''],
        seo_descricao_padrao: [''],
        seo_palavras_chave: [''],
        seo_og_image_url: [''],
        seo_favicon_url: [''],
        seo_google_analytics_id: [''],
        seo_google_search_console_tag: [''],
        seo_indexar_site: [true],
    });

    formNotificacoes = this.fb.nonNullable.group({
        notificacao_email: [''],
        notificacao_whatsapp: [''],
    });

    ngOnInit(): void {
        this.seoService.mostrar().subscribe({
            next: (dados) => {
                this.form.patchValue({
                    seo_titulo_site: dados.tituloSite ?? '',
                    seo_titulo_padrao: dados.tituloPadrao ?? '',
                    seo_descricao_padrao: dados.descricaoPadrao ?? '',
                    seo_palavras_chave: dados.palavrasChave ?? '',
                    seo_og_image_url: dados.ogImageUrl ?? '',
                    seo_favicon_url: dados.faviconUrl ?? '',
                    seo_google_analytics_id: dados.googleAnalyticsId ?? '',
                    seo_google_search_console_tag: dados.googleSearchConsoleTag ?? '',
                    seo_indexar_site: dados.indexarSite,
                });
                this.carregando.set(false);
            },
            error: () => {
                this.carregando.set(false);
                this.toast.erro('Não foi possível carregar as configurações de SEO salvas.');
            },
        });

        this.seoService.mostrarNotificacoes().subscribe({
            next: (dados) => {
                this.formNotificacoes.patchValue({
                    notificacao_email: dados.notificacaoEmail ?? '',
                    notificacao_whatsapp: dados.notificacaoWhatsapp ?? '',
                });
            },
            error: () => this.toast.erro('Não foi possível carregar as notificações salvas.'),
        });
    }

    trocarAba(aba: Aba): void {
        this.abaAtiva.set(aba);
    }

    aoDefinirOgImage(url: string): void {
        this.form.patchValue({ seo_og_image_url: url });
    }

    aoDefinirFavicon(url: string): void {
        this.form.patchValue({ seo_favicon_url: url });
    }

    salvar(): void {
        this.salvando.set(true);

        this.seoService.atualizar(this.form.getRawValue()).subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso('Configurações de SEO salvas.');
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar as configurações.');
            },
        });
    }

    salvarNotificacoes(): void {
        this.salvandoNotificacoes.set(true);

        this.seoService.atualizarNotificacoes(this.formNotificacoes.getRawValue()).subscribe({
            next: () => {
                this.salvandoNotificacoes.set(false);
                this.toast.sucesso('Notificações de contato salvas.');
            },
            error: () => {
                this.salvandoNotificacoes.set(false);
                this.toast.erro('Não foi possível salvar as notificações.');
            },
        });
    }
}
