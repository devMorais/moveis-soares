import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { SiteService } from '../services/site.service';

/** Bloqueia o acesso direto por URL a uma pagina cuja secao esteja desligada no admin. */
export const secaoVisivelGuard = (chave: string): CanActivateFn => () => {
    const site = inject(SiteService);
    const router = inject(Router);

    return site.aguardarCarregamento().pipe(
        map((conteudo) => (conteudo.secoesVisiveis[chave] ?? true) || router.parseUrl('/')),
    );
};
