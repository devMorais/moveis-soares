import { Component, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UploadImagem } from '../../../../shared/components/upload-imagem/upload-imagem';
import { environment } from '../../../../../environments/environment';

interface Categoria {
  valor: string;
  rotulo: string;
}

@Component({
  selector: 'app-novo-produto',
  standalone: true,
  imports: [ReactiveFormsModule, UploadImagem],
  templateUrl: './novo-produto.html',
  styleUrl: './novo-produto.scss',
})
export class NovoProduto {
  private fb = new FormBuilder();

  readonly uploadEndpoint = `${environment.apiUrl}/produtos/upload-imagem`;

  categorias: Categoria[] = [
    { valor: 'sala_estar', rotulo: 'Sala de Estar' },
    { valor: 'sala_jantar', rotulo: 'Sala de Jantar' },
    { valor: 'quarto', rotulo: 'Quarto' },
    { valor: 'cozinha', rotulo: 'Cozinha' },
    { valor: 'escritorio', rotulo: 'Escritório' },
    { valor: 'area_externa', rotulo: 'Área Externa' },
  ];

  imagemUrl = signal<string | null>(null);
  salvoComSucesso = signal(false);

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    categoria: ['', Validators.required],
    preco: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  aoConcluirUpload(url: string): void {
    this.imagemUrl.set(url);
  }

  get imagemPendente(): boolean {
    return !this.imagemUrl();
  }

  salvar(): void {
    if (this.form.invalid || this.imagemPendente) {
      this.form.markAllAsTouched();
      return;
    }

    // TODO: substituir por chamada real a POST /api/produtos quando o
    // backend tiver migration + model + store() de Produto implementados.
    const produtoMock = {
      ...this.form.getRawValue(),
      imagemUrl: this.imagemUrl(),
    };
    console.log('[mock] Produto que seria salvo:', produtoMock);

    this.salvoComSucesso.set(true);
    this.form.reset();
    this.imagemUrl.set(null);
  }
}
