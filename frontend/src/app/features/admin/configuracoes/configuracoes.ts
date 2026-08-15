import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColDef } from 'ag-grid-community';
import { ConfiguracaoSeoAdminService, OrdenacaoProdutos } from '../../../core/services/configuracao-seo-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsuarioAdmin, UsuarioAdminService } from '../../../core/services/usuario-admin.service';
import { UserRole } from '../../../core/types/auth/auth-user.type';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { Datatable } from '../../../shared/components/datatable/datatable';
import { environment } from '../../../../environments/environment';

const ROTULOS_PAPEL: Record<UserRole, string> = {
    admin: 'Administrador',
    atendente: 'Atendente',
};

const ROTULOS_ORDENACAO: Record<OrdenacaoProdutos, string> = {
    recentes: 'Mais recentes primeiro',
    antigos: 'Mais antigos primeiro',
    alfabetica: 'Alfabética (A-Z)',
    aleatoria: 'Aleatória',
};

type Aba = 'notificacoes' | 'identidade' | 'catalogo' | 'compartilhamento' | 'rastreamento' | 'usuarios';

const NOMES_ABA: Record<Aba, string> = {
    notificacoes: 'Notificações',
    identidade: 'Identidade e SEO',
    catalogo: 'Catálogo',
    compartilhamento: 'Compartilhamento',
    rastreamento: 'Rastreamento',
    usuarios: 'Usuários',
};

@Component({
    selector: 'app-admin-configuracoes',
    imports: [ReactiveFormsModule, UploadImagem, Datatable],
    templateUrl: './configuracoes.html',
    styleUrl: './configuracoes.scss',
})
export class Configuracoes implements OnInit {
    private fb = inject(FormBuilder);
    private seoService = inject(ConfiguracaoSeoAdminService);
    private usuariosService = inject(UsuarioAdminService);
    private toast = inject(ToastService);
    private confirmDialog = inject(ConfirmDialogService);
    auth = inject(AuthService);

    rotulosPapel = ROTULOS_PAPEL;
    rotulosOrdenacao = ROTULOS_ORDENACAO;
    opcoesOrdenacao: OrdenacaoProdutos[] = ['recentes', 'antigos', 'alfabetica', 'aleatoria'];

    uploadEndpoint = `${environment.apiUrl}/admin/upload-imagem`;
    nomesAba = NOMES_ABA;
    abasDisponiveis: Aba[] = ['notificacoes', 'identidade', 'catalogo', 'compartilhamento', 'rastreamento', 'usuarios'];
    abaAtiva = signal<Aba>('notificacoes');

    carregando = signal(true);
    salvando = signal(false);
    salvandoNotificacoes = signal(false);

    usuarios = signal<UsuarioAdmin[]>([]);
    carregandoUsuarios = signal(false);
    salvandoUsuario = signal(false);
    usuarioEmEdicao = signal<UsuarioAdmin | null>(null);
    formularioUsuarioAberto = signal(false);

    colunasUsuarios: ColDef<UsuarioAdmin>[] = [
        { field: 'name', headerName: 'Nome', flex: 2, sortable: true, filter: true },
        { field: 'email', headerName: 'E-mail', flex: 2, sortable: true, filter: true },
        {
            field: 'role',
            headerName: 'Papel',
            flex: 1,
            sortable: true,
            filter: true,
            valueFormatter: (params) => this.rotulosPapel[params.value as UserRole] ?? params.value,
        },
        {
            headerName: '',
            flex: 1,
            sortable: false,
            filter: false,
            cellRenderer: (params: { data?: UsuarioAdmin }) => {
                const podeRemover = params.data?.id !== this.auth.currentUser()?.id;
                return `
                    <div class="acoes-celula">
                        <button type="button" class="acoes-celula__btn" data-acao="editar" aria-label="Editar"><i class="fas fa-pen"></i></button>
                        ${podeRemover ? `<button type="button" class="acoes-celula__btn" data-acao="remover" aria-label="Remover"><i class="fas fa-trash"></i></button>` : ''}
                    </div>
                `;
            },
            onCellClicked: (event) => {
                const alvo = event.event?.target as HTMLElement;
                const acao = alvo?.closest('[data-acao]')?.getAttribute('data-acao');
                if (!event.data) return;
                if (acao === 'editar') this.abrirFormularioUsuario(event.data);
                if (acao === 'remover') this.removerUsuario(event.data);
            },
        },
    ];

