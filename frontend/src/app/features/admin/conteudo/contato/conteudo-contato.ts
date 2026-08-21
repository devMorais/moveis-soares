import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConteudoAdminService } from '../../../../core/services/conteudo-admin.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-admin-conteudo-contato',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './conteudo-contato.html',
    styleUrl: '../conteudo-abas.scss',
})
export class ConteudoContato implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private toast = inject(ToastService);

    salvando = signal(false);

    form = this.fb.nonNullable.group({
        telefone_display: ['', Validators.required],
        telefone_whatsapp: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        endereco: ['', Validators.required],
        horario: ['', Validators.required],
    });

    ngOnInit(): void {
        this.conteudoService.buscar('contato').subscribe({
            next: (dados) => this.form.patchValue(dados ?? {}),
            error: () => this.toast.erro('Não foi possível carregar o conteúdo salvo. Recarregue a página antes de editar.'),
        });
    }

    salvar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.toast.erro('Preencha todos os campos obrigatórios antes de salvar.');
            return;
        }

        this.salvando.set(true);

        this.conteudoService.atualizar('contato', this.form.getRawValue()).subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso('Conteúdo salvo com sucesso.');
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar. Tente novamente.');
            },
        });
    }
}
