import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../../environments/environment';

// Formato padrao de erro da API: { mensagem, tipo, erros?: { campo: string | string[] } }
type ErrosValidacao = Record<string, string | string[]>;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);
    const toast = inject(ToastService);
    const router = inject(Router);
    const token = auth.getToken();

    const isApiRequest = req.url.startsWith(environment.apiUrl);

    const cloned = token && isApiRequest
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;

    return next(cloned).pipe(
        catchError((err: HttpErrorResponse) => {
            if (isApiRequest) {
                if (err.status === 401) {
                    auth.clearSession();
                    router.navigate(['/admin/login']);
                } else if (err.status === 422) {
                    const erros = err.error?.erros as ErrosValidacao | undefined;
                    if (erros) {
                        Object.values(erros).forEach((mensagens) => {
                            const lista = Array.isArray(mensagens) ? mensagens : [mensagens];
                            lista.forEach((msg) => toast.erro(msg, 'Dados inválidos'));
                        });
                    } else {
                        toast.erro(err.error?.mensagem || 'Dados inválidos.', 'Atenção');
                    }
                } else if (err.status === 429) {
                    toast.aviso('Muitas tentativas. Aguarde um momento.', 'Limite atingido');
                } else if (err.status === 500) {
                    toast.erro(err.error?.mensagem || 'Erro interno. Tente novamente.', 'Erro no servidor');
                } else if (err.status >= 400 && err.error?.mensagem) {
                    toast.erro(err.error.mensagem, 'Erro');
                }
            }

            return throwError(() => err);
        }),
    );
};