    formUsuario = this.fb.nonNullable.group({
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: [''],
        role: ['atendente' as UserRole, Validators.required],
    });

    form = this.fb.nonNullable.group({
        logo_url: [''],
        produtos_por_pagina: [12, [Validators.required, Validators.min(4), Validators.max(100)]],
        produtos_ordenacao: ['recentes' as OrdenacaoProdutos, Validators.required],
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
                    logo_url: dados.logoUrl ?? '',
                    produtos_por_pagina: dados.produtosPorPagina ?? 12,
                    produtos_ordenacao: dados.produtosOrdenacao ?? 'recentes',
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
        if (aba === 'usuarios' && this.usuarios().length === 0) {
            this.carregarUsuarios();
        }
    }

    private carregarUsuarios(): void {
        this.carregandoUsuarios.set(true);
        this.usuariosService.listar().subscribe({
            next: (usuarios) => {
                this.usuarios.set(usuarios);
                this.carregandoUsuarios.set(false);
            },
            error: () => {
                this.carregandoUsuarios.set(false);
                this.toast.erro('Não foi possível carregar os usuários.');
            },
        });
    }

    abrirFormularioNovoUsuario(): void {
        this.usuarioEmEdicao.set(null);
        this.formUsuario.reset({ name: '', email: '', password: '', role: 'atendente' });
        this.formUsuario.controls.password.addValidators(Validators.required);
        this.formUsuario.controls.password.updateValueAndValidity();
        this.formularioUsuarioAberto.set(true);
    }

    abrirFormularioUsuario(usuario: UsuarioAdmin): void {
        this.usuarioEmEdicao.set(usuario);
        this.formUsuario.reset({ name: usuario.name, email: usuario.email, password: '', role: usuario.role });
        this.formUsuario.controls.password.clearValidators();
        this.formUsuario.controls.password.updateValueAndValidity();
        this.formularioUsuarioAberto.set(true);
    }

    fecharFormularioUsuario(): void {
        this.formularioUsuarioAberto.set(false);
    }

    salvarUsuario(): void {
        if (this.formUsuario.invalid) {
            this.formUsuario.markAllAsTouched();
            return;
        }

        this.salvandoUsuario.set(true);
        const valores = this.formUsuario.getRawValue();
        const dados = {
            name: valores.name,
            email: valores.email,
            password: valores.password || undefined,
            role: valores.role,
        };
        const emEdicao = this.usuarioEmEdicao();

        const requisicao = emEdicao
            ? this.usuariosService.atualizar(emEdicao.id, dados)
            : this.usuariosService.criar(dados);

        requisicao.subscribe({
            next: () => {
                this.salvandoUsuario.set(false);
                this.toast.sucesso(emEdicao ? 'Usuário atualizado.' : 'Usuário criado.');
                this.fecharFormularioUsuario();
                this.carregarUsuarios();
            },
            error: () => {
                this.salvandoUsuario.set(false);
                this.toast.erro('Não foi possível salvar o usuário.');
            },
        });
    }

    async removerUsuario(usuario: UsuarioAdmin): Promise<void> {
        const confirmado = await this.confirmDialog.confirmar({
            titulo: 'Remover usuário',
            mensagem: `Tem certeza que deseja remover "${usuario.name}"? Essa ação não pode ser desfeita.`,
        });
        if (!confirmado) return;

        this.usuariosService.remover(usuario.id).subscribe({
            next: () => {
                this.toast.sucesso('Usuário removido.');
                this.carregarUsuarios();
            },
            error: (erro) => {
                if (erro.status === 422) {
                    this.toast.erro(erro.error?.mensagem ?? 'Não foi possível remover o usuário.');
                } else {
                    this.toast.erro('Não foi possível remover o usuário.');
                }
            },
        });
    }

    aoDefinirLogo(url: string): void {
        this.form.patchValue({ logo_url: url });
    }

    aoDefinirOgImage(url: string): void {
        this.form.patchValue({ seo_og_image_url: url });
    }

    aoDefinirFavicon(url: string): void {
        this.form.patchValue({ seo_favicon_url: url });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.erro('Verifique os campos destacados antes de salvar.');
            return;
        }

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
