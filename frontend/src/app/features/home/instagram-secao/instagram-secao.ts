import { Component } from '@angular/core';
import { ModuloBloqueado } from '../../../shared/components/modulo-bloqueado/modulo-bloqueado';

/**
 * Secao "Siga a gente no Instagram" da home - modulo NAO incluso no plano
 * Loja Pro contratado pela Moveis Soares, entao fica sempre coberta pelo
 * overlay do ModuloBloqueado neste MVP (ver criterio de aceite MS-ADMIN-05:
 * nao mostra posts reais mesmo que o token um dia seja configurado, so
 * quando o cliente fizer upgrade de fato).
 */
@Component({
    selector: 'app-instagram-secao',
    imports: [ModuloBloqueado],
    templateUrl: './instagram-secao.html',
    styleUrl: './instagram-secao.scss',
})
export class InstagramSecao {
    postsPreview = [1, 2, 3, 4, 5, 6];
}
