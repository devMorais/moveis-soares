import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConteudoAdminService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    buscar<T = Record<string, unknown>>(slug: string) {
        return this.http.get<T>(`${this.baseUrl}/admin/conteudo/${slug}`);
    }

    atualizar<T = Record<string, unknown>>(slug: string, dados: Record<string, unknown>) {
        return this.http.put<T>(`${this.baseUrl}/admin/conteudo/${slug}`, dados);
    }

    buscarCta<T = Record<string, unknown>>(chave: string) {
        return this.http.get<T>(`${this.baseUrl}/admin/conteudo-cta/${chave}`);
    }

    atualizarCta<T = Record<string, unknown>>(chave: string, dados: Record<string, unknown>) {
        return this.http.put<T>(`${this.baseUrl}/admin/conteudo-cta/${chave}`, dados);
    }
}
