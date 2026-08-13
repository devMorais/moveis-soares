import { Component, OnInit, inject, signal } from '@angular/core';
import { SecaoVisibilidade, SecoesAdminService } from '../../../core/services/secoes-admin.service';
import { ToastService } from '../../../core/services/toast.service';

const NOMES_SECAO: Record<string, string> = {
    hero: 'Início (banner principal)',
    sobre: 'Sobre',
    contato: 'Contato',
};

/** Ordem fixa de exibicao, independente da ordem que a API devolver. */
const ORDEM_SECOES = ['hero', 'sobre', 'contato'];

@Component({
    selector: 'app-admin-secoes',
    templateUrl: './secoes.html',
    styleUrl: '../conteudo/conteudo-abas.scss',
})
export class Secoes implements OnInit {
    private secoesService = inject(SecoesAdminService);
    private toast = inject(ToastService);

    nomesSecao = NOMES_SECAO;
    carregando = signal(true);
    secoes = signal<SecaoVisibilidade[]>([]);
    salvandoChave = signal<string | null>(null);

    ngOnInit(): void {
        this.secoesService.listar().subscribe({
            next: (secoes) => {
                const ordenadas = ORDEM_SECOES.map((chave) => secoes.find((s) => s.chave === chave)).filter(
                    (s): s is SecaoVisibilidade => !!s,
                );
                this.secoes.set(ordenadas);
                this.carregando.set(false);
            },
            error: () => {
                this.carregando.set(false);
                this.toast.erro('Não foi possível carregar as seções.');
            },
        });
    }

    alternar(secao: SecaoVisibilidade): void {
        if (secao.bloqueada || this.salvandoChave()) return;

        const novoValor = !secao.visivel;
        this.salvandoChave.set(secao.chave);

        this.secoesService.atualizar(secao.chave, novoValor).subscribe({
            next: () => {
                this.salvandoChave.set(null);
                this.secoes.update((atual) => atual.map((s) => (s.chave === secao.chave ? { ...s, visivel: novoValor } : s)));
                this.toast.sucesso(novoValor ? 'Seção agora está visível no site.' : 'Seção ocultada do site.');
            },
            error: () => {
                this.salvandoChave.set(null);
                this.toast.erro('Não foi possível atualizar a visibilidade.');
            },
        });
    }
}
