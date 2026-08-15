import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto } from '../types/produto/produto.type';
import { Paginado } from '../types/paginacao/paginacao.type';

@Injectable({
    providedIn: 'root',
})
export class ProdutoService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/produtos`;

    /**
     * Lista os produtos ativos, paginados - o tamanho da pagina e definido
     * pelo admin (ver ConfiguracaoSeoController), nao pelo front. Aceita
     * um slug de categoria opcional pra filtrar sem trocar de rota.
     */
    listar(pagina: number = 1, categoriaSlug: string | null = null): Observable<Paginado<Produto>> {
        const params: Record<string, string | number> = { page: pagina };
        if (categoriaSlug) params['categoria'] = categoriaSlug;

        return this.http.get<Paginado<Produto>>(this.apiUrl, { params });
    }

    /** Produtos em destaque (com selo) pro carrossel da home - independente da paginacao. */
    destaques(): Observable<Produto[]> {
        return this.http.get<Produto[]>(`${this.apiUrl}/destaques`);
    }

    porSlug(slug: string): Observable<Produto> {
        return this.http.get<Produto>(`${this.apiUrl}/${slug}`);
    }

    registrarVisualizacao(id: number): void {
        this.http.post(`${this.apiUrl}/${id}/visualizacao`, {}).subscribe({ error: () => {} });
    }
}
