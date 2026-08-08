import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface SecaoVisibilidade {
    id: number;
    chave: string;
    visivel: boolean;
    bloqueada: boolean;
}

@Injectable({ providedIn: 'root' })
export class SecoesAdminService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    listar() {
        return this.http.get<SecaoVisibilidade[]>(`${this.baseUrl}/admin/secoes`);
    }

    atualizar(chave: string, visivel: boolean) {
        return this.http.patch<SecaoVisibilidade>(`${this.baseUrl}/admin/secoes`, { chave, visivel });
    }
}
