import { Component } from '@angular/core';
import { ModuloBloqueado } from '../../../shared/components/modulo-bloqueado/modulo-bloqueado';

/**
 * Tela do painel administrativo onde o cliente gerenciaria/publicaria
 * posts do Instagram - modulo NAO incluso no plano Loja Pro, entao fica
 * bloqueada aqui tambem (nao so na secao publica do site, ver
 * home/instagram-secao). Mesmo componente generico, mesma logica.
 */
@Component({
    selector: 'app-admin-instagram',
    imports: [ModuloBloqueado],
    templateUrl: './instagram.html',
    styleUrl: './instagram.scss',
})
export class Instagram {}
