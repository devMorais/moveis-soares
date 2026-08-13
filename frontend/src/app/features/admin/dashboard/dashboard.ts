import { ChangeDetectorRef, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardAdminService, DashboardResumo } from '../../../core/services/dashboard-admin.service';
import { PedidoAdminService } from '../../../core/services/pedido-admin.service';

const ROTULOS_STATUS: Record<string, string> = {
    AGUARDANDO: 'Aguardando',
    PAGO: 'Pago',
    EM_PREPARACAO: 'Em preparação',
    ENVIADO: 'Enviado',
    ENTREGUE: 'Entregue',
    FALHOU: 'Falha no pagamento',
};

const CORES_STATUS = ['#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

@Component({
    selector: 'app-admin-dashboard',
    imports: [RouterLink, BaseChartDirective],
    templateUrl: './dashboard.html',
    styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
    auth = inject(AuthService);
    private dashboardService = inject(DashboardAdminService);
    private pedidosService = inject(PedidoAdminService);
    private cdr = inject(ChangeDetectorRef);

    isAdmin = computed(() => this.auth.currentUser()?.role === 'admin');

    carregando = signal(true);
    resumo = signal<DashboardResumo | null>(null);
    totalAguardando = signal(0);

    vendasChartData = signal<ChartConfiguration<'line'>['data']>({ labels: [], datasets: [] });
    vendasChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
    };

    statusChartData = signal<ChartConfiguration<'doughnut'>['data']>({ labels: [], datasets: [] });
    statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
    };

    ngOnInit(): void {
        if (!this.isAdmin()) {
            this.pedidosService.listar('AGUARDANDO').subscribe({
                next: (pedidos) => {
                    this.totalAguardando.set(pedidos.length);
                    this.carregando.set(false);
                    this.cdr.detectChanges();
                },
                error: () => this.carregando.set(false),
            });
            return;
        }

        this.dashboardService.resumo().subscribe({
            next: (resumo) => {
                this.resumo.set(resumo);
                this.montarGraficos(resumo);
                this.carregando.set(false);
                // O BaseChartDirective (ng2-charts) constroi o Chart.js
                // fora da Angular zone (runOutsideAngular) - isso pode
                // interromper o ciclo de deteccao de mudancas no meio da
                // renderizacao do template, deixando os @for de ranking
                // (que vem depois dos <canvas> no HTML) em branco ate
                // outro evento forcar um novo ciclo. Forcar aqui garante
                // que a pagina toda renderize numa unica passada.
                this.cdr.detectChanges();
            },
            error: () => this.carregando.set(false),
        });
    }

    private montarGraficos(resumo: DashboardResumo): void {
        this.vendasChartData.set({
            labels: resumo.vendasPorDia.map((v) => this.formatarData(v.data)),
            datasets: [
                {
                    label: 'Vendas',
                    data: resumo.vendasPorDia.map((v) => v.total),
                    borderColor: '#e63329',
                    backgroundColor: 'rgba(230, 51, 41, 0.1)',
                    fill: true,
                    tension: 0.3,
                },
            ],
        });

        const statusEntries = Object.entries(resumo.pedidosPorStatus);
        this.statusChartData.set({
            labels: statusEntries.map(([status]) => ROTULOS_STATUS[status] ?? status),
            datasets: [
                {
                    data: statusEntries.map(([, total]) => total),
                    backgroundColor: CORES_STATUS,
                },
            ],
        });
    }

    private formatarData(data: string): string {
        const [, mes, dia] = data.split('-');
        return `${dia}/${mes}`;
    }

    maiorValor(lista: { total: number }[]): number {
        return Math.max(1, ...lista.map((item) => item.total));
    }
}
