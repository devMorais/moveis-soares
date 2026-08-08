import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaAdminService } from '../../../core/services/categoria-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';
import { CategoriaAdmin } from '../../../core/types/categoria/categoria-admin.type';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';

@Component({
    selector: 'app-admin-categorias',
    imports: [ReactiveFormsModule, UploadImagem],
    templateUrl: './categorias.html',
    styleUrl: './categorias.scss',
})
export class Categorias implements OnInit {
    private fb = inject(FormBuilder);
    private categoriasService = inject(CategoriaAdminService);
    private toast = inject(ToastService);

    readonly uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;

    categorias = signal<CategoriaAdmin[]>([]);
    carregando = signal(true);
    salvando = signal(false);
    editandoId = signal<number | null>(null);
    imagemUrl = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        nome: ['', Validators.required],
    });

    ngOnInit(): void {
        this.carregar();
    }

    private carregar(): void {
        this.carregando.set(true);
        this.categoriasService.listar().subscribe({
            next: (categorias) => {
                this.categorias.set(categorias);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }

    aoConcluirUpload(url: string): void {
        this.imagemUrl.set(url);
    }

    editar(categoria: CategoriaAdmin): void {
        this.editandoId.set(categoria.id);
        this.imagemUrl.set(categoria.imagemUrl);
        this.form.patchValue({ nome: categoria.nome });
    }

    cancelarEdicao(): void {
        this.editandoId.set(null);
        this.imagemUrl.set(null);
        this.form.reset({ nome: '' });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.salvando.set(true);
        const dados = { nome: this.form.getRawValue().nome, imagem_url: this.imagemUrl() };
        const id = this.editandoId();

        const requisicao = id ? this.categoriasService.atualizar(id, dados) : this.categoriasService.criar(dados);

        requisicao.subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso(id ? 'Categoria atualizada.' : 'Categoria cadastrada.');
                this.cancelarEdicao();
                this.carregar();
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar a categoria.');
            },
        });
    }

    remover(categoria: CategoriaAdmin): void {
        this.categoriasService.remover(categoria.id).subscribe({
            next: () => {
                this.toast.sucesso('Categoria removida.');
                this.carregar();
            },
            error: (erro) => {
                const mensagem = erro?.error?.message ?? 'Não foi possível remover a categoria.';
                this.toast.erro(mensagem);
            },
        });
    }
}
