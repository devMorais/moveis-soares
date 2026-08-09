import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConteudoAdminService } from '../../../core/services/conteudo-admin.service';
import { SecaoVisibilidade, SecoesAdminService } from '../../../core/services/secoes-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../environments/environment';

type Aba = 'inicio' | 'sobre' | 'contato';

const NOMES_ABA: Record<Aba, string> = {
    inicio: 'Início',
    sobre: 'Sobre',
    contato: 'Contato',
};

/** As 3 posicoes de destaque da home e o icone fixo de cada uma (ver home.ts). */
const ROTULOS_INSTITUCIONAL = ['Destaque 1 (ícone: caminhão)', 'Destaque 2 (ícone: estrela)', 'Destaque 3 (ícone: balão de fala)'];
/** As 4 posicoes de diferenciais em /sobre e o icone fixo de cada uma (ver sobre.ts). */
const ROTULOS_DIFERENCIAIS = ['Diferencial 1 (ícone: estrela)', 'Diferencial 2 (ícone: etiqueta)', 'Diferencial 3 (ícone: caminhão)', 'Diferencial 4 (ícone: balão de fala)'];

@Component({
    selector: 'app-admin-conteudo',
    imports: [ReactiveFormsModule, UploadImagem],
    templateUrl: './conteudo.html',
    styleUrl: './conteudo.scss',
})
export class Conteudo implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private secoesService = inject(SecoesAdminService);
    private toast = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;
    nomesAba = NOMES_ABA;
    abasDisponiveis: Aba[] = ['inicio', 'sobre', 'contato'];
    rotulosInstitucional = ROTULOS_INSTITUCIONAL;
    rotulosDiferenciais = ROTULOS_DIFERENCIAIS;

    abaAtiva = signal<Aba>('inicio');
    salvando = signal(false);
    secoes = signal<SecaoVisibilidade[]>([]);
    salvandoVisibilidade = signal(false);

    /** A aba "inicio" nao tem seção de visibilidade própria (o carrossel de produtos é sempre visível). */
    secaoAtual = computed(() => this.secoes().find((s) => s.chave === this.abaAtiva()));

    private novoItemLista = () => this.fb.nonNullable.group({
        titulo: ['', Validators.required],
        texto: ['', Validators.required],
    });

    formInicio = this.fb.nonNullable.group({
        resumo_titulo: [''],
        resumo_texto: [''],
        cta_titulo: [''],
        cta_texto: [''],
        itens: this.fb.array([this.novoItemLista(), this.novoItemLista(), this.novoItemLista()]),
    });

    formSobre = this.fb.nonNullable.group({
        titulo_historia: [''],
        texto_historia: [''],
        imagem_url: [''],
        cta_titulo: [''],
        cta_texto: [''],
        diferenciais: this.fb.array([this.novoItemLista(), this.novoItemLista(), this.novoItemLista(), this.novoItemLista()]),
    });

    formContato = this.fb.nonNullable.group({
        telefone_display: [''],
        telefone_whatsapp: [''],
        email: [''],
        endereco: [''],
        horario: [''],
    });

    get itensInicio(): FormArray {
        return this.formInicio.get('itens') as FormArray;
    }

    get diferenciaisSobre(): FormArray {
        return this.formSobre.get('diferenciais') as FormArray;
    }

    ngOnInit(): void {
        const abaUrl = this.route.snapshot.queryParamMap.get('aba') as Aba | null;
        if (abaUrl && this.abasDisponiveis.includes(abaUrl)) {
            this.abaAtiva.set(abaUrl);
        }

        this.conteudoService.buscar<{
            itens?: { titulo: string; texto: string }[];
            resumo_titulo?: string;
            resumo_texto?: string;
        }>('institucional').subscribe((dados) => {
            this.formInicio.patchValue({
                resumo_titulo: dados?.resumo_titulo ?? '',
                resumo_texto: dados?.resumo_texto ?? '',
            });
            this.preencherItens(this.itensInicio, dados?.itens ?? [], 3);
        });

        this.conteudoService.buscarCta<{ titulo?: string; texto?: string }>('home').subscribe((dados) => {
            this.formInicio.patchValue({ cta_titulo: dados?.titulo ?? '', cta_texto: dados?.texto ?? '' });
        });

        this.conteudoService.buscar<{
            titulo_historia?: string;
            texto_historia?: string;
            imagem_url?: string;
            diferenciais?: { titulo: string; texto: string }[];
        }>('sobre').subscribe((dados) => {
            this.formSobre.patchValue({
                titulo_historia: dados?.titulo_historia ?? '',
                texto_historia: dados?.texto_historia ?? '',
                imagem_url: dados?.imagem_url ?? '',
            });
            this.preencherItens(this.diferenciaisSobre, dados?.diferenciais ?? [], 4);
        });

        this.conteudoService.buscarCta<{ titulo?: string; texto?: string }>('sobre').subscribe((dados) => {
            this.formSobre.patchValue({ cta_titulo: dados?.titulo ?? '', cta_texto: dados?.texto ?? '' });
        });

        this.conteudoService.buscar('contato').subscribe((dados) => this.formContato.patchValue(dados ?? {}));
        this.secoesService.listar().subscribe((secoes) => this.secoes.set(secoes));
    }

    private preencherItens(array: FormArray, itens: { titulo: string; texto: string }[], tamanho: number): void {
        for (let i = 0; i < tamanho; i++) {
            array.at(i)?.patchValue(itens[i] ?? { titulo: '', texto: '' });
        }
    }

    trocarAba(aba: Aba): void {
        this.abaAtiva.set(aba);
        this.router.navigate([], { queryParams: { aba }, relativeTo: this.route });
    }

    aoImagemProcessada(url: string): void {
        this.formSobre.patchValue({ imagem_url: url });
    }

    alternarVisibilidade(): void {
        const secao = this.secaoAtual();
        if (!secao || secao.bloqueada) return;

        const novoValor = !secao.visivel;
        this.salvandoVisibilidade.set(true);

        this.secoesService.atualizar(secao.chave, novoValor).subscribe({
            next: () => {
                this.salvandoVisibilidade.set(false);
                this.secoes.update((atuais) =>
                    atuais.map((s) => (s.chave === secao.chave ? { ...s, visivel: novoValor } : s)),
                );
                this.toast.sucesso(novoValor ? 'Seção agora está visível no site.' : 'Seção ocultada do site.');
            },
            error: () => {
                this.salvandoVisibilidade.set(false);
                this.toast.erro('Não foi possível atualizar a visibilidade.');
            },
        });
    }

    salvar(): void {
        const aba = this.abaAtiva();
        this.salvando.set(true);

        if (aba === 'inicio') {
            const valores = this.formInicio.getRawValue();
            this.conteudoService.atualizar('institucional', {
                resumo_titulo: valores.resumo_titulo,
                resumo_texto: valores.resumo_texto,
                itens: valores.itens,
            }).subscribe();
            this.conteudoService.atualizarCta('home', { titulo: valores.cta_titulo, texto: valores.cta_texto }).subscribe({
                next: () => this.aoSalvarComSucesso(),
                error: () => this.aoFalharSalvar(),
            });
            return;
        }

        if (aba === 'sobre') {
            const valores = this.formSobre.getRawValue();
            this.conteudoService.atualizar('sobre', {
                titulo_historia: valores.titulo_historia,
                texto_historia: valores.texto_historia,
                imagem_url: valores.imagem_url,
                diferenciais: valores.diferenciais,
            }).subscribe();
            this.conteudoService.atualizarCta('sobre', { titulo: valores.cta_titulo, texto: valores.cta_texto }).subscribe({
                next: () => this.aoSalvarComSucesso(),
                error: () => this.aoFalharSalvar(),
            });
            return;
        }

        this.conteudoService.atualizar('contato', this.formContato.getRawValue()).subscribe({
            next: () => this.aoSalvarComSucesso(),
            error: () => this.aoFalharSalvar(),
        });
    }

    private aoSalvarComSucesso(): void {
        this.salvando.set(false);
        this.toast.sucesso('Conteúdo salvo com sucesso.');
    }

    private aoFalharSalvar(): void {
        this.salvando.set(false);
        this.toast.erro('Não foi possível salvar. Tente novamente.');
    }
}
