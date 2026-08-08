import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ConteudoAdminService } from '../../../core/services/conteudo-admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { UploadImagem } from '../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../environments/environment';

type Aba = 'hero' | 'sobre' | 'contato';

@Component({
    selector: 'app-admin-conteudo',
    imports: [ReactiveFormsModule, UploadImagem],
    templateUrl: './conteudo.html',
    styleUrl: './conteudo.scss',
})
export class Conteudo implements OnInit {
    private fb = inject(FormBuilder);
    private conteudoService = inject(ConteudoAdminService);
    private toast = inject(ToastService);

    uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;

    abaAtiva = signal<Aba>('hero');
    salvando = signal(false);

    formHero = this.fb.nonNullable.group({
        titulo: [''],
        subtitulo: [''],
    });

    formSobre = this.fb.nonNullable.group({
        titulo_historia: [''],
        texto_historia: [''],
        imagem_url: [''],
    });

    formContato = this.fb.nonNullable.group({
        telefone_display: [''],
        telefone_whatsapp: [''],
        email: [''],
        endereco: [''],
        horario: [''],
    });

    ngOnInit(): void {
        this.conteudoService.buscar('hero').subscribe((dados) => this.formHero.patchValue(dados ?? {}));
        this.conteudoService.buscar('sobre').subscribe((dados) => this.formSobre.patchValue(dados ?? {}));
        this.conteudoService.buscar('contato').subscribe((dados) => this.formContato.patchValue(dados ?? {}));
    }

    trocarAba(aba: Aba): void {
        this.abaAtiva.set(aba);
    }

    aoImagemProcessada(url: string): void {
        this.formSobre.patchValue({ imagem_url: url });
    }

    salvar(): void {
        const aba = this.abaAtiva();
        const form = aba === 'hero' ? this.formHero : aba === 'sobre' ? this.formSobre : this.formContato;

        this.salvando.set(true);

        this.conteudoService.atualizar(aba, form.getRawValue()).subscribe({
            next: () => {
                this.salvando.set(false);
                this.toast.sucesso('Conteúdo salvo com sucesso.');
            },
            error: () => {
                this.salvando.set(false);
                this.toast.erro('Não foi possível salvar. Tente novamente.');
            },
        });
    }
}
