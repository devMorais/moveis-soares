import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContatoService } from '../../core/services/contato';
import { SiteService } from '../../core/services/site.service';
import { Seo } from '../../core/services/seo';

@Component({
    selector: 'app-contato',
    imports: [ReactiveFormsModule],
    templateUrl: './contato.html',
    styleUrl: './contato.scss',
})
export class Contato implements OnInit {
    private fb = inject(FormBuilder);
    private contatoService = inject(ContatoService);
    private site = inject(SiteService);
    private seo = inject(Seo);

    info = computed(() => this.site.conteudo().contato);
    enviando = signal(false);
    status = signal<'sucesso' | 'erro' | null>(null);

    form = this.fb.nonNullable.group({
        nome: ['', [Validators.required, Validators.maxLength(120)]],
        telefone: ['', [Validators.required, Validators.maxLength(30)]],
        email: ['', [Validators.email, Validators.maxLength(150)]],
        mensagem: ['', [Validators.required, Validators.maxLength(2000)]],
        // Honeypot: campo invisivel para o usuario, deve permanecer vazio.
        empresa: [''],
    });

    ngOnInit(): void {
        this.seo.set({
            title: 'Fale conosco',
            description: 'Entre em contato com a Móveis Soares pelo telefone, WhatsApp ou e-mail. Tire suas dúvidas sobre produtos, entrega e formas de pagamento.',
        });
    }

    enviar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.enviando.set(true);
        this.status.set(null);

        this.contatoService.enviar(this.form.getRawValue()).subscribe({
            next: () => {
                this.enviando.set(false);
                this.status.set('sucesso');
                this.form.reset();
            },
            error: () => {
                this.enviando.set(false);
                this.status.set('erro');
            },
        });
    }
}
