import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthUser, UserRole } from '../types/auth/auth-user.type';

export interface UsuarioAdmin extends AuthUser {
    criadoEm: string;
}

export interface DadosUsuario {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class UsuarioAdminService {
    private http = inject(HttpClient);
    private baseUrl = `${environment.apiUrl}/admin/usuarios`;

    listar() {
        return this.http.get<UsuarioAdmin[]>(this.baseUrl);
    }

    criar(dados: DadosUsuario) {
        return this.http.post<UsuarioAdmin>(this.baseUrl, dados);
    }

    atualizar(id: number, dados: DadosUsuario) {
        return this.http.put<UsuarioAdmin>(`${this.baseUrl}/${id}`, dados);
    }

    remover(id: number) {
        return this.http.delete<{ mensagem: string }>(`${this.baseUrl}/${id}`);
    }
}
