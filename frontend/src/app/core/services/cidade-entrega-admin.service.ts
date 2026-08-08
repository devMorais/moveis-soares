import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CidadeEntrega } from '../types/cidade-entrega/cidade-entrega.type';

export interface DadosCidadeEntrega {
    nome_cidade: string;
    uf: string;
    valor_frete: number;
    prazo_dias_estimado?: number | null;
    eh_retirada_local?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CidadeEntregaAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/cidades-entrega`;

    listar() {
        return this.http.get<CidadeEntrega[]>(this.baseUrl);
    }

    criar(dados: DadosCidadeEntrega) {
        return this.http.post<CidadeEntrega>(this.baseUrl, dados);
    }

    atualizar(id: number, dados: DadosCidadeEntrega) {
        return this.http.put<CidadeEntrega>(`${this.baseUrl}/${id}`, dados);
    }

    remover(id: number) {
        return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
    }
}
