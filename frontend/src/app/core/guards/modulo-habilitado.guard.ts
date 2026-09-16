import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { ModulosService } from '../services/modulos.service';

/**
 * Bloqueia o acesso direto por URL a uma pagina de um modulo desligado.
 * Chave ausente vale como habilitado - uma falha na API nunca deve derrubar
 * um recurso central do site (mesma escolha de padrao do estaHabilitado).
 */
export const moduloHabilitadoGuard = (chave: string): CanActivateFn => () => {
    const modulos = inject(ModulosService);
    const router = inject(Router);

    return modulos.aguardarCarregamento().pipe(
        map((dados) => (dados[chave] ?? true) || router.parseUrl('/')),
    );
};
