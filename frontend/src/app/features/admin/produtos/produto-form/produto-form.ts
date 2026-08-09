import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoriaAdminService } from '../../../../core/services/categoria-admin.service';
import { ProdutoAdminService } from '../../../../core/services/produto-admin.service';
import { ToastService } from '../../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';
import { CategoriaAdmin } from '../../../../core/types/categoria/categoria-admin.type';
import { UploadImagem } from '../../../../shared/components/upload-imagem/upload-imagem';
import { LightboxService } from '../../../../shared/components/lightbox/lightbox.service';

@Component({
    selector: 'app-produto-form',
    imports: [ReactiveFormsModule, UploadImagem, RouterLink],
    templateUrl: './produto-form.html',
    styleUrl: './produto-form.scss',
})
export class ProdutoForm implements OnInit {
    private fb = inject(FormBuilder);
    private categoriasService = inject(CategoriaAdminService);
    private produtosService = inject(ProdutoAdminService);
    private toast = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    lightbox = inject(LightboxService);

    readonly uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;

    categorias = signal<CategoriaAdmin[]>([]);
    salvando = signal(false);
    carregando = signal(false);
    produtoId = signal<number | null>(null);

    /** Primeira imagem enviada vira a principal; as demais compõem a galeria. */
    imagens = signal<string[]>([]);

    form = this.fb.nonNullable.group({
        nome: ['', [Validators.required, Validators.minLength(3)]],
        categoria_id: [null as number | null, Validators.required],
        preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
        preco_de: [null as number | null],
        especificacao: [''],
        descricao: [''],
        altura_cm: [null as number | null],
        largura_cm: [null as number | null],
        profundidade_cm: [null as number | null],
        selo: [''],
        estoque: [null as number | null],
    });

    get editando(): boolean {
        return this.produtoId() !== null;
    }

    voltar(): void {
        this.router.navigate(['/admin/produtos']);
    }

    ngOnInit(): void {
        this.categoriasService.listar().subscribe((categorias) => {
            this.categorias.set(categorias);

            const idParam = this.route.snapshot.paramMap.get('id');
            if (idParam) {
                const id = Number(idParam);
                this.produtoId.set(id);
                this.carregarProduto(id);
            }
        });
    }

    private carregarProduto(id: number): void {
        this.carregando.set(true);
        this.produtosService.mostrar(id).subscribe({
            next: (produto) => {
                this.form.patchValue({
                    nome: produto.nome,
                    categoria_id: this.categorias().find((c) => c.slug === produto.categoriaSlug)?.id ?? null,
                    preco: produto.preco,
                    preco_de: produto.precoDe ?? null,
                    especificacao: produto.especificacao ?? '',
                    descricao: produto.descricao ?? '',
                    altura_cm: produto.alturaCm ?? null,
                    largura_cm: produto.larguraCm ?? null,
                    profundidade_cm: produto.profundidadeCm ?? null,
                    selo: produto.selo ?? '',
                    estoque: produto.estoque ?? null,
                });
                this.imagens.set([produto.imagemUrl, ...(produto.imagens ?? [])]);
                this.carregando.set(false);
            },
            error: () => {
                this.toast.erro('Produto não encontrado.');
                this.carregando.set(false);
            },
        });
    }

    aoConcluirUpload(url: string): void {
        this.imagens.update((atuais) => [...atuais, url]);
    }

    removerImagem(indice: number): void {
        this.imagens.update((atuais) => atuais.filter((_, i) => i !== indice));
    }

    definirComoPrincipal(indice: number): void {
        this.imagens.update((atuais) => {
            const copia = [...atuais];
            const [selecionada] = copia.splice(indice, 1);
            return [selecionada, ...copia];
        });
    }

    get imagemPendente(): boolean {
        return this.imagens().length === 0;
    }

    salvar(): void {
        if (this.form.invalid || this.imagemPendente) {
            this.form.markAllAsTouched();
            return;
        }

        this.salvando.set(true);
        const [principal, ...resto] = this.imagens();
        const valores = this.form.getRawValue();

        const dados = {
            categoria_id: valores.categoria_id!,
            nome: valores.nome,
            preco: valores.preco!,
            preco_de: valores.preco_de,
            imagem_url: principal,
            imagens: resto,
            especificacao: valores.especificacao || null,
            descricao: valores.descricao || null,
            altura_cm: valores.altura_cm,
            largura_cm: valores.largura_cm,
            profundidade_cm: valores.profundidade_cm,
            selo: valores.selo || null,
            estoque: valores.estoque,
        };

        const id = this.produtoId();
        const requisicao = id ? this.produtosService.atualizar(id, dados) : this.produtosService.criar(dados);

        requisicao.subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso(id ? 'Produto atualizado.' : 'Produto cadastrado.');
                this.router.navigate(['/admin/produtos']);
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar o produto.');
            },
        });
    }
}
