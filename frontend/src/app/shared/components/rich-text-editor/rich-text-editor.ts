import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, forwardRef, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import type Quill from 'quill';

@Component({
    selector: 'app-rich-text-editor',
    standalone: true,
    templateUrl: './rich-text-editor.html',
    styleUrl: './rich-text-editor.scss',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RichTextEditor),
            multi: true,
        },
    ],
})
export class RichTextEditor implements AfterViewInit, OnDestroy, ControlValueAccessor {
    private platformId = inject(PLATFORM_ID);

    @ViewChild('editor', { static: true }) private editorEl!: ElementRef<HTMLDivElement>;

    placeholder = input('');
    limiteCaracteres = input(2000);

    caracteres = signal(0);
    desabilitado = signal(false);

    private quill: Quill | null = null;
    private valorInicial = '';
    private onChange: (valor: string | null) => void = () => {};
    private onTouched: () => void = () => {};

    async ngAfterViewInit(): Promise<void> {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        const { default: QuillCtor } = await import('quill');

        this.quill = new QuillCtor(this.editorEl.nativeElement, {
            theme: 'snow',
            placeholder: this.placeholder(),
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ header: [2, 3, false] }],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['blockquote', 'link'],
                    ['clean'],
                ],
            },
        });

        if (this.valorInicial) {
            this.quill.clipboard.dangerouslyPasteHTML(this.valorInicial);
        }

        this.quill.enable(!this.desabilitado());
        this.atualizarContagem();

        this.quill.on('text-change', () => {
            const vazio = (this.quill?.getText() ?? '').trim().length === 0;
            const html = vazio ? null : this.quill!.getSemanticHTML();
            this.atualizarContagem();
            this.onChange(html);
            this.onTouched();
        });
    }

    ngOnDestroy(): void {
        this.quill = null;
    }

    writeValue(valor: string | null): void {
        this.valorInicial = valor ?? '';
        if (this.quill) {
            this.quill.setContents([]);
            if (this.valorInicial) {
                this.quill.clipboard.dangerouslyPasteHTML(this.valorInicial);
            }
            this.atualizarContagem();
        }
    }

    registerOnChange(fn: (valor: string | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(desabilitado: boolean): void {
        this.desabilitado.set(desabilitado);
        this.quill?.enable(!desabilitado);
    }

    private atualizarContagem(): void {
        this.caracteres.set((this.quill?.getText() ?? '').trim().length);
    }
}
