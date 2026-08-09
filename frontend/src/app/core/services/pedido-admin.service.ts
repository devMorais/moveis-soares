import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Pedido, StatusPedido } from '../types/pedido/pedido.type';

@Injectable({ providedIn: 'root' })
export class PedidoAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/pedidos`;

    listar(status?: StatusPedido | null) {
        const params: Record<string, string> = status ? { status } : {};
        return this.http.get<Pedido[]>(this.baseUrl, { params });
    }

    mostrar(id: number) {
        return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
    }

    atualizarStatus(id: number, status: StatusPedido) {
        return this.http.patch<Pedido>(`${this.baseUrl}/${id}/status`, { status });
    }

    assumirAtendimento(id: number) {
        return this.http.patch<Pedido>(`${this.baseUrl}/${id}/atendente`, {});
    }
}
