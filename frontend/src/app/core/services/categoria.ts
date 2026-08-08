import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../types/categoria/categoria.type';
import { Produto } from '../types/produto/produto.type';
import { Paginado } from '../types/paginacao/paginacao.type';

@Injectable({
    providedIn: 'root',
})
export class CategoriaService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/categorias`;

    listar(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(this.apiUrl);
    }

    porSlug(slug: string): Observable<Categoria> {
        return this.http.get<Categoria>(`${this.apiUrl}/${slug}`);
    }

    /**
     * Lista, paginados, os produtos ativos de uma categoria.
     * Usa GET /api/categorias/{slug}/produtos?page=N (Laravel paginate()).
     */
    produtos(slug: string, pagina: number = 1): Observable<Paginado<Produto>> {
        return this.http.get<Paginado<Produto>>(`${this.apiUrl}/${slug}/produtos`, {
            params: { page: pagina },
        });
    }
}
