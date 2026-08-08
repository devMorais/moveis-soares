import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CidadeEntrega } from '../types/cidade-entrega/cidade-entrega.type';

@Injectable({ providedIn: 'root' })
export class CidadeEntregaService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    listar() {
        return this.http.get<CidadeEntrega[]>(`${this.baseUrl}/cidades-entrega`);
    }
}
