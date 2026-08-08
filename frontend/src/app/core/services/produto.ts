import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Produto } from '../types/produto/produto.type';

@Injectable({
    providedIn: 'root',
})
export class ProdutoService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/produtos`;

    listar(): Observable<Produto[]> {
        return this.http.get<Produto[]>(this.apiUrl);
    }

    porCategoria(categoriaSlug: string): Observable<Produto[]> {
        return this.http.get<Produto[]>(`${this.apiUrl}/categoria/${categoriaSlug}`);
    }

    porSlug(slug: string): Observable<Produto> {
        return this.http.get<Produto>(`${this.apiUrl}/${slug}`);
    }
}
