import { Component, OnInit, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { CidadeEntregaService } from '../../core/services/cidade-entrega.service';
import { PedidoService } from '../../core/services/pedido.service';
import { ToastService } from '../../core/services/toast.service';
import { SiteService } from '../../core/services/site.service';
import { CidadeEntrega } from '../../core/types/cidade-entrega/cidade-entrega.type';

@Component({
    selector: 'app-checkout',
    imports: [ReactiveFormsModule],
    templateUrl: './checkout.html',
    styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
    private fb = inject(FormBuilder);
    private cidadeService = inject(CidadeEntregaService);
    private pedidoService = inject(PedidoService);
    private toast = inject(ToastService);
    private router = inject(Router);
    private site = inject(SiteService);
    private platformId = inject(PLATFORM_ID);

    carrinho = inject(CarrinhoService);

    cidades = signal<CidadeEntrega[]>([]);
    enviando = signal(false);

    /** Cidade escolhida na lista - so cidades cadastradas pelo admin podem ser escolhidas. */
    cidadeSelecionada = signal<CidadeEntrega | null>(null);
    /** Cliente indicou que a cidade dele nao esta na lista - mostra o caminho pelo WhatsApp. */
    cidadeForaDaLista = signal(false);
    /** Cliente tentou finalizar sem escolher cidade - mostra aviso especifico pra isso. */
    tentouSemCidade = signal(false);

    form = this.fb.nonNullable.group({
        nome: ['', Validators.required],
        telefone: ['', Validators.required],
        endereco: ['', Validators.required],
        pontoReferencia: [''],
        observacoes: [''],
    });

    freteACobrar = computed(() => this.cidadeSelecionada()?.valorFrete ?? null);

    totalPedido = computed(() => this.carrinho.subtotal() + (this.freteACobrar() ?? 0));

    ngOnInit(): void {
        if (this.carrinho.itens().length === 0) {
            this.router.navigate(['/']);
            return;
        }

        this.cidadeService.listar().subscribe((cidades) => this.cidades.set(cidades));
    }

    selecionarCidade(cidade: CidadeEntrega): void {
        this.cidadeSelecionada.set(cidade);
        this.cidadeForaDaLista.set(false);
        this.tentouSemCidade.set(false);
    }

    minhaCidadeNaoEsta(): void {
        this.cidadeSelecionada.set(null);
        this.cidadeForaDaLista.set(true);
    }

    /** Mensagem pronta com os itens do carrinho e link de cada produto, pra agilizar o atendimento manual. */
    get linkWhatsapp(): string {
        const itens = this.carrinho
            .itens()
            .map((item) => `- ${item.quantidade}x ${item.nome} (${this.linkProduto(item.slug)})`)
            .join('\n');

        const texto = encodeURIComponent(
            `Olá! Quero fazer um pedido, mas minha cidade não está na lista de entrega automática do site:\n\n${itens}\n\nPodemos combinar a entrega e o frete?`,
        );

        return `https://wa.me/${this.site.conteudo().contato?.telefoneWhatsapp}?text=${texto}`;
    }

    private linkProduto(slug: string | undefined): string {
        if (!isPlatformBrowser(this.platformId) || !slug) return '';
        return `${window.location.origin}/produto/${slug}`;
    }

    finalizar(): void {
        const cidade = this.cidadeSelecionada();

        if (this.form.invalid || !cidade) {
            this.form.markAllAsTouched();
            this.tentouSemCidade.set(!cidade);
            this.toast.erro(
                !cidade
                    ? 'Escolha a cidade de entrega antes de continuar.'
                    : 'Preencha os campos obrigatórios antes de continuar.',
            );
            return;
        }

        this.enviando.set(true);

        const dados = this.form.getRawValue();

        const payload = {
            nome_cliente: dados.nome,
            telefone_cliente: dados.telefone,
            endereco: dados.endereco,
            ponto_referencia: dados.pontoReferencia || null,
            observacoes: dados.observacoes || null,
            cidade_entrega_id: cidade.id,
            cidade_texto_livre: null,
            frete_a_combinar: false,
            itens: this.carrinho.itens().map((item) => ({
                produto_id: item.produtoId,
                quantidade: item.quantidade,
            })),
        };

        this.pedidoService.criar(payload).subscribe({
            next: (resposta) => {
                this.carrinho.limpar();
                this.router.navigate(['/pedido/acompanhar', resposta.token]);
            },
            error: () => {
                this.enviando.set(false);
                this.toast.erro('Não foi possível iniciar o pagamento. Tente novamente.');
            },
        });
    }
}
