import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CategoriaAdmin } from '../types/categoria/categoria-admin.type';

export interface DadosCategoria {
    nome: string;
    slug?: string | null;
    imagem_url?: string | null;
    ativo?: boolean;
    ordem_exibicao?: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriaAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/categorias`;

    listar() {
        return this.http.get<CategoriaAdmin[]>(this.baseUrl);
    }

    criar(dados: DadosCategoria) {
        return this.http.post<CategoriaAdmin>(this.baseUrl, dados);
    }

    atualizar(id: number, dados: DadosCategoria) {
        return this.http.put<CategoriaAdmin>(`${this.baseUrl}/${id}`, dados);
    }

    remover(id: number) {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    }
}
