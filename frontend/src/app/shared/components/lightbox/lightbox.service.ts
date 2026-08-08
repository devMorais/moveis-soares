import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LightboxService {
    imagemAtual = signal<string | null>(null);

    abrir(url: string): void {
        this.imagemAtual.set(url);
    }

    fechar(): void {
        this.imagemAtual.set(null);
    }
}
