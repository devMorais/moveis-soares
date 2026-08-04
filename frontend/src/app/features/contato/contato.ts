import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SITE_INFO } from '../../core/constants/site-info';

@Component({
    selector: 'app-contato',
    imports: [ReactiveFormsModule],
    templateUrl: './contato.html',
    styleUrl: './contato.scss',
})
export class Contato {
    private fb = inject(FormBuilder);

    info = SITE_INFO;
    enviando = signal(false);
    status = signal<'sucesso' | 'erro' | null>(null);

    form = this.fb.nonNullable.group({
        nome: ['', [Validators.required, Validators.maxLength(120)]],
        telefone: ['', [Validators.required, Validators.maxLength(30)]],
        email: ['', [Validators.email, Validators.maxLength(150)]],
        mensagem: ['', [Validators.required, Validators.maxLength(2000)]],
        // Honeypot: campo invisível para o usuário, deve permanecer vazio.
        empresa: [''],
    });

    enviar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        // TODO(MS-04): plugar ContactService real (POST /api/contato) quando o
        // backend estiver pronto. Por enquanto só simula sucesso — esta etapa
        // é só frontend com dados mockados, sem chamada HTTP.
        this.enviando.set(true);
        this.status.set(null);

        setTimeout(() => {
            this.enviando.set(false);
            this.status.set('sucesso');
            this.form.reset();
        }, 600);
    }
}
