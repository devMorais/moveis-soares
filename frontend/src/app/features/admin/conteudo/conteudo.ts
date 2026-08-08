import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConteudoAdminService } from '../../../core/services/conteudo-admin.service';
import { SecaoVisibilidade, SecoesAdminService } from '../../../core/services/secoes-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../environments/environment';

type Aba = 'hero' | 'sobre' | 'contato';

const NOMES_ABA: Record<Aba, string> = {
    hero: 'Início',
    sobre: 'Sobre',
    contato: 'Contato',
};

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
    abasDisponiveis: Aba[] = ['hero', 'sobre', 'contato'];

    abaAtiva = signal<Aba>('hero');
    salvando = signal(false);
    secoes = signal<SecaoVisibilidade[]>([]);
    salvandoVisibilidade = signal(false);

    secaoAtual = computed(() => this.secoes().find((s) => s.chave === this.abaAtiva()));

    formHero = this.fb.nonNullable.group({
        titulo: [''],
        subtitulo: [''],
    });

    formSobre = this.fb.nonNullable.group({
        titulo_historia: [''],
        texto_historia: [''],
        imagem_url: [''],
    });

    formContato = this.fb.nonNullable.group({
        telefone_display: [''],
        telefone_whatsapp: [''],
        email: [''],
        endereco: [''],
        horario: [''],
    });

    ngOnInit(): void {
        const abaUrl = this.route.snapshot.queryParamMap.get('aba') as Aba | null;
        if (abaUrl && this.abasDisponiveis.includes(abaUrl)) {
            this.abaAtiva.set(abaUrl);
        }

        this.conteudoService.buscar('hero').subscribe((dados) => this.formHero.patchValue(dados ?? {}));
        this.conteudoService.buscar('sobre').subscribe((dados) => this.formSobre.patchValue(dados ?? {}));
        this.conteudoService.buscar('contato').subscribe((dados) => this.formContato.patchValue(dados ?? {}));
        this.secoesService.listar().subscribe((secoes) => this.secoes.set(secoes));
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
        const form = aba === 'hero' ? this.formHero : aba === 'sobre' ? this.formSobre : this.formContato;

        this.salvando.set(true);

        this.conteudoService.atualizar(aba, form.getRawValue()).subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso('Conteúdo salvo com sucesso.');
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar. Tente novamente.');
            },
        });
    }
}
