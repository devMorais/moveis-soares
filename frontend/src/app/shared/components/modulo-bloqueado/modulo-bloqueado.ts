import { Component, OnInit, inject, input } from '@angular/core';
import { ModulosService } from '../../../core/services/modulos.service';

const WHATSAPP_DOLEN = '5561995842100';

/**
 * Envolve o conteudo real de um modulo (via ng-content) e so o exibe se
 * esse modulo estiver habilitado para esta instalacao. Caso contrario,
 * mostra um overlay generico de "recurso bloqueado" com CTA de upgrade.
 *
 * Nao tem nenhum texto especifico de cliente - nome do modulo e mensagem
 * sao parametros, pra ser reaproveitavel em qualquer projeto clonado do
 * padrao Dolen/CRC.
 */
@Component({
    selector: 'app-modulo-bloqueado',
    templateUrl: './modulo-bloqueado.html',
    styleUrl: './modulo-bloqueado.scss',
})
export class ModuloBloqueado implements OnInit {
    private modulosService = inject(ModulosService);

    nomeModulo = input.required<string>();
    mensagem = input('Fale com a Dolen para desbloquear este recurso.');

    ngOnInit(): void {
        this.modulosService.carregar();
    }

    get habilitado(): boolean {
        return this.modulosService.estaHabilitado(this.nomeModulo());
    }

    get linkWhatsapp(): string {
        const texto = encodeURIComponent(
            `Olá! Quero saber mais sobre o módulo "${this.nomeModulo()}" para o meu plano.`,
        );
        return `https://wa.me/${WHATSAPP_DOLEN}?text=${texto}`;
    }
}
