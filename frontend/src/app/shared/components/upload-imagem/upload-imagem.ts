import { Component, inject, input, output, signal } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Upload } from '../../../core/services/upload';

@Component({
  selector: 'app-upload-imagem',
  standalone: true,
  templateUrl: './upload-imagem.html',
  styleUrl: './upload-imagem.scss',
})
export class UploadImagem {
  private uploadService = inject(Upload);

  endpoint = input.required<string>();
  /** Quando true, permite selecionar/enviar vários arquivos de uma vez. */
  multiplo = input(false);
  uploadConcluido = output<string>();

  progresso = signal(0);
  enviando = signal(false);
  erro = signal<string | null>(null);
  preview = signal<string | null>(null);

  aoSelecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivos = input.files ? Array.from(input.files) : [];
    if (arquivos.length === 0) {
      return;
    }

    this.erro.set(null);
    this.progresso.set(0);
    this.enviando.set(true);

    this.enviarFila(arquivos, 0);
  }

  private enviarFila(arquivos: File[], indice: number): void {
    if (indice >= arquivos.length) {
      this.enviando.set(false);
      return;
    }

    const arquivo = arquivos[indice];

    if (indice === 0) {
      const leitor = new FileReader();
      leitor.onload = () => this.preview.set(leitor.result as string);
      leitor.readAsDataURL(arquivo);
    }

    this.uploadService.enviar(arquivo, this.endpoint()).subscribe({
      next: (evento) => {
        if (evento.type === HttpEventType.UploadProgress && evento.total) {
          this.progresso.set(Math.round((100 * evento.loaded) / evento.total));
        } else if (evento.type === HttpEventType.Response) {
          const url = evento.body?.url ?? '';
          this.uploadConcluido.emit(url);
          this.enviarFila(arquivos, indice + 1);
        }
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Falha ao enviar a imagem.');
      },
    });
  }
}
