import { Component, OnInit, computed, inject, signal } from '@angular/core';
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

    carrinho = inject(CarrinhoService);

    cidades = signal<CidadeEntrega[]>([]);
    enviando = signal(false);

    form = this.fb.nonNullable.group({
        nome: ['', Validators.required],
        telefone: ['', Validators.required],
        endereco: ['', Validators.required],
        cidadeTexto: ['', Validators.required],
    });

    /** Cidade cadastrada que bate com o texto digitado, se houver. */
    cidadeEncontrada = computed(() => {
        const texto = this.form.controls.cidadeTexto.value?.trim().toLowerCase();
        if (!texto) return null;
        return this.cidades().find((c) => c.nomeCidade.toLowerCase() === texto) ?? null;
    });

    freteACobrar = computed(() => this.cidadeEncontrada()?.valorFrete ?? null);

    totalPedido = computed(() => this.carrinho.subtotal() + (this.freteACobrar() ?? 0));

    ngOnInit(): void {
        if (this.carrinho.itens().length === 0) {
            this.router.navigate(['/']);
            return;
        }

        this.cidadeService.listar().subscribe((cidades) => this.cidades.set(cidades));
    }

    selecionarCidade(cidade: CidadeEntrega): void {
        this.form.controls.cidadeTexto.setValue(cidade.nomeCidade);
    }

    get linkWhatsapp(): string {
        const texto = encodeURIComponent(
            `Olá! Fiz um pedido no site e minha cidade não está na lista de entrega automática. Podemos combinar o frete?`,
        );
        return `https://wa.me/${this.site.conteudo().contato?.telefoneWhatsapp}?text=${texto}`;
    }

    finalizar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.enviando.set(true);

        const dados = this.form.getRawValue();
        const cidade = this.cidadeEncontrada();

        const payload = {
            nome_cliente: dados.nome,
            telefone_cliente: dados.telefone,
            endereco: dados.endereco,
            cidade_entrega_id: cidade?.id ?? null,
            cidade_texto_livre: cidade ? null : dados.cidadeTexto,
            frete_a_combinar: !cidade,
            itens: this.carrinho.itens().map((item) => ({
                produto_id: item.produtoId,
                quantidade: item.quantidade,
            })),
        };

        this.pedidoService.criar(payload).subscribe({
            next: (resposta) => {
                this.carrinho.limpar();
                window.location.href = resposta.link;
            },
            error: () => {
                this.enviando.set(false);
                this.toast.erro('Não foi possível iniciar o pagamento. Tente novamente.');
            },
        });
    }
}
