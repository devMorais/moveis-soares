import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-admin-login',
    imports: [ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    private fb = inject(FormBuilder);
    private auth = inject(AuthService);
    private toast = inject(ToastService);
    private router = inject(Router);

    enviando = signal(false);

    form = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
    });

    entrar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.enviando.set(true);

        this.auth.login(this.form.getRawValue()).subscribe({
            next: () => {
                this.enviando.set(false);
                this.toast.sucesso('Login realizado com sucesso.');
                this.router.navigate(['/admin']);
            },
            error: () => {
                this.enviando.set(false);
                this.toast.erro('E-mail ou senha incorretos.', 'Falha no login');
            },
        });
    }
}
