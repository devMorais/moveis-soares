import {
    Component,
    ElementRef,
    HostListener,
    OnDestroy,
    OnInit,
    computed,
    inject,
    input,
    output,
    signal,
    viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';

export interface ItemImagem {
    /** Versão grande (tenta primeiro). */
    src: string;
    /** Versão quadrada, usada se a grande não existir (cadastro antigo). */
    fallback: string;
}

@Component({
    selector: 'app-visualizador-imagens',
    imports: [PinchZoomComponent],
    templateUrl: './visualizador-imagens.html',
    styleUrl: './visualizador-imagens.scss',
})
export class VisualizadorImagens implements OnInit, OnDestroy {
    itens = input.required<ItemImagem[]>();
    indiceInicial = input(0);
    descricao = input('Foto do produto');
    fechou = output<void>();

    private doc = inject(DOCUMENT);
    private host = inject<ElementRef<HTMLElement>>(ElementRef);

    private elementoAnterior: HTMLElement | null = null;
    private overflowAnterior = '';
    private toqueInicioX: number | null = null;

    indice = signal(0);
    private falhas = signal<Set<number>>(new Set());
    private zoom = viewChild(PinchZoomComponent);

    temVarias = computed(() => this.itens().length > 1);

    srcAtual = computed(() => {
        const item = this.itens()[this.indice()];
        if (!item) return '';
        return this.falhas().has(this.indice()) ? item.fallback : item.src;
    });

    ngOnInit(): void {
        this.indice.set(this.indiceInicial());

        // Guarda quem tinha o foco (a foto da página) para devolver ao fechar.
        this.elementoAnterior = this.doc.activeElement as HTMLElement | null;

        // Trava a rolagem da página de trás.
        this.overflowAnterior = this.doc.body.style.overflow;
        this.doc.body.style.overflow = 'hidden';

        // Foco para dentro da visualização.
        setTimeout(() => this.focaveis()[0]?.focus());
    }

    ngOnDestroy(): void {
        this.doc.body.style.overflow = this.overflowAnterior;
        this.elementoAnterior?.focus();
    }

    fechar(): void {
        this.fechou.emit();
    }

    anterior(): void {
        const total = this.itens().length;
        this.indice.update((i) => (i - 1 + total) % total);
    }

    proxima(): void {
        const total = this.itens().length;
        this.indice.update((i) => (i + 1) % total);
    }

    /** A grande não existe (produto antigo): cai para a quadrada. */
    aoFalharImagem(): void {
        const item = this.itens()[this.indice()];
        if (!item || item.src === item.fallback) return;
        this.falhas.update((s) => new Set(s).add(this.indice()));
    }

    aoClicarFundo(evento: MouseEvent): void {
        if (evento.target === evento.currentTarget) this.fechar();
    }

    // Arrastar para o lado troca de foto (só com 1 dedo e sem zoom).
    aoTocar(evento: TouchEvent): void {
        this.toqueInicioX = evento.touches.length === 1 ? evento.touches[0].clientX : null;
    }

    aoSoltar(evento: TouchEvent): void {
        const inicio = this.toqueInicioX;
        this.toqueInicioX = null;
        if (inicio === null || !this.temVarias() || this.zoom()?.isZoomedIn) return;

        const deslocamento = evento.changedTouches[0].clientX - inicio;
        if (Math.abs(deslocamento) < 50) return;
        if (deslocamento < 0) this.proxima();
        else this.anterior();
    }

    @HostListener('document:keydown', ['$event'])
    aoTeclar(evento: KeyboardEvent): void {
        if (evento.key === 'Escape') {
            this.fechar();
        } else if (evento.key === 'ArrowLeft' && this.temVarias()) {
            this.anterior();
        } else if (evento.key === 'ArrowRight' && this.temVarias()) {
            this.proxima();
        } else if (evento.key === 'Tab') {
            this.prenderFoco(evento);
        }
    }

    private focaveis(): HTMLElement[] {
        return Array.from(this.host.nativeElement.querySelectorAll<HTMLElement>('button'));
    }

    /** Tab e Shift+Tab giram entre os botões da visualização, sem escapar para a página. */
    private prenderFoco(evento: KeyboardEvent): void {
        const lista = this.focaveis();
        if (lista.length === 0) return;

        const primeiro = lista[0];
        const ultimo = lista[lista.length - 1];
        const ativo = this.doc.activeElement;

        if (!this.host.nativeElement.contains(ativo)) {
            evento.preventDefault();
            primeiro.focus();
        } else if (evento.shiftKey && ativo === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && ativo === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    }
}