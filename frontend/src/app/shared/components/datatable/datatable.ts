import { Component, input, output, signal } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
    AllCommunityModule,
    ColDef,
    ModuleRegistry,
    RowClickedEvent,
    themeQuartz,
} from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * Tema do AG Grid alinhado aos tokens de cor do painel admin
 * (ver admin-tokens.scss) - usado em todas as listagens administrativas.
 */
const TEMA_ADMIN = themeQuartz.withParams({
    accentColor: '#e63329',
    borderRadius: 8,
    headerFontWeight: 700,
    fontFamily: 'inherit',
    headerBackgroundColor: '#fafafa',
    rowHoverColor: '#f5f5f5',
    wrapperBorderRadius: 8,
});

@Component({
    selector: 'app-datatable',
    imports: [AgGridAngular],
    template: `
        <div class="datatable">
            <div class="datatable__barra">
                <div class="datatable__busca">
                    <i class="fas fa-magnifying-glass"></i>
                    <input
                        type="text"
                        placeholder="Buscar..."
                        [value]="textoBusca()"
                        (input)="textoBusca.set($any($event.target).value)"
                    >
                </div>
                <ng-content select="[datatable-acoes]" />
            </div>

            <ag-grid-angular
                class="datatable__grid"
                [theme]="tema"
                [rowData]="linhas()"
                [columnDefs]="colunas()"
                [quickFilterText]="textoBusca()"
                [pagination]="true"
                [paginationPageSize]="paginacao()"
                [paginationPageSizeSelector]="[10, 25, 50, 100]"
                [animateRows]="true"
                [domLayout]="'autoHeight'"
                [suppressCellFocus]="true"
                [overlayNoRowsTemplate]="mensagemVazio()"
                (rowClicked)="aoClicarLinha($event)"
            />
        </div>
    `,
    styleUrl: './datatable.scss',
})
export class Datatable<T = unknown> {
    linhas = input.required<T[]>();
    colunas = input.required<ColDef[]>();
    paginacao = input(25);
    mensagemVazio = input('<span>Nenhum registro encontrado.</span>');
    /** Se true, emite linhaClicada ao clicar em qualquer linha (fora de botoes de acao). */
    linhaClicavel = input(false);

    linhaClicada = output<T>();

    tema = TEMA_ADMIN;
    textoBusca = signal('');

    aoClicarLinha(event: RowClickedEvent<T>): void {
        if (this.linhaClicavel() && event.data) {
            this.linhaClicada.emit(event.data);
        }
    }
}
