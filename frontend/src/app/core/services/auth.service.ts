import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { AuthUser, LoginRequest, AuthResponse } from '../types/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    private baseUrl = environment.apiUrl;

    isLoggedIn = signal<boolean>(false);
    currentUser = signal<AuthUser | null>(null);

    constructor() {
        if (this.isBrowser()) {
            this.isLoggedIn.set(!!localStorage.getItem('token'));
            const raw = localStorage.getItem('user');
            this.currentUser.set(raw ? JSON.parse(raw) : null);
        }
    }

    private isBrowser(): boolean {
        return isPlatformBrowser(this.platformId);
    }

    login(credentials: LoginRequest) {
        return this.http
            .post<AuthResponse>(`${this.baseUrl}/admin/login`, credentials)
            .pipe(tap((res) => this.persistSession(res)));
    }

    logout() {
        this.http.post(`${this.baseUrl}/admin/logout`, {}).subscribe({ error: () => {} });
        this.clearSession();
    }

    clearSession() {
        if (this.isBrowser()) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.isLoggedIn.set(false);
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
    }

    getToken(): string | null {
        if (!this.isBrowser()) return null;
        return localStorage.getItem('token');
    }

    private persistSession(res: AuthResponse) {
        if (this.isBrowser()) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));
        }
        this.isLoggedIn.set(true);
        this.currentUser.set(res.user);
    }
}
