import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContatoService } from '../../core/services/contato';
import { SiteService } from '../../core/services/site.service';

@Component({
    selector: 'app-contato',
    imports: [ReactiveFormsModule],
    templateUrl: './contato.html',
    styleUrl: './contato.scss',
})
export class Contato {
    private fb = inject(FormBuilder);
    private contatoService = inject(ContatoService);
    private site = inject(SiteService);

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
