import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Produto } from '../types/produto/produto.type';

export interface DadosProduto {
    categoria_id: number;
    nome: string;
    preco: number;
    preco_de?: number | null;
    imagem_url: string;
    imagens?: string[];
    especificacao?: string | null;
    descricao?: string | null;
    altura_cm?: number | null;
    largura_cm?: number | null;
    profundidade_cm?: number | null;
    selo?: string | null;
    estoque?: number | null;
    ativo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProdutoAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/produtos`;

    listar() {
        return this.http.get<Produto[]>(this.baseUrl);
    }

    mostrar(id: number) {
        return this.http.get<Produto>(`${this.baseUrl}/${id}`);
    }

    criar(dados: DadosProduto) {
        return this.http.post<Produto>(this.baseUrl, dados);
    }

    atualizar(id: number, dados: DadosProduto) {
        return this.http.put<Produto>(`${this.baseUrl}/${id}`, dados);
    }

    remover(id: number) {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    }
}
