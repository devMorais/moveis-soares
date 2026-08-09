import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DashboardKpis {
    totalPedidos: number;
    pedidosNoMes: number;
    faturamentoTotal: number;
    pedidosAguardando: number;
    ticketMedio: number;
    totalProdutos: number;
}

export interface DashboardRanking {
    nome: string;
    total: number;
}

export interface DashboardVendaDia {
    data: string;
    total: number;
}

export interface DashboardResumo {
    kpis: DashboardKpis;
    pedidosPorStatus: Record<string, number>;
    vendasPorDia: DashboardVendaDia[];
    produtosMaisVendidos: DashboardRanking[];
    produtosMaisVisitados: DashboardRanking[];
    categoriasMaisVisitadas: DashboardRanking[];
}

@Injectable({ providedIn: 'root' })
export class DashboardAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/dashboard`;

    resumo() {
        return this.http.get<DashboardResumo>(`${this.baseUrl}/resumo`);
    }
}
