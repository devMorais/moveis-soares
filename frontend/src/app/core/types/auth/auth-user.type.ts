export type UserRole = 'admin' | 'atendente';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}
