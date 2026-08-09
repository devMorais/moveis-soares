import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ConteudoAdminService } from '../../../../core/services/conteudo-admin.service';
import { SecaoVisibilidade, SecoesAdminService } from '../../../../core/services/secoes-admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-admin-conteudo-contato',
    imports: [ReactiveFormsModule],
    templateUrl: './conteudo-contato.html',
    styleUrl: '../conteudo-abas.scss',
})
export class ConteudoContato implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private secoesService = inject(SecoesAdminService);
    private toast = inject(ToastService);

    salvando = signal(false);
    secao = signal<SecaoVisibilidade | null>(null);
    salvandoVisibilidade = signal(false);

    form = this.fb.nonNullable.group({
        telefone_display: [''],
        telefone_whatsapp: [''],
        email: [''],
        endereco: [''],
        horario: [''],
    });

    ngOnInit(): void {
        this.conteudoService.buscar('contato').subscribe({
            next: (dados) => this.form.patchValue(dados ?? {}),
            error: () => this.toast.erro('Não foi possível carregar o conteúdo salvo. Recarregue a página antes de editar.'),
        });

        this.secoesService.listar().subscribe({
            next: (secoes) => this.secao.set(secoes.find((s) => s.chave === 'contato') ?? null),
            error: () => this.toast.erro('Não foi possível carregar as configurações de visibilidade.'),
        });
    }

    alternarVisibilidade(): void {
        const secao = this.secao();
        if (!secao || secao.bloqueada) return;

        const novoValor = !secao.visivel;
        this.salvandoVisibilidade.set(true);

        this.secoesService.atualizar(secao.chave, novoValor).subscribe({
            next: () => {
                this.salvandoVisibilidade.set(false);
                this.secao.set({ ...secao, visivel: novoValor });
                this.toast.sucesso(novoValor ? 'Seção agora está visível no site.' : 'Seção ocultada do site.');
            },
            error: () => {
                this.salvandoVisibilidade.set(false);
                this.toast.erro('Não foi possível atualizar a visibilidade.');
            },
        });
    }

    salvar(): void {
        this.salvando.set(true);

        this.conteudoService.atualizar('contato', this.form.getRawValue()).subscribe({
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
