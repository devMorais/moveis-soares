import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConteudoAdminService } from '../../../../core/services/conteudo-admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UploadImagem } from '../../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../../environments/environment';

type SubAba = 'historia' | 'diferenciais' | 'banner';

const NOMES_SUBABA: Record<SubAba, string> = {
    historia: 'Nossa história',
    diferenciais: 'Diferenciais',
    banner: 'Banner final',
};

/** As 4 posicoes de diferenciais em /sobre e o icone fixo de cada uma (ver sobre.ts). */
const ROTULOS_DIFERENCIAIS = ['Diferencial 1 (ícone: estrela)', 'Diferencial 2 (ícone: etiqueta)', 'Diferencial 3 (ícone: caminhão)', 'Diferencial 4 (ícone: balão de fala)'];

@Component({
    selector: 'app-admin-conteudo-sobre',
    imports: [ReactiveFormsModule, UploadImagem, RouterLink],
    templateUrl: './conteudo-sobre.html',
    styleUrl: '../conteudo-abas.scss',
})
export class ConteudoSobre implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private toast = inject(ToastService);

    uploadEndpoint = `${environment.apiUrl}/admin/upload-imagem`;
    subAbasDisponiveis: SubAba[] = ['historia', 'diferenciais', 'banner'];
    nomesSubAba = NOMES_SUBABA;
    subAbaAtiva = signal<SubAba>('historia');
    rotulosDiferenciais = ROTULOS_DIFERENCIAIS;

    salvando = signal(false);

    private novoItemLista = () => this.fb.nonNullable.group({
        titulo: ['', Validators.required],
        texto: ['', Validators.required],
    });

    form = this.fb.nonNullable.group({
        titulo_historia: ['', Validators.required],
        texto_historia: ['', Validators.required],
        imagem_url: [''],
        cta_titulo: ['', Validators.required],
        cta_texto: ['', Validators.required],
        diferenciais: this.fb.array([this.novoItemLista(), this.novoItemLista(), this.novoItemLista(), this.novoItemLista()]),
    });

    get diferenciais(): FormArray {
        return this.form.get('diferenciais') as FormArray;
    }

    ngOnInit(): void {
        const erroAoCarregar = () => this.toast.erro('Não foi possível carregar todo o conteúdo salvo. Recarregue a página antes de editar.');

        this.conteudoService.buscar<{
            titulo_historia?: string;
            texto_historia?: string;
            imagem_url?: string;
            diferenciais?: { titulo: string; texto: string }[];
        }>('sobre').subscribe({
            next: (dados) => {
                this.form.patchValue({
                    titulo_historia: dados?.titulo_historia ?? '',
                    texto_historia: dados?.texto_historia ?? '',
                    imagem_url: dados?.imagem_url ?? '',
                });
                this.preencherItens(dados?.diferenciais ?? []);
            },
            error: erroAoCarregar,
        });

        this.conteudoService.buscarCta<{ titulo?: string; texto?: string }>('sobre').subscribe({
            next: (dados) => this.form.patchValue({ cta_titulo: dados?.titulo ?? '', cta_texto: dados?.texto ?? '' }),
            error: erroAoCarregar,
        });
    }

    private preencherItens(itens: { titulo: string; texto: string }[]): void {
        for (let i = 0; i < 4; i++) {
            this.diferenciais.at(i)?.patchValue(itens[i] ?? { titulo: '', texto: '' });
        }
    }

    trocarSubAba(aba: SubAba): void {
        this.subAbaAtiva.set(aba);
    }

    aoImagemProcessada(url: string): void {
        this.form.patchValue({ imagem_url: url });
    }

    /**
     * Cada aba salva so os proprios campos, num pedido separado - assim dá pra
     * ir preenchendo e salvando aba por aba, sem precisar terminar as outras
     * duas primeiro (bug encontrado ao vivo: salvar travava tudo se qualquer
     * outra aba, ainda nao preenchida, estivesse vazia).
     */
    salvar(): void {
        const aba = this.subAbaAtiva();

        if (aba === 'historia') return this.salvarHistoria();
        if (aba === 'diferenciais') return this.salvarDiferenciais();
        return this.salvarBanner();
    }

    private salvarHistoria(): void {
        const { titulo_historia, texto_historia, imagem_url } = this.form.controls;

        if (titulo_historia.invalid || texto_historia.invalid) {
            titulo_historia.markAsTouched();
            texto_historia.markAsTouched();
            this.toast.erro('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }

        this.salvando.set(true);
        this.conteudoService
            .atualizar('sobre', {
                titulo_historia: titulo_historia.value,
                texto_historia: texto_historia.value,
                imagem_url: imagem_url.value,
            })
            .subscribe({ next: () => this.aoSalvarComSucesso(), error: () => this.aoSalvarComErro() });
    }

    private salvarDiferenciais(): void {
        if (this.diferenciais.invalid) {
            this.diferenciais.markAllAsTouched();
            this.toast.erro('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }

        this.salvando.set(true);
        this.conteudoService
            .atualizar('sobre', { diferenciais: this.diferenciais.getRawValue() })
            .subscribe({ next: () => this.aoSalvarComSucesso(), error: () => this.aoSalvarComErro() });
    }

    private salvarBanner(): void {
        const { cta_titulo, cta_texto } = this.form.controls;

        if (cta_titulo.invalid || cta_texto.invalid) {
            cta_titulo.markAsTouched();
            cta_texto.markAsTouched();
            this.toast.erro('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }

        this.salvando.set(true);
        this.conteudoService
            .atualizarCta('sobre', { titulo: cta_titulo.value, texto: cta_texto.value })
            .subscribe({ next: () => this.aoSalvarComSucesso(), error: () => this.aoSalvarComErro() });
    }

    private aoSalvarComSucesso(): void {
        this.salvando.set(false);
        this.toast.sucesso('Conteúdo salvo com sucesso.');
    }

    private aoSalvarComErro(): void {
        this.salvando.set(false);
        this.toast.erro('Não foi possível salvar. Tente novamente.');
    }
}
