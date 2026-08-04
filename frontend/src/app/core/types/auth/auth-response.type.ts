import { AuthUser } from './auth-user.type';

export interface AuthResponse {
    user: AuthUser;
    token: string;
}
