import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ContatoPayload {
    nome: string;
    telefone: string;
    email?: string;
    mensagem: string;
    empresa?: string;
}

@Injectable({
    providedIn: 'root',
})
export class ContatoService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/contato`;

    enviar(dados: ContatoPayload): Observable<void> {
        return this.http.post<void>(this.apiUrl, dados);
    }
}
