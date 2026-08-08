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
  uploadConcluido = output<string>();

  progresso = signal(0);
  enviando = signal(false);
  erro = signal<string | null>(null);
  preview = signal<string | null>(null);

  aoSelecionarArquivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const arquivo = input.files?.[0];
    if (!arquivo) {
      return;
    }

    this.erro.set(null);
    this.progresso.set(0);

    const leitor = new FileReader();
    leitor.onload = () => this.preview.set(leitor.result as string);
    leitor.readAsDataURL(arquivo);

    this.enviando.set(true);

    this.uploadService.enviar(arquivo, this.endpoint()).subscribe({
      next: (evento) => {
        if (evento.type === HttpEventType.UploadProgress && evento.total) {
          this.progresso.set(Math.round((100 * evento.loaded) / evento.total));
        } else if (evento.type === HttpEventType.Response) {
          this.enviando.set(false);
          const url = evento.body?.url ?? '';
          this.uploadConcluido.emit(url);
        }
      },
      error: () => {
        this.enviando.set(false);
        this.erro.set('Falha ao enviar a imagem.');
      },
    });
  }
}
