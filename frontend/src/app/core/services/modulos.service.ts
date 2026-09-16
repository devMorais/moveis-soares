import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ModulosService {
    private http = inject(HttpClient);
    private baseUrl = environment.apiUrl;

    private modulos = signal<Record<string, boolean>>({});
    private carregado = false;
    private carregamento$?: Observable<Record<string, boolean>>;

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

    /**
     * Usado por guards de rota que precisam saber se um modulo esta habilitado
     * antes de decidir se a navegacao pode continuar (mesmo padrao de
     * SiteService.aguardarCarregamento) - garante que a resposta da API
     * chegou antes de liberar/bloquear, em vez de ler o signal ainda vazio.
     */
    aguardarCarregamento(): Observable<Record<string, boolean>> {
        if (!this.carregamento$) {
            this.carregamento$ = this.http.get<Record<string, boolean>>(`${this.baseUrl}/modulos`).pipe(
                tap((dados) => this.modulos.set(dados)),
                catchError(() => of(this.modulos())),
                shareReplay(1),
            );
        }
        return this.carregamento$;
    }

    /**
     * padrao: valor assumido quando a chave nao existe na resposta da API.
     * Modulos "add-on" (ex.: instagram) devem usar o padrao false (trancado
     * ate contratar); recursos centrais do site (ex.: vendas_online) devem
     * passar padrao=true, pra uma falha de rede nunca desligar o site sozinha.
     */
    estaHabilitado(chave: string, padrao = false): boolean {
        return this.modulos()[chave] ?? padrao;
    }
}
