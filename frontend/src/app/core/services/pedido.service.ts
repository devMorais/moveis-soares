import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface PedidoItemPayload {
    produto_id: number;
    quantidade: number;
}

export interface CriarPedidoPayload {
    nome_cliente: string;
    telefone_cliente: string;
    endereco: string;
    cidade_entrega_id: number | null;
    cidade_texto_livre: string | null;
    frete_a_combinar: boolean;
    itens: PedidoItemPayload[];
}

export interface StatusPedidoResposta {
    status: string;
    valorTotal: number;
    metodoPagamento: string | null;
    itens: { nomeProduto: string; quantidade: number }[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    criar(payload: CriarPedidoPayload) {
        return this.http.post<{ link: string }>(`${this.baseUrl}/pedidos`, payload);
    }

    verificarStatus(id: number) {
        return this.http.get<StatusPedidoResposta>(`${this.baseUrl}/pedidos/${id}/status`);
    }
}
