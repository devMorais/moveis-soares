import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ConteudoAdminService } from '../../../../core/services/conteudo-admin.service';
import { ToastService } from '../../../../core/services/toast.service';

type SubAba = 'quem-somos' | 'destaques' | 'banner';

const NOMES_SUBABA: Record<SubAba, string> = {
    'quem-somos': 'Quem somos',
    destaques: 'Destaques',
    banner: 'Banner final',
};

/** As 3 posicoes de destaque da home e o icone fixo de cada uma (ver home.ts). */
const ROTULOS_DESTAQUES = ['Destaque 1 (ícone: caminhão)', 'Destaque 2 (ícone: estrela)', 'Destaque 3 (ícone: balão de fala)'];

@Component({
    selector: 'app-admin-conteudo-inicio',
    imports: [ReactiveFormsModule],
    templateUrl: './conteudo-inicio.html',
    styleUrl: '../conteudo-abas.scss',
})
export class ConteudoInicio implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private toast = inject(ToastService);

    subAbasDisponiveis: SubAba[] = ['quem-somos', 'destaques', 'banner'];
    nomesSubAba = NOMES_SUBABA;
    subAbaAtiva = signal<SubAba>('quem-somos');
    rotulosDestaques = ROTULOS_DESTAQUES;

    salvando = signal(false);

    private novoItemLista = () => this.fb.nonNullable.group({
        titulo: ['', Validators.required],
        texto: ['', Validators.required],
    });

    form = this.fb.nonNullable.group({
        resumo_titulo: [''],
        resumo_texto: [''],
        cta_titulo: [''],
        cta_texto: [''],
        itens: this.fb.array([this.novoItemLista(), this.novoItemLista(), this.novoItemLista()]),
    });

    get itens(): FormArray {
        return this.form.get('itens') as FormArray;
    }

    ngOnInit(): void {
        const erroAoCarregar = () => this.toast.erro('Não foi possível carregar todo o conteúdo salvo. Recarregue a página antes de editar.');

        this.conteudoService.buscar<{
            itens?: { titulo: string; texto: string }[];
            resumo_titulo?: string;
            resumo_texto?: string;
        }>('institucional').subscribe({
            next: (dados) => {
                this.form.patchValue({
                    resumo_titulo: dados?.resumo_titulo ?? '',
                    resumo_texto: dados?.resumo_texto ?? '',
                });
                this.preencherItens(dados?.itens ?? []);
            },
            error: erroAoCarregar,
        });

        this.conteudoService.buscarCta<{ titulo?: string; texto?: string }>('home').subscribe({
            next: (dados) => this.form.patchValue({ cta_titulo: dados?.titulo ?? '', cta_texto: dados?.texto ?? '' }),
            error: erroAoCarregar,
        });
    }

    private preencherItens(itens: { titulo: string; texto: string }[]): void {
        for (let i = 0; i < 3; i++) {
            this.itens.at(i)?.patchValue(itens[i] ?? { titulo: '', texto: '' });
        }
    }

    trocarSubAba(aba: SubAba): void {
        this.subAbaAtiva.set(aba);
    }

    salvar(): void {
        this.salvando.set(true);
        const valores = this.form.getRawValue();

        forkJoin([
            this.conteudoService.atualizar('institucional', {
                resumo_titulo: valores.resumo_titulo,
                resumo_texto: valores.resumo_texto,
                itens: valores.itens,
            }),
            this.conteudoService.atualizarCta('home', { titulo: valores.cta_titulo, texto: valores.cta_texto }),
        ]).subscribe({
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
