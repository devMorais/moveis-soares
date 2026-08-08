import { Component, OnInit, inject, signal } from '@angular/core';
import { SecaoVisibilidade, SecoesAdminService } from '../../../core/services/secoes-admin.service';
import { ToastService } from '../../../core/services/toast.service';

const NOMES_AMIGAVEIS: Record<string, string> = {
    hero: 'Início (Hero)',
    sobre: 'Sobre',
    contato: 'Fale Conosco',
};

@Component({
    selector: 'app-admin-secoes',
    templateUrl: './secoes.html',
    styleUrl: './secoes.scss',
})
export class Secoes implements OnInit {
    private secoesService = inject(SecoesAdminService);
    private toast = inject(ToastService);

    secoes = signal<SecaoVisibilidade[]>([]);
    carregando = signal(true);

    ngOnInit(): void {
        this.secoesService.listar().subscribe({
            next: (secoes) => {
                this.secoes.set(secoes);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    nomeAmigavel(chave: string): string {
        return NOMES_AMIGAVEIS[chave] ?? chave;
    }

    alternar(secao: SecaoVisibilidade): void {
        if (secao.bloqueada) return;

        const novoValor = !secao.visivel;

        this.secoesService.atualizar(secao.chave, novoValor).subscribe({
            next: () => {
                this.secoes.update((atuais) =>
                    atuais.map((s) => (s.chave === secao.chave ? { ...s, visivel: novoValor } : s)),
                );
                this.toast.sucesso(`Seção "${this.nomeAmigavel(secao.chave)}" atualizada.`);
            },
            error: () => this.toast.erro('Não foi possível atualizar a seção.'),
        });
    }
}
