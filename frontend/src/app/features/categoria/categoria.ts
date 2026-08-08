import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CategoriaService } from '../../core/services/categoria';
import { Categoria as CategoriaType } from '../../core/types/categoria/categoria.type';
import { Produto } from '../../core/types/produto/produto.type';

@Component({
    selector: 'app-categoria',
    imports: [RouterLink],
    templateUrl: './categoria.html',
    styleUrl: './categoria.scss',
})
export class Categoria implements OnInit, OnDestroy {
    private route = inject(ActivatedRoute);
    private categoriaService = inject(CategoriaService);

    categoria = signal<CategoriaType | null>(null);
    produtos = signal<Produto[]>([]);
    carregando = signal(false);

    private paginaAtual = signal(1);
    private ultimaPagina = signal(1);
    private slugAtual = '';
    private paramsSub?: Subscription;

    get temMaisPaginas(): boolean {
        return this.paginaAtual() < this.ultimaPagina();
    }

    ngOnInit(): void {
        // Se subscreve nos params ao inves de ler so uma vez porque o Angular
        // reaproveita a mesma instancia do componente ao trocar de /categoria/quarto
        // para /categoria/sala (mesma rota, so o parametro muda).
        this.paramsSub = this.route.paramMap.subscribe((params) => {
            const slug = params.get('slug');
            if (!slug) return;

            this.slugAtual = slug;
            this.categoria.set(null);
            this.produtos.set([]);
            this.paginaAtual.set(1);
            this.ultimaPagina.set(1);

            this.categoriaService.porSlug(slug).subscribe((categoria) => this.categoria.set(categoria));
            this.carregarProdutos(slug, 1);
        });
    }

    ngOnDestroy(): void {
        this.paramsSub?.unsubscribe();
    }

    carregarMais(): void {
        if (!this.slugAtual || !this.temMaisPaginas || this.carregando()) return;
        this.carregarProdutos(this.slugAtual, this.paginaAtual() + 1);
    }

    private carregarProdutos(slug: string, pagina: number): void {
        this.carregando.set(true);
        this.categoriaService.produtos(slug, pagina).subscribe({
            next: (resposta) => {
                this.produtos.update((atual) => (pagina === 1 ? resposta.data : [...atual, ...resposta.data]));
                this.paginaAtual.set(resposta.current_page);
                this.ultimaPagina.set(resposta.last_page);
                this.carregando.set(false);
            },
            error: () => this.carregando.set(false),
        });
    }
}
