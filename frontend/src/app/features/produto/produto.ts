import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VisualizadorImagens, ItemImagem } from '../../shared/components/visualizador-imagens/visualizador-imagens';
import { ProdutoService } from '../../core/services/produto';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ModulosService } from '../../core/services/modulos.service';
import { SiteService } from '../../core/services/site.service';
import { ToastService } from '../../core/services/toast.service';
import { Seo } from '../../core/services/seo';
import { Produto as ProdutoType } from '../../core/types/produto/produto.type';

@Component({
    selector: 'app-produto',
    imports: [RouterLink, VisualizadorImagens],
    templateUrl: './produto.html',
    styleUrl: './produto.scss',
})
export class Produto implements OnInit {
    private route = inject(ActivatedRoute);
    private produtoService = inject(ProdutoService);
    private carrinhoService = inject(CarrinhoService);
    private modulos = inject(ModulosService);
    private site = inject(SiteService);
    private toast = inject(ToastService);
    private seo = inject(Seo);

    produto = signal<ProdutoType | null>(null);
    carregando = signal(true);
    naoEncontrado = signal(false);

    quantidade = signal(1);
    indiceImagemAtual = signal(0);

    /** Foto principal + demais fotos, se houver (ver MS-CAT-02). */
    galeria = computed(() => {
        const p = this.produto();
        if (!p) return [];
        return [p.imagemUrl, ...(p.imagens ?? [])];
    });

    imagemAtual = computed(() => this.galeria()[this.indiceImagemAtual()] ?? '');

    ampliadaAberta = signal(false);

    /**
     * Versão grande de cada foto, na mesma ordem da galeria().
     * Principal: imagemOriginalUrl (ou a quadrada, se for cadastro antigo).
     * Demais: a API só manda a quadrada; a grande tem o mesmo nome + "-grande".
     * Se a grande não existir, o visualizador volta para a quadrada sozinho.
     */
    itensAmpliados = computed<ItemImagem[]>(() => {
        const p = this.produto();
        if (!p) return [];
        return this.galeria().map((quadrada, i) => ({
            src: i === 0 ? (p.imagemOriginalUrl ?? quadrada) : this.urlGrande(quadrada),
            fallback: quadrada,
        }));
    });

    temMedidas = computed(() => {
        const p = this.produto();
        return !!(p?.alturaCm || p?.larguraCm || p?.profundidadeCm);
    });

    semEstoque = computed(() => {
        const estoque = this.produto()?.estoque;
        return estoque !== undefined && estoque <= 0;
    });

    /** Com as vendas online desligadas, a compra vira conversa no WhatsApp. */
    vendasOnlineHabilitado = computed(() => this.modulos.estaHabilitado('vendas_online', true));

    ngOnInit(): void {
        this.modulos.carregar();

        const slug = this.route.snapshot.paramMap.get('slug');
        if (!slug) {
            this.naoEncontrado.set(true);
            this.carregando.set(false);
            return;
        }

        this.produtoService.porSlug(slug).subscribe({
            next: (produto) => {
                this.produto.set(produto);
                this.carregando.set(false);
                this.seo.set({
                    title: produto.nome,
                    description: produto.descricao ?? `${produto.nome} - ${produto.categoria} | Móveis Soares`,
                    image: produto.imagemUrl,
                });
                this.produtoService.registrarVisualizacao(produto.id);
            },
            error: () => {
                this.naoEncontrado.set(true);
                this.carregando.set(false);
            },
        });
    }

    selecionarImagem(indice: number): void {
        this.indiceImagemAtual.set(indice);
    }

    abrirAmpliada(): void {
        this.ampliadaAberta.set(true);
    }

    fecharAmpliada(): void {
        this.ampliadaAberta.set(false);
    }

    private urlGrande(url: string): string {
        return /\/produtos\/[^/]+\.webp$/i.test(url) ? url.replace(/\.webp$/i, '-grande.webp') : url;
    }

    aumentarQuantidade(): void {
        this.quantidade.update((q) => q + 1);
    }

    diminuirQuantidade(): void {
        this.quantidade.update((q) => Math.max(1, q - 1));
    }

    adicionarAoCarrinho(): void {
        const produto = this.produto();
        if (!produto || this.semEstoque()) return;

        const conseguiu = this.carrinhoService.adicionar(produto, this.quantidade());

        if (!conseguiu) {
            this.toast.erro(`Não há estoque suficiente de "${produto.nome}" para essa quantidade.`);
            return;
        }

        this.toast.sucesso(`${produto.nome} adicionado ao carrinho.`);
        this.carrinhoService.abrir();
    }

    /** Abre o WhatsApp da loja com o produto, a quantidade e o link da página. */
    comprarPeloWhatsapp(): void {
        const produto = this.produto();
        if (!produto) return;

        const link = `${window.location.origin}/produto/${produto.slug}`;
        const texto = encodeURIComponent(
            `Olá! Tenho interesse em "${produto.nome}" (${this.quantidade()}x) — ${link}`,
        );
        const telefone = this.site.conteudo().contato?.telefoneWhatsapp;

        window.open(`https://wa.me/${telefone}?text=${texto}`, '_blank');
    }
}