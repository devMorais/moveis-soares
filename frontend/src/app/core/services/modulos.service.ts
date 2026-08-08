import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModulosService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    private modulos = signal<Record<string, boolean>>({});
    private carregado = false;

    /**
     * Busca os modulos habilitados uma unica vez e mantem em cache no
     * signal. Chamadas subsequentes reaproveitam o mesmo dado sem nova
     * requisicao.
     */
    carregar() {
        if (this.carregado) return;
        this.carregado = true;

        return this.http
            .get<Record<string, boolean>>(`${this.baseUrl}/modulos`)
            .pipe(tap((dados) => this.modulos.set(dados)))
            .subscribe({ error: () => (this.carregado = false) });
    }

    estaHabilitado(chave: string): boolean {
        return this.modulos()[chave] ?? false;
    }
}
