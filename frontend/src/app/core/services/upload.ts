import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RespostaUpload {
    url: string;
}

@Injectable({ providedIn: 'root' })
export class Upload {
    private http = inject(HttpClient);

    enviar(arquivo: File, endpoint: string): Observable<HttpEvent<RespostaUpload>> {
        const formData = new FormData();
        formData.append('imagem', arquivo);

        const request = new HttpRequest('POST', endpoint, formData, {
            reportProgress: true,
        });

        return this.http.request<RespostaUpload>(request);
    }
}
