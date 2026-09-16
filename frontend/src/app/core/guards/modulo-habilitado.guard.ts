import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ModulosService } from '../services/modulos.service';

/**
 * Bloqueia o acesso direto por URL a uma pagina de um modulo desligado.
 *
 * padrao: valor assumido quando a chave nao existe na resposta da API. Recursos
 * centrais (vendas_online) usam true, pra uma falha de rede nunca derrubar o
 * site; modulos add-on (instagram) usam false, trancados ate serem contratados.
 *
 * destino: pra onde mandar quem foi bloqueado - a home publica por padrao, ou
 * a home do painel quando a rota protegida for do admin (mandar um admin pro
 * site publico pareceria um logout).
 */
export const moduloHabilitadoGuard =
    (chave: string, padrao = true, destino = '/'): CanActivateFn =>
    () => {
        const modulos = inject(ModulosService);
        const router = inject(Router);

        return modulos.aguardarCarregamento().pipe(
            map((dados) => (dados[chave] ?? padrao) || router.parseUrl(destino)),
        );
    };
