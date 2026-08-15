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

    /** Cidade escolhida na lista de cidades cadastradas pelo admin. */
    cidadeSelecionada = signal<CidadeEntrega | null>(null);
    /**
     * Cliente indicou que a cidade dele nao esta na lista - libera o campo
     * de texto livre (MS-PED-03: nao bloqueia a finalizacao, o pedido segue
     * com frete "a combinar" e um atalho pro WhatsApp fica disponivel como
     * alternativa mais rapida, nao como unico caminho).
     */
    cidadeForaDaLista = signal(false);
    /** Cliente tentou finalizar sem escolher/digitar nenhuma cidade - mostra aviso especifico pra isso. */
    tentouSemCidade = signal(false);

    form = this.fb.nonNullable.group({
        nome: ['', Validators.required],
        telefone: ['', Validators.required],
        endereco: ['', Validators.required],
        cidadeTexto: [''],
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
        this.form.controls.cidadeTexto.setValue('');
    }

    minhaCidadeNaoEsta(): void {
        this.cidadeSelecionada.set(null);
        this.cidadeForaDaLista.set(true);
        this.tentouSemCidade.set(false);
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
        const cidadeTexto = this.form.controls.cidadeTexto.value.trim();
        const temCidade = !!cidade || (this.cidadeForaDaLista() && cidadeTexto.length > 0);

        if (this.form.invalid || !temCidade) {
            this.form.markAllAsTouched();
            this.tentouSemCidade.set(!temCidade);
            this.toast.erro(
                !temCidade
                    ? 'Escolha sua cidade na lista ou digite o nome dela antes de continuar.'
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
            cidade_entrega_id: cidade?.id ?? null,
            cidade_texto_livre: cidade ? null : cidadeTexto,
            frete_a_combinar: !cidade,
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
